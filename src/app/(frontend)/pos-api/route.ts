import config from '@payload-config'
import { getPayload } from 'payload'
import type { Branch, Product, Transaction } from '@/payload-types'

type BranchCode = 'branch1' | 'branch2'
type ProductInput = {
  id?: string
  name: string
  category: Product['category']
  price: number
  stock: number
  minStock: number
}

const productCategories = new Set<Product['category']>([
  'Takoyaki',
  'Snacks',
  'Drinks',
  'Add-ons',
  'Other',
])
const paymentMethods = new Set<Transaction['paymentMethod']>(['Cash', 'GCash', 'Card'])

function isBranchCode(value: unknown): value is BranchCode {
  return value === 'branch1' || value === 'branch2'
}

function relationshipID(value: string | Branch): string {
  return typeof value === 'string' ? value : value.id
}

function branchCode(value: string | Branch, branches: Branch[]): BranchCode {
  const id = relationshipID(value)
  return branches.find((branch) => branch.id === id)?.code ?? 'branch1'
}

function productJSON(product: Product, branches: Branch[]) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
    minStock: product.minStock,
    emoji: product.emoji,
    color: product.color,
    branch: branchCode(product.branch, branches),
  }
}

function transactionJSON(transaction: Transaction, branches: Branch[]) {
  const date = new Date(transaction.occurredAt)
  return {
    id: transaction.transactionNumber,
    date: date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    }),
    time: date.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila',
    }),
    cashier: transaction.cashier,
    items: (transaction.items ?? []).map((item) => ({
      name: item.productName,
      qty: item.quantity,
      price: item.unitPrice,
    })),
    total: transaction.total,
    payment: transaction.paymentMethod,
    status: transaction.status,
    discount: transaction.discount,
    amountReceived: transaction.amountReceived ?? undefined,
    branch: branchCode(transaction.branch, branches),
  }
}

async function context(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  const branchResult = await payload.find({
    collection: 'branches',
    depth: 0,
    limit: 10,
    overrideAccess: false,
    user,
  })
  return { payload, user, branches: branchResult.docs }
}

function branchByCode(branches: Branch[], code: BranchCode) {
  return branches.find((branch) => branch.code === code)
}

function parseProduct(value: unknown): ProductInput | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  if (
    typeof input.name !== 'string' ||
    input.name.trim().length < 2 ||
    !productCategories.has(input.category as Product['category']) ||
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
    id: typeof input.id === 'string' ? input.id : undefined,
    name: input.name.trim().slice(0, 120),
    category: input.category as Product['category'],
    price: input.price,
    stock: input.stock,
    minStock: input.minStock,
  }
}

