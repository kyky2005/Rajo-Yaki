import 'server-only'

import postgres, { type Sql } from 'postgres'

export type BranchCode = 'branch1' | 'branch2'
export type Category = 'Takoyaki' | 'Snacks' | 'Drinks' | 'Add-ons' | 'Other'
export type PaymentMethod = 'Cash' | 'GCash' | 'Card'
export type TransactionStatus = 'Completed' | 'Pending' | 'Cancelled'

export interface Product {
  id: string
  sku: string
  branch: BranchCode
  name: string
  category: Category
  price: number
  stock: number
  minStock: number
  emoji: string
  color: string
}

export interface Transaction {
  id: string
  date: string
  time: string
  cashier: string
  items: Array<{ name: string; qty: number; price: number }>
  total: number
  payment: PaymentMethod
  status: TransactionStatus
  discount: number
  amountReceived?: number
  branch: BranchCode
}

interface ProductRow {
  id: string
  sku: string
  branch_code: BranchCode
  name: string
  category: Category
  price: string | number
  stock: number
  min_stock: number
  emoji: string
  color: string
}

interface TransactionRow {
  transaction_number: string
  occurred_at: Date | string
  cashier: string
  items: Transaction['items']
  total: string | number
  payment_method: PaymentMethod
  status: TransactionStatus
  discount: string | number
  amount_received: string | number | null
  branch_code: BranchCode
}

export class PosDatabaseError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message)
  }
}

