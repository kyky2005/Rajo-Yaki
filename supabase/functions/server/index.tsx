import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

type BranchCode = "branch1" | "branch2";
type Category = "Takoyaki" | "Snacks" | "Drinks" | "Add-ons" | "Other";
type PaymentMethod = "Cash" | "GCash" | "Card";
type TransactionStatus = "Completed" | "Pending" | "Cancelled";

interface Product {
  id: string;
  sku: string;
  branch: BranchCode;
  name: string;
  category: Category;
  price: number;
  stock: number;
  minStock: number;
  emoji: string;
  color: string;
}

interface Transaction {
  id: string;
  date: string;
  time: string;
  cashier: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  payment: PaymentMethod;
  status: TransactionStatus;
  discount: number;
  amountReceived?: number;
  branch: BranchCode;
}

interface PosState {
  version: 1;
  products: Product[];
  transactions: Transaction[];
  autoPrint: boolean;
}

const stateKey = "rojo-yaki:pos-state:v1";
const categories = new Set<Category>(["Takoyaki", "Snacks", "Drinks", "Add-ons", "Other"]);
const paymentMethods = new Set<PaymentMethod>(["Cash", "GCash", "Card"]);

const seedProducts: Product[] = [
  { id: "fbca7653-e281-4a4e-b402-70d9ea7cfb26", sku: "original-takoyaki", branch: "branch1", name: "Original Takoyaki", category: "Takoyaki", price: 80, stock: 25, minStock: 10, emoji: "🐙", color: "#FFF3E0" },
  { id: "82f614e5-99e2-4bca-b6e0-0710bd61540b", sku: "cheese-takoyaki", branch: "branch1", name: "Cheese Takoyaki", category: "Takoyaki", price: 90, stock: 5, minStock: 10, emoji: "🧀", color: "#FFF9C4" },
  { id: "0152867f-194f-4bfd-a2dc-704f0df3cb08", sku: "spicy-takoyaki", branch: "branch1", name: "Spicy Takoyaki", category: "Takoyaki", price: 90, stock: 18, minStock: 10, emoji: "🌶️", color: "#FFEBEE" },
  { id: "617f29ea-d7cd-49e0-a62d-aedb60bdf78c", sku: "overload-takoyaki", branch: "branch1", name: "Overload Takoyaki", category: "Takoyaki", price: 110, stock: 3, minStock: 10, emoji: "🔥", color: "#FBE9E7" },
  { id: "a6f8680a-0605-496e-846d-9d31deeb8257", sku: "french-fries", branch: "branch1", name: "French Fries", category: "Snacks", price: 60, stock: 20, minStock: 10, emoji: "🍟", color: "#FFF8E1" },
  { id: "711e6535-db8b-4a1a-b27b-54aa1529a9f2", sku: "iced-tea", branch: "branch1", name: "Iced Tea", category: "Drinks", price: 40, stock: 2, minStock: 10, emoji: "🧋", color: "#E8F5E9" },
  { id: "a2a9c488-58be-4e8e-81fb-9a3cfc508db6", sku: "soft-drinks", branch: "branch1", name: "Soft Drinks", category: "Drinks", price: 45, stock: 25, minStock: 10, emoji: "🥤", color: "#E3F2FD" },
  { id: "45d86d82-ee27-4fc0-b47f-e96f23b90a49", sku: "fish-ball", branch: "branch1", name: "Fish Ball", category: "Snacks", price: 25, stock: 40, minStock: 10, emoji: "🐟", color: "#F3E5F5" },
  { id: "a889c6e7-2c65-4531-b6a7-ae265d23557f", sku: "kwek-kwek", branch: "branch1", name: "Kwek-Kwek", category: "Snacks", price: 25, stock: 35, minStock: 10, emoji: "🥚", color: "#FFF3E0" },
  { id: "063fdce8-23ad-4c1d-97e9-4ce0cd1ba1b8", sku: "original-takoyaki", branch: "branch2", name: "Original Takoyaki", category: "Takoyaki", price: 80, stock: 15, minStock: 10, emoji: "🐙", color: "#FFF3E0" },
  { id: "54574fb0-6e4c-4dc7-91dc-6aa2d81d48d2", sku: "cheese-takoyaki", branch: "branch2", name: "Cheese Takoyaki", category: "Takoyaki", price: 90, stock: 12, minStock: 10, emoji: "🧀", color: "#FFF9C4" },
  { id: "3cd65af5-f563-40d6-864d-ecf8efcd4b8d", sku: "spicy-takoyaki", branch: "branch2", name: "Spicy Takoyaki", category: "Takoyaki", price: 90, stock: 8, minStock: 10, emoji: "🌶️", color: "#FFEBEE" },
  { id: "249d4206-7e10-4617-9bd4-477ea3f626a9", sku: "overload-takoyaki", branch: "branch2", name: "Overload Takoyaki", category: "Takoyaki", price: 110, stock: 20, minStock: 10, emoji: "🔥", color: "#FBE9E7" },
  { id: "a588e7e8-9891-42e0-893c-4e10896a7d08", sku: "french-fries", branch: "branch2", name: "French Fries", category: "Snacks", price: 60, stock: 7, minStock: 10, emoji: "🍟", color: "#FFF8E1" },
  { id: "47971e59-94f1-452d-b1e2-2ac3271890c5", sku: "iced-tea", branch: "branch2", name: "Iced Tea", category: "Drinks", price: 40, stock: 30, minStock: 10, emoji: "🧋", color: "#E8F5E9" },
  { id: "f9810da6-5edc-4747-85e8-4208fdde49a0", sku: "soft-drinks", branch: "branch2", name: "Soft Drinks", category: "Drinks", price: 45, stock: 18, minStock: 10, emoji: "🥤", color: "#E3F2FD" },
  { id: "553236e3-8a50-4d63-874d-a8441fcc3de9", sku: "fish-ball", branch: "branch2", name: "Fish Ball", category: "Snacks", price: 25, stock: 5, minStock: 10, emoji: "🐟", color: "#F3E5F5" },
  { id: "8eadb0c3-c59c-4d41-afbb-b586a4131ad3", sku: "kwek-kwek", branch: "branch2", name: "Kwek-Kwek", category: "Snacks", price: 25, stock: 10, minStock: 10, emoji: "🥚", color: "#FFF3E0" },
];