function appearance(category: Product['category']) {
  const emoji = {
    Takoyaki: '🐙',
    Snacks: '🍟',
    Drinks: '🥤',
    'Add-ons': '🌶️',
    Other: '🎁',
  }[category]
  const color = {
    Takoyaki: '#FFF3E0',
    Snacks: '#FFF8E1',
    Drinks: '#E3F2FD',
    'Add-ons': '#FFEBEE',
    Other: '#F3E5F5',
  }[category]
  return { emoji, color }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET(request: Request) {
  const { payload, user, branches } = await context(request)
  const [products, transactions, settings] = await Promise.all([
    payload.find({
      collection: 'products',
      depth: 0,
      limit: 100,
      sort: 'name',
      overrideAccess: false,
      user,
    }),
    payload.find({
      collection: 'transactions',
      depth: 0,
      limit: 100,
      sort: '-occurredAt',
      overrideAccess: false,
      user,
    }),
    payload.findGlobal({
      slug: 'pos-settings',
      depth: 0,
      overrideAccess: false,
      user,
    }),
  ])

  return Response.json({
    products: products.docs.map((product) => productJSON(product, branches)),
    transactions: transactions.docs.map((transaction) => transactionJSON(transaction, branches)),
    autoPrint: settings.autoPrint,
  })
}

export async function POST(request: Request) {
  let input: Record<string, unknown>
  try {
    input = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { payload, user, branches } = await context(request)

  if (input.action === 'saveProduct') {
    if (!isBranchCode(input.branch)) {
      return Response.json({ error: 'Select a valid branch.' }, { status: 400 })
    }
    const data = parseProduct(input.product)
    const branch = branchByCode(branches, input.branch)
    if (!data || !branch) {
      return Response.json({ error: 'Enter valid product details.' }, { status: 400 })
    }

    if (data.id) {
      const existing = await payload.findByID({
        collection: 'products',
        id: data.id,
        depth: 0,
        overrideAccess: false,
        user,
      })
      if (relationshipID(existing.branch) !== branch.id) {
        return Response.json({ error: 'Product does not belong to this branch.' }, { status: 403 })
      }
      await payload.update({
        collection: 'products',
        id: data.id,
        data: {
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          minStock: data.minStock,
          ...appearance(data.category),
        },
        overrideAccess: false,
        user,
      })
    } else {
      const sku = `${slugify(data.name) || 'product'}-${Date.now()}`
      await payload.create({
        collection: 'products',
        data: {
          recordKey: `${input.branch}-${sku}`,
          sku,
          branch: branch.id,
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          minStock: data.minStock,
          ...appearance(data.category),
        },
        overrideAccess: false,
        user,
      })
    }
    return GET(request)
  }

  if (input.action === 'deleteProduct') {
    if (!isBranchCode(input.branch) || typeof input.id !== 'string') {
      return Response.json({ error: 'Invalid product request.' }, { status: 400 })
    }
    const branch = branchByCode(branches, input.branch)
    const existing = await payload.findByID({
      collection: 'products',
      id: input.id,
      depth: 0,
      overrideAccess: false,
      user,
    })
    if (!branch || relationshipID(existing.branch) !== branch.id) {
      return Response.json({ error: 'Product does not belong to this branch.' }, { status: 403 })
    }
    await payload.delete({
      collection: 'products',
      id: input.id,
      overrideAccess: false,
      user,
    })
    return GET(request)
  }

  if (input.action === 'addStock') {
    if (
      !isBranchCode(input.branch) ||
      typeof input.id !== 'string' ||
      typeof input.quantity !== 'number' ||
      !Number.isInteger(input.quantity) ||
      input.quantity <= 0
    ) {
      return Response.json({ error: 'Enter a valid stock quantity.' }, { status: 400 })
    }
    const branch = branchByCode(branches, input.branch)
    const existing = await payload.findByID({
      collection: 'products',
      id: input.id,
      depth: 0,
      overrideAccess: false,
      user,
    })
    if (!branch || relationshipID(existing.branch) !== branch.id) {
      return Response.json({ error: 'Product does not belong to this branch.' }, { status: 403 })
    }
    await payload.update({
      collection: 'products',
      id: input.id,
      data: { stock: existing.stock + input.quantity },
      overrideAccess: false,
      user,
    })
    return GET(request)
  }

  if (input.action === 'checkout') {
    if (
      !isBranchCode(input.branch) ||
      typeof input.cashier !== 'string' ||
      !Array.isArray(input.items) ||
      input.items.length === 0 ||
      typeof input.discount !== 'number' ||
      input.discount < 0 ||
      !paymentMethods.has(input.paymentMethod as Transaction['paymentMethod'])
    ) {
      return Response.json({ error: 'Invalid checkout details.' }, { status: 400 })
    }
    const branch = branchByCode(branches, input.branch)
    if (!branch) return Response.json({ error: 'Branch was not found.' }, { status: 404 })

    const requestedItems = input.items as Array<Record<string, unknown>>
    const resolved = []
    for (const item of requestedItems) {
      if (
        typeof item.productId !== 'string' ||
        typeof item.quantity !== 'number' ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return Response.json({ error: 'Invalid cart item.' }, { status: 400 })
      }
      const product = await payload.findByID({
        collection: 'products',
        id: item.productId,
        depth: 0,
        overrideAccess: false,
        user,
      })
      if (relationshipID(product.branch) !== branch.id || product.stock < item.quantity) {
        return Response.json(
          { error: `${product.name} does not have enough stock.` },
          { status: 409 },
        )
      }
      resolved.push({ product, quantity: item.quantity })
    }

    const subtotal = resolved.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const discount = Math.min(input.discount, subtotal)
    const total = subtotal - discount
    const amountReceived =
      typeof input.amountReceived === 'number' && Number.isFinite(input.amountReceived)
        ? input.amountReceived
        : undefined
    if ((input.paymentMethod === 'Cash' && (amountReceived ?? 0) < total) || total < 0) {
      return Response.json({ error: 'The received amount is below the total.' }, { status: 400 })
    }

    const recent = await payload.find({
      collection: 'transactions',
      depth: 0,
      limit: 1,
      sort: '-transactionNumber',
      overrideAccess: false,
      user,
    })
    const previous = Number.parseInt(
      recent.docs[0]?.transactionNumber.replace('RJ-', '') ?? '124',
      10,
    )
    const transactionNumber = `RJ-${String(previous + 1).padStart(6, '0')}`

    for (const item of resolved) {
      await payload.update({
        collection: 'products',
        id: item.product.id,
        data: { stock: item.product.stock - item.quantity },
        overrideAccess: false,
        user,
      })
    }

    const transaction = await payload.create({
      collection: 'transactions',
      data: {
        transactionNumber,
        branch: branch.id,
        occurredAt: new Date().toISOString(),
        cashier: input.cashier.trim().slice(0, 100),
        items: resolved.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        subtotal,
        discount,
        total,
        paymentMethod: input.paymentMethod as Transaction['paymentMethod'],
        amountReceived,
        status: 'Completed',
      },
      overrideAccess: false,
      user,
    })

    return Response.json({
      transaction: transactionJSON(transaction, branches),
      ...(await (await GET(request)).json()),
    })
  }

  if (input.action === 'updateSettings') {
    if (typeof input.autoPrint !== 'boolean') {
      return Response.json({ error: 'Invalid auto-print setting.' }, { status: 400 })
    }
    await payload.updateGlobal({
      slug: 'pos-settings',
      data: { autoPrint: input.autoPrint },
      overrideAccess: false,
      user,
    })
    return Response.json({ autoPrint: input.autoPrint })
  }

  return Response.json({ error: 'Unknown POS action.' }, { status: 400 })
}