const seedProducts: Product[] = [
  {
    id: 'fbca7653-e281-4a4e-b402-70d9ea7cfb26',
    sku: 'original-takoyaki',
    branch: 'branch1',
    name: 'Original Takoyaki',
    category: 'Takoyaki',
    price: 80,
    stock: 25,
    minStock: 10,
    emoji: '🐙',
    color: '#FFF3E0',
  },
  {
    id: '82f614e5-99e2-4bca-b6e0-0710bd61540b',
    sku: 'cheese-takoyaki',
    branch: 'branch1',
    name: 'Cheese Takoyaki',
    category: 'Takoyaki',
    price: 90,
    stock: 5,
    minStock: 10,
    emoji: '🧀',
    color: '#FFF9C4',
  },
  {
    id: '0152867f-194f-4bfd-a2dc-704f0df3cb08',
    sku: 'spicy-takoyaki',
    branch: 'branch1',
    name: 'Spicy Takoyaki',
    category: 'Takoyaki',
    price: 90,
    stock: 18,
    minStock: 10,
    emoji: '🌶️',
    color: '#FFEBEE',
  },
  {
    id: '617f29ea-d7cd-49e0-a62d-aedb60bdf78c',
    sku: 'overload-takoyaki',
    branch: 'branch1',
    name: 'Overload Takoyaki',
    category: 'Takoyaki',
    price: 110,
    stock: 3,
    minStock: 10,
    emoji: '🔥',
    color: '#FBE9E7',
  },
  {
    id: 'a6f8680a-0605-496e-846d-9d31deeb8257',
    sku: 'french-fries',
    branch: 'branch1',
    name: 'French Fries',
    category: 'Snacks',
    price: 60,
    stock: 20,
    minStock: 10,
    emoji: '🍟',
    color: '#FFF8E1',
  },
  {
    id: '711e6535-db8b-4a1a-b27b-54aa1529a9f2',
    sku: 'iced-tea',
    branch: 'branch1',
    name: 'Iced Tea',
    category: 'Drinks',
    price: 40,
    stock: 2,
    minStock: 10,
    emoji: '🧋',
    color: '#E8F5E9',
  },
  {
    id: 'a2a9c488-58be-4e8e-81fb-9a3cfc508db6',
    sku: 'soft-drinks',
    branch: 'branch1',
    name: 'Soft Drinks',
    category: 'Drinks',
    price: 45,
    stock: 25,
    minStock: 10,
    emoji: '🥤',
    color: '#E3F2FD',
  },
  {
    id: '45d86d82-ee27-4fc0-b47f-e96f23b90a49',
    sku: 'fish-ball',
    branch: 'branch1',
    name: 'Fish Ball',
    category: 'Snacks',
    price: 25,
    stock: 40,
    minStock: 10,
    emoji: '🐟',
    color: '#F3E5F5',
  },
  {
    id: 'a889c6e7-2c65-4531-b6a7-ae265d23557f',
    sku: 'kwek-kwek',
    branch: 'branch1',
    name: 'Kwek-Kwek',
    category: 'Snacks',
    price: 25,
    stock: 35,
    minStock: 10,
    emoji: '🥚',
    color: '#FFF3E0',
  },
  {
    id: '063fdce8-23ad-4c1d-97e9-4ce0cd1ba1b8',
    sku: 'original-takoyaki',
    branch: 'branch2',
    name: 'Original Takoyaki',
    category: 'Takoyaki',
    price: 80,
    stock: 15,
    minStock: 10,
    emoji: '🐙',
    color: '#FFF3E0',
  },
  {
    id: '54574fb0-6e4c-4dc7-91dc-6aa2d81d48d2',
    sku: 'cheese-takoyaki',
    branch: 'branch2',
    name: 'Cheese Takoyaki',
    category: 'Takoyaki',
    price: 90,
    stock: 12,
    minStock: 10,
    emoji: '🧀',
    color: '#FFF9C4',
  },
  {
    id: '3cd65af5-f563-40d6-864d-ecf8efcd4b8d',
    sku: 'spicy-takoyaki',
    branch: 'branch2',
    name: 'Spicy Takoyaki',
    category: 'Takoyaki',
    price: 90,
    stock: 8,
    minStock: 10,
    emoji: '🌶️',
    color: '#FFEBEE',
  },
  {
    id: '249d4206-7e10-4617-9bd4-477ea3f626a9',
    sku: 'overload-takoyaki',
    branch: 'branch2',
    name: 'Overload Takoyaki',
    category: 'Takoyaki',
    price: 110,
    stock: 20,
    minStock: 10,
    emoji: '🔥',
    color: '#FBE9E7',
  },
  {
    id: 'a588e7e8-9891-42e0-893c-4e10896a7d08',
    sku: 'french-fries',
    branch: 'branch2',
    name: 'French Fries',
    category: 'Snacks',
    price: 60,
    stock: 7,
    minStock: 10,
    emoji: '🍟',
    color: '#FFF8E1',
  },
  {
    id: '47971e59-94f1-452d-b1e2-2ac3271890c5',
    sku: 'iced-tea',
    branch: 'branch2',
    name: 'Iced Tea',
    category: 'Drinks',
    price: 40,
    stock: 30,
    minStock: 10,
    emoji: '🧋',
    color: '#E8F5E9',
  },
  {
    id: 'f9810da6-5edc-4747-85e8-4208fdde49a0',
    sku: 'soft-drinks',
    branch: 'branch2',
    name: 'Soft Drinks',
    category: 'Drinks',
    price: 45,
    stock: 18,
    minStock: 10,
    emoji: '🥤',
    color: '#E3F2FD',
  },
  {
    id: '553236e3-8a50-4d63-874d-a8441fcc3de9',
    sku: 'fish-ball',
    branch: 'branch2',
    name: 'Fish Ball',
    category: 'Snacks',
    price: 25,
    stock: 5,
    minStock: 10,
    emoji: '🐟',
    color: '#F3E5F5',
  },
  {
    id: '8eadb0c3-c59c-4d41-afbb-b586a4131ad3',
    sku: 'kwek-kwek',
    branch: 'branch2',
    name: 'Kwek-Kwek',
    category: 'Snacks',
    price: 25,
    stock: 10,
    minStock: 10,
    emoji: '🥚',
    color: '#FFF3E0',
  },
]

