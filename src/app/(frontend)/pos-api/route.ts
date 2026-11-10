import {
  addStock,
  checkout,
  deleteProduct,
  getSnapshot,
  PosDatabaseError,
  saveProduct,
  updateSettings,
  type BranchCode,
  type Category,
  type PaymentMethod,
  type Product,
} from '@/lib/pos-database'

const categories = new Set<Category>(['Takoyaki', 'Snacks', 'Drinks', 'Add-ons', 'Other'])
const paymentMethods = new Set<PaymentMethod>(['Cash', 'GCash', 'Card'])

function isBranch(value: unknown): value is BranchCode {
  return value === 'branch1' || value === 'branch2'
}

function parseProduct(value: unknown): (Omit<Product, 'sku' | 'branch'> & { sku?: string }) | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  if (
    typeof input.name !== 'string' ||
    input.name.trim().length < 2 ||
    !categories.has(input.category as Category) ||
    typeof input.price !== 'number' ||
    !Number.isFinite(input.price) ||
    input.price < 0 ||
    typeof input.stock !== 'number' ||
    !Number.isInteger(input.stock) ||
    input.stock < 0 ||
    typeof input.minStock !== 'number' ||
    !Number.isInteger(input.minStock) ||
    input.minStock < 0
  ) {
    return null
  }
  return {
    id: typeof input.id === 'string' ? input.id : '',
    name: input.name.trim().slice(0, 120),
    category: input.category as Category,
    price: input.price,
    stock: input.stock,
    minStock: input.minStock,
    emoji: typeof input.emoji === 'string' ? input.emoji : '',
    color: typeof input.color === 'string' ? input.color : '',
  }
}

function failure(error: unknown) {
  if (error instanceof PosDatabaseError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  console.error(
    'Supabase PostgreSQL operation failed:',
    error instanceof Error ? error.message : 'Unknown database error',
  )
  return Response.json({ error: 'The Supabase database operation failed.' }, { status: 500 })
}

export async function GET() {
  try {
    return Response.json(await getSnapshot(), {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return failure(error)
  }
}

export async function POST(request: Request) {
  let input: Record<string, unknown>
  try {
    input = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  try {
    if (input.action === 'saveProduct') {
      if (!isBranch(input.branch)) {
        return Response.json({ error: 'Select a valid branch.' }, { status: 400 })
      }
      const product = parseProduct(input.product)
      if (!product) {
        return Response.json({ error: 'Enter valid product details.' }, { status: 400 })
      }
      return Response.json(await saveProduct(input.branch, product))
    }

    if (input.action === 'deleteProduct') {
      if (!isBranch(input.branch) || typeof input.id !== 'string') {
        return Response.json({ error: 'Invalid product request.' }, { status: 400 })
      }
      return Response.json(await deleteProduct(input.branch, input.id))
    }

    if (input.action === 'addStock') {
      if (
        !isBranch(input.branch) ||
        typeof input.id !== 'string' ||
        typeof input.quantity !== 'number' ||
        !Number.isInteger(input.quantity) ||
        input.quantity <= 0
      ) {
        return Response.json({ error: 'Enter a valid stock quantity.' }, { status: 400 })
      }
      return Response.json(await addStock(input.branch, input.id, input.quantity))
    }

    if (input.action === 'checkout') {
      if (
        !isBranch(input.branch) ||
        typeof input.cashier !== 'string' ||
        !Array.isArray(input.items) ||
        input.items.length === 0 ||
        typeof input.discount !== 'number' ||
        input.discount < 0 ||
        !paymentMethods.has(input.paymentMethod as PaymentMethod)
      ) {
        return Response.json({ error: 'Invalid checkout details.' }, { status: 400 })
      }
      const items = (input.items as Array<Record<string, unknown>>).map((item) => ({
        productId: typeof item.productId === 'string' ? item.productId : '',
        quantity: typeof item.quantity === 'number' ? item.quantity : 0,
      }))
      if (
        items.some(
          (item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0,
        ) ||
        new Set(items.map((item) => item.productId)).size !== items.length
      ) {
        return Response.json({ error: 'Invalid cart item.' }, { status: 400 })
      }
      const amountReceived =
        typeof input.amountReceived === 'number' && Number.isFinite(input.amountReceived)
          ? input.amountReceived
          : undefined
      return Response.json(
        await checkout({
          branch: input.branch,
          cashier: input.cashier.trim().slice(0, 100),
          items,
          discount: input.discount,
          paymentMethod: input.paymentMethod as PaymentMethod,
          amountReceived,
        }),
      )
    }

    if (input.action === 'updateSettings') {
      if (typeof input.autoPrint !== 'boolean') {
        return Response.json({ error: 'Invalid auto-print setting.' }, { status: 400 })
      }
      return Response.json(await updateSettings(input.autoPrint))
    }

    return Response.json({ error: 'Unknown POS action.' }, { status: 400 })
  } catch (error) {
    return failure(error)
  }
}