const seedTransactions: Transaction[] = [
  { id: "RJ-000124", date: "May 20, 2024", time: "10:25 AM", cashier: "Branch 1 Staff", branch: "branch1", items: [{ name: "Original Takoyaki", qty: 2, price: 80 }, { name: "Iced Tea", qty: 1, price: 40 }], total: 330, payment: "Cash", status: "Completed", discount: 0, amountReceived: 500 },
  { id: "RJ-000123", date: "May 20, 2024", time: "10:10 AM", cashier: "Branch 2 Staff", branch: "branch2", items: [{ name: "Cheese Takoyaki", qty: 2, price: 90 }, { name: "Soft Drinks", qty: 3, price: 45 }], total: 450, payment: "GCash", status: "Completed", discount: 0 },
  { id: "RJ-000122", date: "May 20, 2024", time: "09:58 AM", cashier: "Branch 1 Staff", branch: "branch1", items: [{ name: "Spicy Takoyaki", qty: 2, price: 90 }], total: 180, payment: "Cash", status: "Completed", discount: 0, amountReceived: 200 },
  { id: "RJ-000121", date: "May 20, 2024", time: "09:30 AM", cashier: "Branch 2 Staff", branch: "branch2", items: [{ name: "Overload Takoyaki", qty: 2, price: 110 }, { name: "Iced Tea", qty: 1, price: 40 }], total: 260, payment: "Cash", status: "Pending", discount: 0, amountReceived: 300 },
  { id: "RJ-000120", date: "May 20, 2024", time: "09:15 AM", cashier: "Branch 1 Staff", branch: "branch1", items: [{ name: "French Fries", qty: 2, price: 60 }], total: 120, payment: "Cash", status: "Cancelled", discount: 0 },
  { id: "RJ-000119", date: "May 20, 2024", time: "09:00 AM", cashier: "Branch 2 Staff", branch: "branch2", items: [{ name: "Original Takoyaki", qty: 2, price: 80 }, { name: "Soft Drinks", qty: 2, price: 45 }], total: 290, payment: "GCash", status: "Completed", discount: 0 },
];