const seedTransactions: Array<Transaction & { databaseId: string; occurredAt: string }> = [
  {
    databaseId: '52e66bbe-a2a5-451d-8b7b-cc0d279cb24e',
    id: 'RJ-000124',
    occurredAt: '2024-05-20T02:25:00.000Z',
    date: 'May 20, 2024',
    time: '10:25 AM',
    cashier: 'Branch 1 Staff',
    branch: 'branch1',
    items: [
      { name: 'Original Takoyaki', qty: 2, price: 80 },
      { name: 'Iced Tea', qty: 1, price: 40 },
    ],
    total: 330,
    payment: 'Cash',
    status: 'Completed',
    discount: 0,
    amountReceived: 500,
  },
  {
    databaseId: '4e18f7ae-ea9a-4018-ab82-96fb803ec1ae',
    id: 'RJ-000123',
    occurredAt: '2024-05-20T02:10:00.000Z',
    date: 'May 20, 2024',
    time: '10:10 AM',
    cashier: 'Branch 2 Staff',
    branch: 'branch2',
    items: [
      { name: 'Cheese Takoyaki', qty: 2, price: 90 },
      { name: 'Soft Drinks', qty: 3, price: 45 },
    ],
    total: 450,
    payment: 'GCash',
    status: 'Completed',
    discount: 0,
  },
  {
    databaseId: '1afa86d9-63bb-4197-a691-77f97d739c07',
    id: 'RJ-000122',
    occurredAt: '2024-05-20T01:58:00.000Z',
    date: 'May 20, 2024',
    time: '09:58 AM',
    cashier: 'Branch 1 Staff',
    branch: 'branch1',
    items: [{ name: 'Spicy Takoyaki', qty: 2, price: 90 }],
    total: 180,
    payment: 'Cash',
    status: 'Completed',
    discount: 0,
    amountReceived: 200,
  },
  {
    databaseId: 'ea4e3e75-8bdd-44b1-8ba8-55a0be2ff37d',
    id: 'RJ-000121',
    occurredAt: '2024-05-20T01:30:00.000Z',
    date: 'May 20, 2024',
    time: '09:30 AM',
    cashier: 'Branch 2 Staff',
    branch: 'branch2',
    items: [
      { name: 'Overload Takoyaki', qty: 2, price: 110 },
      { name: 'Iced Tea', qty: 1, price: 40 },
    ],
    total: 260,
    payment: 'Cash',
    status: 'Pending',
    discount: 0,
    amountReceived: 300,
  },
  {
    databaseId: '8fcca214-9092-4ca2-8ae8-caac7f3869d2',
    id: 'RJ-000120',
    occurredAt: '2024-05-20T01:15:00.000Z',
    date: 'May 20, 2024',
    time: '09:15 AM',
    cashier: 'Branch 1 Staff',
    branch: 'branch1',
    items: [{ name: 'French Fries', qty: 2, price: 60 }],
    total: 120,
    payment: 'Cash',
    status: 'Cancelled',
    discount: 0,
  },
  {
    databaseId: 'd26e67f0-6723-4747-9c08-b87b26e09fc8',
    id: 'RJ-000119',
    occurredAt: '2024-05-20T01:00:00.000Z',
    date: 'May 20, 2024',
    time: '09:00 AM',
    cashier: 'Branch 2 Staff',
    branch: 'branch2',
    items: [
      { name: 'Original Takoyaki', qty: 2, price: 80 },
      { name: 'Soft Drinks', qty: 2, price: 45 },
    ],
    total: 290,
    payment: 'GCash',
    status: 'Completed',
    discount: 0,
  },
]

let client: Sql | undefined
let initialization: Promise<void> | undefined

function database() {
  const connectionString = process.env.SUPABASE_DATABASE_URL
  if (!connectionString) {
    throw new PosDatabaseError('SUPABASE_DATABASE_URL is not configured.', 503)
  }
  client ??= postgres(normalizeConnectionString(connectionString), {
    max: 5,
    prepare: false,
    ssl: 'require',
  })
  return client
}

function normalizeConnectionString(connectionString: string) {
  const match = connectionString.match(/^(postgres(?:ql)?:\/\/[^:]+):(.+)@([^/]+\/.*)$/s)
  if (!match) return connectionString

  let password = match[2]
  if (password.startsWith('[') && password.endsWith(']')) {
    password = password.slice(1, -1)
  }

  try {
    password = decodeURIComponent(password)
  } catch {
    // The value is not already URL encoded.
  }

  return `${match[1]}:${encodeURIComponent(password)}@${match[3]}`
}