const initialState = (): PosState => ({
  version: 1,
  products: structuredClone(seedProducts),
  transactions: structuredClone(seedTransactions),
  autoPrint: false,
});

async function readState(): Promise<PosState> {
  const stored = await kv.get(stateKey);
  if (stored?.version === 1 && Array.isArray(stored.products) && Array.isArray(stored.transactions)) {
    return stored as PosState;
  }
  const state = initialState();
  await kv.set(stateKey, state);
  return state;
}

async function writeState(state: PosState) {
  await kv.set(stateKey, state);
}

function isBranch(value: unknown): value is BranchCode {
  return value === "branch1" || value === "branch2";
}

function parseProduct(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (
    typeof input.name !== "string" ||
    input.name.trim().length < 2 ||
    !categories.has(input.category as Category) ||
    typeof input.price !== "number" ||
    !Number.isFinite(input.price) ||
    input.price < 0 ||
    typeof input.stock !== "number" ||
    !Number.isInteger(input.stock) ||
    input.stock < 0 ||
    typeof input.minStock !== "number" ||
    !Number.isInteger(input.minStock) ||
    input.minStock < 0
  ) {
    return null;
  }
  return {
    id: typeof input.id === "string" ? input.id : undefined,
    name: input.name.trim().slice(0, 120),
    category: input.category as Category,
    price: input.price,
    stock: input.stock,
    minStock: input.minStock,
  };
}

function appearance(category: Category) {
  return {
    emoji: { Takoyaki: "🐙", Snacks: "🍟", Drinks: "🥤", "Add-ons": "🌶️", Other: "🎁" }[category],
    color: { Takoyaki: "#FFF3E0", Snacks: "#FFF8E1", Drinks: "#E3F2FD", "Add-ons": "#FFEBEE", Other: "#F3E5F5" }[category],
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function publicState(state: PosState) {
  return {
    products: [...state.products].sort((a, b) => a.name.localeCompare(b.name)),
    transactions: state.transactions,
    autoPrint: state.autoPrint,
  };
}

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-8ecee8ab/health", (c) => c.json({ status: "ok", backend: "supabase-postgresql" }));

app.get("/make-server-8ecee8ab/pos", async (c) => {
  try {
    return c.json(publicState(await readState()));
  } catch (error) {
    console.error("Failed to load POS state", error);
    return c.json({ error: "The Supabase database is unavailable." }, 500);
  }
});

app.post("/make-server-8ecee8ab/pos", async (c) => {
  let input: Record<string, unknown>;
  try {
    input = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body." }, 400);
  }

  try {
    const state = await readState();

    if (input.action === "saveProduct") {
      if (!isBranch(input.branch)) return c.json({ error: "Select a valid branch." }, 400);
      const data = parseProduct(input.product);
      if (!data) return c.json({ error: "Enter valid product details." }, 400);

      if (data.id) {
        const index = state.products.findIndex((product) => product.id === data.id);
        const existing = state.products[index];
        if (!existing || existing.branch !== input.branch) {
          return c.json({ error: "Product does not belong to this branch." }, 403);
        }
        state.products[index] = { ...existing, ...data, ...appearance(data.category) };
      } else {
        const sku = `${slugify(data.name) || "product"}-${Date.now()}`;
        state.products.push({
          id: crypto.randomUUID(),
          sku,
          branch: input.branch,
          name: data.name,
          category: data.category,
          price: data.price,
          stock: data.stock,
          minStock: data.minStock,
          ...appearance(data.category),
        });
      }
      await writeState(state);
      return c.json(publicState(state));
    }

    if (input.action === "deleteProduct") {
      if (!isBranch(input.branch) || typeof input.id !== "string") {
        return c.json({ error: "Invalid product request." }, 400);
      }
      const product = state.products.find((item) => item.id === input.id);
      if (!product || product.branch !== input.branch) {
        return c.json({ error: "Product does not belong to this branch." }, 403);
      }
      state.products = state.products.filter((item) => item.id !== input.id);
      await writeState(state);
      return c.json(publicState(state));
    }

    if (input.action === "addStock") {
      if (
        !isBranch(input.branch) ||
        typeof input.id !== "string" ||
        typeof input.quantity !== "number" ||
        !Number.isInteger(input.quantity) ||
        input.quantity <= 0
      ) {
        return c.json({ error: "Enter a valid stock quantity." }, 400);
      }
      const product = state.products.find((item) => item.id === input.id);
      if (!product || product.branch !== input.branch) {
        return c.json({ error: "Product does not belong to this branch." }, 403);
      }
      product.stock += input.quantity;
      await writeState(state);
      return c.json(publicState(state));
    }

    if (input.action === "checkout") {
      if (
        !isBranch(input.branch) ||
        typeof input.cashier !== "string" ||
        !Array.isArray(input.items) ||
        input.items.length === 0 ||
        typeof input.discount !== "number" ||
        input.discount < 0 ||
        !paymentMethods.has(input.paymentMethod as PaymentMethod)
      ) {
        return c.json({ error: "Invalid checkout details." }, 400);
      }

      const resolved: Array<{ product: Product; quantity: number }> = [];
      for (const rawItem of input.items as Array<Record<string, unknown>>) {
        if (
          typeof rawItem.productId !== "string" ||
          typeof rawItem.quantity !== "number" ||
          !Number.isInteger(rawItem.quantity) ||
          rawItem.quantity <= 0
        ) {
          return c.json({ error: "Invalid cart item." }, 400);
        }
        const product = state.products.find((item) => item.id === rawItem.productId);
        if (!product || product.branch !== input.branch) {
          return c.json({ error: "A cart product does not belong to this branch." }, 403);
        }
        if (product.stock < rawItem.quantity) {
          return c.json({ error: `${product.name} does not have enough stock.` }, 409);
        }
        resolved.push({ product, quantity: rawItem.quantity });
      }

      const subtotal = resolved.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const discount = Math.min(input.discount, subtotal);
      const total = subtotal - discount;
      const amountReceived =
        typeof input.amountReceived === "number" && Number.isFinite(input.amountReceived)
          ? input.amountReceived
          : undefined;
      if (input.paymentMethod === "Cash" && (amountReceived ?? 0) < total) {
        return c.json({ error: "The received amount is below the total." }, 400);
      }

      const previous = state.transactions.reduce((max, transaction) => {
        const value = Number.parseInt(transaction.id.replace("RJ-", ""), 10);
        return Number.isFinite(value) ? Math.max(max, value) : max;
      }, 124);
      const now = new Date();
      const transaction: Transaction = {
        id: `RJ-${String(previous + 1).padStart(6, "0")}`,
        date: new Intl.DateTimeFormat("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Manila",
        }).format(now),
        time: new Intl.DateTimeFormat("en-PH", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Manila",
        }).format(now),
        cashier: input.cashier.trim().slice(0, 100),
        branch: input.branch,
        items: resolved.map((item) => ({
          name: item.product.name,
          qty: item.quantity,
          price: item.product.price,
        })),
        total,
        payment: input.paymentMethod as PaymentMethod,
        status: "Completed",
        discount,
        amountReceived,
      };

      for (const item of resolved) item.product.stock -= item.quantity;
      state.transactions.unshift(transaction);
      await writeState(state);
      return c.json({ transaction, ...publicState(state) });
    }

    if (input.action === "updateSettings") {
      if (typeof input.autoPrint !== "boolean") {
        return c.json({ error: "Invalid auto-print setting." }, 400);
      }
      state.autoPrint = input.autoPrint;
      await writeState(state);
      return c.json({ autoPrint: state.autoPrint });
    }

    return c.json({ error: "Unknown POS action." }, 400);
  } catch (error) {
    console.error("POS operation failed", error);
    return c.json({ error: "The Supabase operation failed." }, 500);
  }
});

Deno.serve(app.fetch);