async function initializeDatabase() {
  const sql = database()
  await sql.begin(async (tx) => {
    const query = tx as unknown as Sql
    await query`
      CREATE TABLE IF NOT EXISTS branches (
        id UUID PRIMARY KEY,
        code TEXT NOT NULL UNIQUE CHECK (code IN ('branch1', 'branch2')),
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await query`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        branch_code TEXT NOT NULL REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT,
        sku TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('Takoyaki', 'Snacks', 'Drinks', 'Add-ons', 'Other')),
        price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        min_stock INTEGER NOT NULL DEFAULT 10 CHECK (min_stock >= 0),
        emoji TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (branch_code, sku)
      )
    `
    await query`CREATE INDEX IF NOT EXISTS products_branch_idx ON products(branch_code)`
    await query`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY,
        transaction_number TEXT NOT NULL UNIQUE,
        branch_code TEXT NOT NULL REFERENCES branches(code) ON UPDATE CASCADE ON DELETE RESTRICT,
        occurred_at TIMESTAMPTZ NOT NULL,
        cashier TEXT NOT NULL,
        items JSONB NOT NULL,
        subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
        discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
        total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
        payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'GCash', 'Card')),
        amount_received NUMERIC(12, 2),
        status TEXT NOT NULL CHECK (status IN ('Completed', 'Pending', 'Cancelled')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await query`CREATE INDEX IF NOT EXISTS transactions_branch_date_idx ON transactions(branch_code, occurred_at DESC)`
    await query`
      CREATE TABLE IF NOT EXISTS pos_settings (
        id SMALLINT PRIMARY KEY CHECK (id = 1),
        auto_print BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    await query`
      INSERT INTO branches (id, code, name, city)
      VALUES
        ('746f6324-dd0e-4894-aa58-e76982cc06bf', 'branch1', 'Branch 1', 'Quezon City'),
        ('c52822bc-9b09-484e-9568-3eaa5371823a', 'branch2', 'Branch 2', 'Makati City')
      ON CONFLICT (code) DO NOTHING
    `
    for (const product of seedProducts) {
      await query`
        INSERT INTO products
          (id, branch_code, sku, name, category, price, stock, min_stock, emoji, color)
        VALUES
          (${product.id}, ${product.branch}, ${product.sku}, ${product.name}, ${product.category},
           ${product.price}, ${product.stock}, ${product.minStock}, ${product.emoji}, ${product.color})
        ON CONFLICT (id) DO NOTHING
      `
    }
    for (const transaction of seedTransactions) {
      const subtotal = transaction.items.reduce((sum, item) => sum + item.price * item.qty, 0)
      await query`
        INSERT INTO transactions
          (id, transaction_number, branch_code, occurred_at, cashier, items, subtotal,
           discount, total, payment_method, amount_received, status)
        VALUES
          (${transaction.databaseId}, ${transaction.id}, ${transaction.branch}, ${transaction.occurredAt},
           ${transaction.cashier}, ${query.json(transaction.items)}, ${subtotal}, ${transaction.discount},
           ${transaction.total}, ${transaction.payment}, ${transaction.amountReceived ?? null},
           ${transaction.status})
        ON CONFLICT (transaction_number) DO NOTHING
      `
    }
    await query`
      INSERT INTO pos_settings (id, auto_print)
      VALUES (1, FALSE)
      ON CONFLICT (id) DO NOTHING
    `
  })
}

async function ready() {
  initialization ??= initializeDatabase().catch((error) => {
    initialization = undefined
    throw error
  })
  await initialization
  return database()
}

function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    branch: row.branch_code,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    stock: row.stock,
    minStock: row.min_stock,
    emoji: row.emoji,
    color: row.color,
  }
}

function transactionFromRow(row: TransactionRow): Transaction {
  const occurredAt = new Date(row.occurred_at)
  return {
    id: row.transaction_number,
    date: occurredAt.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    }),
    time: occurredAt.toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila',
    }),
    cashier: row.cashier,
    items: row.items,
    total: Number(row.total),
    payment: row.payment_method,
    status: row.status,
    discount: Number(row.discount),
    amountReceived: row.amount_received === null ? undefined : Number(row.amount_received),
    branch: row.branch_code,
  }
}

export async function getSnapshot() {
  const sql = await ready()
  const [products, transactions, settings] = await Promise.all([
    sql<ProductRow[]>`SELECT * FROM products ORDER BY name, branch_code`,
    sql<
      TransactionRow[]
    >`SELECT * FROM transactions ORDER BY occurred_at DESC, transaction_number DESC LIMIT 500`,
    sql<Array<{ auto_print: boolean }>>`SELECT auto_print FROM pos_settings WHERE id = 1`,
  ])
  return {
    products: products.map(productFromRow),
    transactions: transactions.map(transactionFromRow),
    autoPrint: settings[0]?.auto_print ?? false,
  }
}

export async function saveProduct(
  branch: BranchCode,
  product: Omit<Product, 'sku' | 'branch'> & { sku?: string },
) {
  const sql = await ready()
  const look = appearance(product.category)
  if (product.id) {
    const updated = await sql`
      UPDATE products
      SET name = ${product.name}, category = ${product.category}, price = ${product.price},
          stock = ${product.stock}, min_stock = ${product.minStock}, emoji = ${look.emoji},
          color = ${look.color}, updated_at = NOW()
      WHERE id = ${product.id} AND branch_code = ${branch}
      RETURNING id
    `
    if (!updated.length) throw new PosDatabaseError('Product does not belong to this branch.', 403)
  } else {
    const sku = `${slugify(product.name) || 'product'}-${Date.now()}`
    await sql`
      INSERT INTO products
        (id, branch_code, sku, name, category, price, stock, min_stock, emoji, color)
      VALUES
        (${crypto.randomUUID()}, ${branch}, ${sku}, ${product.name}, ${product.category},
         ${product.price}, ${product.stock}, ${product.minStock}, ${look.emoji}, ${look.color})
    `
  }
  return getSnapshot()
}

export async function deleteProduct(branch: BranchCode, id: string) {
  const sql = await ready()
  const deleted = await sql`
    DELETE FROM products
    WHERE id = ${id} AND branch_code = ${branch}
    RETURNING id
  `
  if (!deleted.length) throw new PosDatabaseError('Product does not belong to this branch.', 403)
  return getSnapshot()
}

export async function addStock(branch: BranchCode, id: string, quantity: number) {
  const sql = await ready()
  const updated = await sql`
    UPDATE products
    SET stock = stock + ${quantity}, updated_at = NOW()
    WHERE id = ${id} AND branch_code = ${branch}
    RETURNING id
  `
  if (!updated.length) throw new PosDatabaseError('Product does not belong to this branch.', 403)
  return getSnapshot()
}

export async function checkout(input: {
  branch: BranchCode
  cashier: string
  items: Array<{ productId: string; quantity: number }>
  discount: number
  paymentMethod: PaymentMethod
  amountReceived?: number
}) {
  const sql = await ready()
  const transaction = await sql.begin(async (tx) => {
    const query = tx as unknown as Sql
    await query`SELECT pg_advisory_xact_lock(191201)`
    const ids = input.items.map((item) => item.productId)
    const rows = await query<ProductRow[]>`
      SELECT * FROM products
      WHERE id IN ${query(ids)} AND branch_code = ${input.branch}
      FOR UPDATE
    `
    const byID = new Map(rows.map((row) => [row.id, row]))
    const resolved = input.items.map((item) => {
      const product = byID.get(item.productId)
      if (!product)
        throw new PosDatabaseError('A cart product does not belong to this branch.', 403)
      if (product.stock < item.quantity) {
        throw new PosDatabaseError(`${product.name} does not have enough stock.`, 409)
      }
      return { product, quantity: item.quantity }
    })
    const subtotal = resolved.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    )
    const discount = Math.min(input.discount, subtotal)
    const total = subtotal - discount
    if (input.paymentMethod === 'Cash' && (input.amountReceived ?? 0) < total) {
      throw new PosDatabaseError('The received amount is below the total.')
    }
    const sequence = await query<Array<{ next_number: number }>>`
      SELECT COALESCE(MAX(SUBSTRING(transaction_number FROM 4)::INTEGER), 124) + 1 AS next_number
      FROM transactions
    `
    const transactionNumber = `RJ-${String(sequence[0].next_number).padStart(6, '0')}`
    for (const item of resolved) {
      await query`
        UPDATE products
        SET stock = stock - ${item.quantity}, updated_at = NOW()
        WHERE id = ${item.product.id}
      `
    }
    const items = resolved.map((item) => ({
      name: item.product.name,
      qty: item.quantity,
      price: Number(item.product.price),
    }))
    const inserted = await query<TransactionRow[]>`
      INSERT INTO transactions
        (id, transaction_number, branch_code, occurred_at, cashier, items, subtotal,
         discount, total, payment_method, amount_received, status)
      VALUES
        (${crypto.randomUUID()}, ${transactionNumber}, ${input.branch}, NOW(), ${input.cashier},
         ${query.json(items)}, ${subtotal}, ${discount}, ${total}, ${input.paymentMethod},
         ${input.amountReceived ?? null}, 'Completed')
      RETURNING *
    `
    return transactionFromRow(inserted[0])
  })
  return { transaction, ...(await getSnapshot()) }
}

export async function updateSettings(autoPrint: boolean) {
  const sql = await ready()
  await sql`
    INSERT INTO pos_settings (id, auto_print, updated_at)
    VALUES (1, ${autoPrint}, NOW())
    ON CONFLICT (id)
    DO UPDATE SET auto_print = EXCLUDED.auto_print, updated_at = NOW()
  `
  return { autoPrint }
}

function appearance(category: Category) {
  return {
    emoji: {
      Takoyaki: '🐙',
      Snacks: '🍟',
      Drinks: '🥤',
      'Add-ons': '🌶️',
      Other: '🎁',
    }[category],
    color: {
      Takoyaki: '#FFF3E0',
      Snacks: '#FFF8E1',
      Drinks: '#E3F2FD',
      'Add-ons': '#FFEBEE',
      Other: '#F3E5F5',
    }[category],
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
