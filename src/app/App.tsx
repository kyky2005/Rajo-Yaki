import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import {
  LayoutDashboard, ShoppingCart, Package, Archive,
  ReceiptText, BarChart2, Settings, LogOut, Search, Bell,
  Plus, Minus, Trash2, Eye, Pencil, X, Check,
  Printer, TrendingUp, Calendar, ChevronDown, Download,
  AlertTriangle, RefreshCw, CheckCircle2, GitCompare,
  MapPin, Crown, Wifi, WifiOff
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | "login" | "dashboard" | "pos" | "payment"
  | "payment-success" | "receipt" | "products"
  | "inventory" | "transactions" | "reports" | "settings";

type UserRole = "super-admin" | "branch1" | "branch2";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  emoji: string;
  color: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Transaction {
  id: string;
  date: string;
  time: string;
  cashier: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  payment: string;
  status: "Completed" | "Pending" | "Cancelled";
  discount: number;
  amountReceived?: number;
  branch: "branch1" | "branch2";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BASE_PRODUCTS = [
  { id: 1, name: "Original Takoyaki", category: "Takoyaki", price: 80, minStock: 10, emoji: "🐙", color: "#FFF3E0" },
  { id: 2, name: "Cheese Takoyaki",   category: "Takoyaki", price: 90, minStock: 10, emoji: "🧀", color: "#FFF9C4" },
  { id: 3, name: "Spicy Takoyaki",    category: "Takoyaki", price: 90, minStock: 10, emoji: "🌶️", color: "#FFEBEE" },
  { id: 4, name: "Overload Takoyaki", category: "Takoyaki", price: 110, minStock: 10, emoji: "🔥", color: "#FBE9E7" },
  { id: 5, name: "French Fries",      category: "Snacks",   price: 60, minStock: 10, emoji: "🍟", color: "#FFF8E1" },
  { id: 6, name: "Iced Tea",          category: "Drinks",   price: 40, minStock: 10, emoji: "🧋", color: "#E8F5E9" },
  { id: 7, name: "Soft Drinks",       category: "Drinks",   price: 45, minStock: 10, emoji: "🥤", color: "#E3F2FD" },
  { id: 8, name: "Fish Ball",         category: "Snacks",   price: 25, minStock: 10, emoji: "🐟", color: "#F3E5F5" },
  { id: 9, name: "Kwek-Kwek",         category: "Snacks",   price: 25, minStock: 10, emoji: "🥚", color: "#FFF3E0" },
];

const BRANCH1_STOCK: Record<number, number> = { 1: 25, 2: 5, 3: 18, 4: 3, 5: 20, 6: 2, 7: 25, 8: 40, 9: 35 };
const BRANCH2_STOCK: Record<number, number> = { 1: 15, 2: 12, 3: 8, 4: 20, 5: 7, 6: 30, 7: 18, 8: 5, 9: 10 };

const makeProducts = (stockMap: Record<number, number>): Product[] =>
  BASE_PRODUCTS.map(p => ({ ...p, stock: stockMap[p.id] ?? 0 }));

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "RJ-000124", date: "May 20, 2024", time: "10:25 AM", cashier: "Branch 1 Staff", branch: "branch1", items: [{ name: "Original Takoyaki", qty: 2, price: 80 }, { name: "Iced Tea", qty: 1, price: 40 }], total: 330, payment: "Cash", status: "Completed", discount: 0, amountReceived: 500 },
  { id: "RJ-000123", date: "May 20, 2024", time: "10:10 AM", cashier: "Branch 2 Staff", branch: "branch2", items: [{ name: "Cheese Takoyaki", qty: 2, price: 90 }, { name: "Soft Drinks", qty: 3, price: 45 }], total: 450, payment: "GCash", status: "Completed", discount: 0 },
  { id: "RJ-000122", date: "May 20, 2024", time: "09:58 AM", cashier: "Branch 1 Staff", branch: "branch1", items: [{ name: "Spicy Takoyaki", qty: 2, price: 90 }], total: 180, payment: "Cash", status: "Completed", discount: 0, amountReceived: 200 },
  { id: "RJ-000121", date: "May 20, 2024", time: "09:30 AM", cashier: "Branch 2 Staff", branch: "branch2", items: [{ name: "Overload Takoyaki", qty: 2, price: 110 }, { name: "Iced Tea", qty: 1, price: 40 }], total: 260, payment: "Cash", status: "Pending", discount: 0, amountReceived: 300 },
  { id: "RJ-000120", date: "May 20, 2024", time: "09:15 AM", cashier: "Branch 1 Staff", branch: "branch1", items: [{ name: "French Fries", qty: 2, price: 60 }], total: 120, payment: "Cash", status: "Cancelled", discount: 0 },
  { id: "RJ-000119", date: "May 20, 2024", time: "09:00 AM", cashier: "Branch 2 Staff", branch: "branch2", items: [{ name: "Original Takoyaki", qty: 2, price: 80 }, { name: "Soft Drinks", qty: 2, price: 45 }], total: 290, payment: "GCash", status: "Completed", discount: 0 },
];

const SALES_DATA_B1 = [
  { time: "12 AM", sales: 0 }, { time: "4 AM", sales: 150 }, { time: "6 AM", sales: 480 },
  { time: "8 AM", sales: 950 }, { time: "10 AM", sales: 1400 }, { time: "12 PM", sales: 2100 },
  { time: "2 PM", sales: 1800 }, { time: "4 PM", sales: 2400 }, { time: "6 PM", sales: 2050 },
  { time: "8 PM", sales: 1100 },
];

const SALES_DATA_B2 = [
  { time: "12 AM", sales: 0 }, { time: "4 AM", sales: 80 }, { time: "6 AM", sales: 320 },
  { time: "8 AM", sales: 600 }, { time: "10 AM", sales: 880 }, { time: "12 PM", sales: 1300 },
  { time: "2 PM", sales: 1150 }, { time: "4 PM", sales: 1600 }, { time: "6 PM", sales: 1250 },
  { time: "8 PM", sales: 650 },
];

const BEST_SELLERS_B1 = [
  { name: "Original Takoyaki", sold: 126 },
  { name: "Cheese Takoyaki",   sold: 98 },
  { name: "Spicy Takoyaki",    sold: 76 },
  { name: "Overload Takoyaki", sold: 50 },
  { name: "French Fries",      sold: 42 },
];

const BEST_SELLERS_B2 = [
  { name: "Overload Takoyaki", sold: 110 },
  { name: "Spicy Takoyaki",    sold: 87 },
  { name: "Fish Ball",         sold: 74 },
  { name: "Kwek-Kwek",         sold: 68 },
  { name: "Soft Drinks",       sold: 55 },
];

const BRANCH_STATS = {
  branch1: { sales: 12430, transactions: 48, avgTx: 12430/48, bestSeller: "Original Takoyaki", bestSold: 126, salesChange: "+12.5%", txChange: "+8.2%", avgChange: "+5.4%" },
  branch2: { sales: 7890,  transactions: 31, avgTx: 7890/31,  bestSeller: "Overload Takoyaki",  bestSold: 110, salesChange: "+6.1%",  txChange: "+3.4%", avgChange: "+2.8%" },
};

const CATEGORIES = ["All", "Takoyaki", "Snacks", "Drinks", "Add-ons", "Other"];

const ROLE_META: Record<UserRole, { label: string; sub: string; avatar: string; avatarBg: string }> = {
  "super-admin": { label: "Super Admin",    sub: "All Branches",  avatar: "SA", avatarBg: "#7c3aed" },
  "branch1":     { label: "Branch 1 Staff", sub: "Quezon City",   avatar: "B1", avatarBg: "#BA0204" },
  "branch2":     { label: "Branch 2 Staff", sub: "Makati City",   avatar: "B2", avatarBg: "#F99526" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const peso = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

// ─── Bluetooth / ESC-POS ──────────────────────────────────────────────────────

// Known BLE thermal printer service/characteristic pairs (tried in order)
const BT_SERVICES = [
  { service: "000018f0-0000-1000-8000-00805f9b34fb", char: "00002af1-0000-1000-8000-00805f9b34fb" },
  { service: "e7810a71-73ae-499d-8c15-faa9aef0c3f2", char: "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f" },
  { service: "49535343-fe7d-4ae5-8fa9-9fafd205e455", char: "49535343-8841-43f4-a818-3fdff1c038e2" },
];

let _btDevice: BluetoothDevice | null = null;
let _btChar: BluetoothRemoteGATTCharacteristic | null = null;

// ESC/POS builder (58 mm printer = 32 char column)
function buildEscPos(tx: Transaction): Uint8Array {
  const ESC = "\x1B"; const GS = "\x1D";
  const W = 32;
  const hr  = () => "-".repeat(W) + "\n";
  const ctr = (s: string) => s.padStart(Math.floor((W + s.length) / 2)).padEnd(W) + "\n";
  const row = (l: string, r: string) => {
    const left  = l.slice(0, W - r.length - 1);
    return left + " ".repeat(W - left.length - r.length) + r + "\n";
  };

  let body = "";
  body += ctr("ROJO-YAKI TAKOYAKI");
  body += ctr("Official Receipt");
  body += hr();
  body += row("Date:", tx.date);
  body += row("Time:", tx.time);
  body += row("Cashier:", tx.cashier);
  body += row("TX#:", tx.id);
  body += hr();
  for (const item of tx.items) {
    body += row(`  ${item.name} x${item.qty}`, `P${(item.price * item.qty).toFixed(2)}`);
  }
  body += hr();
  const subtotal = tx.items.reduce((s, i) => s + i.price * i.qty, 0);
  body += row("Subtotal:", `P${subtotal.toFixed(2)}`);
  if (tx.discount > 0) body += row("Discount:", `-P${tx.discount.toFixed(2)}`);
  body += row("TOTAL:", `P${tx.total.toFixed(2)}`);
  body += hr();
  body += row("Payment:", tx.payment);
  if (tx.payment === "Cash" && tx.amountReceived) {
    body += row("Received:", `P${tx.amountReceived.toFixed(2)}`);
    body += row("Change:", `P${(tx.amountReceived - tx.total).toFixed(2)}`);
  }
  body += hr();
  body += ctr("Thank you for your order!");
  body += ctr("See you again! :)");
  body += "\n\n\n";

  const init   = `${ESC}\x40`;          // init printer
  const bold1  = `${ESC}\x45\x01`;      // bold on
  const bold0  = `${ESC}\x45\x00`;      // bold off
  const cut    = `${GS}\x56\x00`;       // full cut

  const full = init + bold1 + ctr("ROJO-YAKI TAKOYAKI") + bold0 + body + cut;
  return new TextEncoder().encode(full);
}

async function btWriteChunked(char: BluetoothRemoteGATTCharacteristic, data: Uint8Array) {
  const CHUNK = 200;
  for (let i = 0; i < data.length; i += CHUNK) {
    await char.writeValue(data.slice(i, i + CHUNK));
  }
}

async function btConnect(
  onConnected: (deviceName: string) => void,
  onDisconnected: () => void,
  onError: (msg: string) => void,
) {
  if (!navigator.bluetooth) {
    onError("Web Bluetooth is not supported in this browser. Use Chrome or Edge.");
    return;
  }
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: BT_SERVICES.map(s => s.service),
    });

    _btDevice = device;
    device.addEventListener("gattserverdisconnected", () => {
      _btChar = null;
      _btDevice = null;
      onDisconnected();
    });

    const server = await device.gatt!.connect();

    // Try known service/char pairs
    for (const { service, char } of BT_SERVICES) {
      try {
        const svc = await server.getPrimaryService(service);
        const characteristic = await svc.getCharacteristic(char);
        _btChar = characteristic;
        onConnected(device.name ?? "Unknown Printer");
        return;
      } catch { /* try next */ }
    }

    // No matching service found — still store device for reconnect attempts
    device.gatt!.disconnect();
    onError("Printer connected but no known print service found.\nMake sure the printer is a BLE thermal printer.");
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "NotFoundError") return; // user cancelled picker
    onError(e instanceof Error ? e.message : "Bluetooth connection failed.");
  }
}

function btDisconnect() {
  _btDevice?.gatt?.disconnect();
  _btDevice = null;
  _btChar = null;
}

async function btPrint(tx: Transaction): Promise<void> {
  if (!_btChar) throw new Error("Printer not connected");
  const bytes = buildEscPos(tx);
  await btWriteChunked(_btChar, bytes);
}

function getStockStatus(p: Product): "In Stock" | "Low Stock" | "Out of Stock" {
  if (p.stock === 0) return "Out of Stock";
  if (p.stock < p.minStock) return "Low Stock";
  return "In Stock";
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const ALL_NAV = [
  { id: "dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { id: "pos",          label: "Point of Sale",  icon: ShoppingCart },
  { id: "products",     label: "Products",       icon: Package },
  { id: "inventory",    label: "Inventory",      icon: Archive },
  { id: "transactions", label: "Transactions",   icon: ReceiptText },
  { id: "reports",      label: "Sales Reports",  icon: BarChart2 },
  { id: "settings",     label: "Settings",       icon: Settings },
];

const BRANCH_NAV = ["pos", "inventory", "transactions"];

const ADMIN_BRANCHES = [
  { id: "branch1" as const, label: "Branch 1", sub: "Quezon City",  color: "#BA0204" },
  { id: "branch2" as const, label: "Branch 2", sub: "Makati City",  color: "#F99526" },
];

function Sidebar({
  current, onNav, onLogout, userRole, adminBranch, setAdminBranch,
}: {
  current: Screen;
  onNav: (s: Screen) => void;
  onLogout: () => void;
  userRole: UserRole;
  adminBranch: "branch1" | "branch2";
  setAdminBranch: (b: "branch1" | "branch2") => void;
}) {
  const meta = ROLE_META[userRole];
  const navItems = userRole === "super-admin"
    ? ALL_NAV
    : ALL_NAV.filter(n => BRANCH_NAV.includes(n.id));

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#111111] text-white h-full overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#BA0204] flex items-center justify-center shadow-md flex-shrink-0">
            <span className="text-xl">🐙</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-white text-sm">ROJO-YAKI</span>
            <span className="font-medium text-[#F99526] text-[10px]">TAKOYAKI</span>
          </div>
        </div>
        {/* Role pill */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: `${meta.avatarBg}22`, border: `1px solid ${meta.avatarBg}44` }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ background: meta.avatarBg }}
          >
            {meta.avatarBg === "#7c3aed" ? <Crown size={12} /> : meta.avatar}
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-xs font-semibold text-white truncate">{meta.label}</span>
            <span className="text-[10px] text-white/50 truncate">{meta.sub}</span>
          </div>
        </div>

        {/* Branch selector — super admin only */}
        {userRole === "super-admin" && (
          <div className="mt-3">
            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-1.5 px-1">Managing Branch</p>
            <div className="flex flex-col gap-1">
              {ADMIN_BRANCHES.map(b => {
                const active = adminBranch === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setAdminBranch(b.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all w-full ${
                      active ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: active ? b.color : "#ffffff40" }}
                    />
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className={`text-xs font-semibold truncate ${active ? "text-white" : "text-white/50"}`}>{b.label}</span>
                      <span className="text-[10px] text-white/30 truncate">{b.sub}</span>
                    </div>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = current === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id as Screen)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-left ${
                active
                  ? "bg-[#BA0204] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all w-full"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ title, userRole, adminBranch }: { title: string; userRole: UserRole; adminBranch?: "branch1" | "branch2" }) {
  const meta = ROLE_META[userRole];
  const branchInfo = userRole === "super-admin" && adminBranch
    ? ADMIN_BRANCHES.find(b => b.id === adminBranch)
    : null;

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        {branchInfo && (
          <span
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: `${branchInfo.color}18`, color: branchInfo.color }}
          >
            <MapPin size={11} />
            {branchInfo.label} — {branchInfo.sub}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Search size={17} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
          <Bell size={17} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#BA0204] rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: meta.avatarBg }}
          >
            {meta.avatarBg === "#7c3aed" ? <Crown size={13} /> : meta.avatar}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-gray-800">{meta.label}</span>
            <span className="text-[10px] text-gray-400">{meta.sub}</span>
          </div>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function Badge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    "Completed":   "bg-green-100 text-green-700",
    "Pending":     "bg-yellow-100 text-yellow-700",
    "Cancelled":   "bg-red-100 text-red-700",
    "Available":   "bg-green-100 text-green-700",
    "Low Stock":   "bg-orange-100 text-orange-700",
    "Out of Stock":"bg-red-100 text-red-700",
    "In Stock":    "bg-green-100 text-green-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── Screen: Login ────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (role: UserRole) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");

  const demoLogins = [
    {
      role: "super-admin" as UserRole,
      label: "Super Admin",
      sub: "Full access — all branches",
      icon: <Crown size={16} />,
      bg: "#7c3aed",
      border: "#a78bfa",
    },
    {
      role: "branch1" as UserRole,
      label: "Branch 1 — POS",
      sub: "Quezon City branch",
      icon: <MapPin size={16} />,
      bg: "#BA0204",
      border: "#f87171",
    },
    {
      role: "branch2" as UserRole,
      label: "Branch 2 — POS",
      sub: "Makati City branch",
      icon: <MapPin size={16} />,
      bg: "#F99526",
      border: "#fbbf24",
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#FFF8F2]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[42%] bg-[#BA0204] relative overflow-hidden flex-col items-center justify-center p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F99526]/20 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full translate-y-20 -translate-x-10" />
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-[#F99526]/15 rounded-full -translate-x-16" />
        <div className="relative z-10 text-center">
          <div className="w-32 h-32 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <span className="text-7xl">🐙</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">ROJO-YAKI</h2>
          <p className="text-[#F99526] font-semibold text-lg mb-8">TAKOYAKI</p>
          <div className="flex flex-col gap-3 text-white/80 text-sm">
            {[["🔥","Fresh takoyaki every day"],["📦","Easy inventory management"],["💰","Fast & reliable POS system"]].map(([ic, txt]) => (
              <div key={txt} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-xl">{ic}</span><span>{txt}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 text-white/40 text-xs">© 2024 Rojo-Yaki Takoyaki. All rights reserved.</p>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm py-6">
          {/* Main login card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-5">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h2>
              <p className="text-sm text-gray-500">Sign in to manage your business</p>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Email or Username</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/20 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/20 transition-all pr-11" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#BA0204]" defaultChecked />
                  <span className="text-xs text-gray-600">Remember me</span>
                </label>
                <button className="text-xs text-[#BA0204] font-semibold hover:underline">Forgot Password?</button>
              </div>
              <button onClick={() => onLogin("super-admin")}
                className="w-full py-3 bg-[#BA0204] hover:bg-[#9a0203] text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">
                Login
              </button>
            </div>
          </div>

          {/* Demo login buttons */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Quick Demo Login</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="flex flex-col gap-2.5">
              {demoLogins.map(d => (
                <button
                  key={d.role}
                  onClick={() => onLogin(d.role)}
                  className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-100"
                  style={{ borderColor: `${d.border}66`, background: `${d.bg}08` }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                    style={{ background: d.bg }}
                  >
                    {d.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold text-gray-800">{d.label}</div>
                    <div className="text-xs text-gray-400">{d.sub}</div>
                  </div>
                  <div className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: d.bg }}>
                    DEMO
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Dashboard ────────────────────────────────────────────────────────

function DashboardScreen({ products, transactions, userRole, branchId }: {
  products: Product[];
  transactions: Transaction[];
  userRole: UserRole;
  branchId: "branch1" | "branch2";
}) {
  const lowStock = products.filter(p => getStockStatus(p) !== "In Stock");
  const stats = BRANCH_STATS[branchId];
  const salesData = branchId === "branch2" ? SALES_DATA_B2 : SALES_DATA_B1;
  const bestSellers = branchId === "branch2" ? BEST_SELLERS_B2 : BEST_SELLERS_B1;
  const statCards = [
    { label: "Today's Sales",       value: peso(stats.sales),         change: stats.salesChange, up: true,  icon: "💰" },
    { label: "Total Transactions",  value: String(stats.transactions), change: stats.txChange,    up: true,  icon: "🧾" },
    { label: "Products Sold",       value: String(stats.bestSold),    change: stats.avgChange,   up: true,  icon: "📦" },
    { label: "Low Stock Items",     value: String(lowStock.length),   change: "Needs attention", up: false, icon: "⚠️" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Good Morning, {ROLE_META[userRole].label}! 👋</h2>
        <p className="text-sm text-gray-500">Here's your business overview for today.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500">{c.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-gray-50">{c.icon}</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{c.value}</div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${c.up ? "text-green-600" : "text-amber-500"}`}>
              {c.up ? <TrendingUp size={12} /> : <AlertTriangle size={12} />}
              {c.change}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Sales Overview (Today)</h3>
            <button className="text-xs text-[#BA0204] font-semibold hover:underline">View All</button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BA0204" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#BA0204" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => [peso(v), "Sales"]} />
              <Area type="monotone" dataKey="sales" stroke="#BA0204" strokeWidth={2.5} fill="url(#redGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Low Stock Products</h3>
            <button className="text-xs text-[#BA0204] font-semibold hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {lowStock.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.stock} pcs / min {p.minStock} pcs</div>
                </div>
                <Badge status={getStockStatus(p)} />
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">All products have sufficient stock</div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
          <button className="text-xs text-[#BA0204] font-semibold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["ID","Time","Customer","Total","Payment","Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map(t => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-semibold text-[#BA0204]">{t.id}</td>
                  <td className="py-3 pr-4 text-gray-600">{t.time}</td>
                  <td className="py-3 pr-4 text-gray-600">Walk-in</td>
                  <td className="py-3 pr-4 font-semibold">{peso(t.total)}</td>
                  <td className="py-3 pr-4 text-gray-600">{t.payment}</td>
                  <td className="py-3"><Badge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Point of Sale ────────────────────────────────────────────────────

function POSScreen({ products, onPayment }: { products: Product[]; onPayment: (cart: CartItem[], discount: number) => void }) {
  const [selectedCat, setSelectedCat] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount] = useState(0);

  const filtered = useMemo(() => products.filter(p => {
    const inCat = selectedCat === "All" || p.category === selectedCat;
    const inSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return inCat && inSearch;
  }), [products, selectedCat, search]);

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const total = subtotal - discount;

  const addToCart = (p: Product) => setCart(prev => {
    const ex = prev.find(i => i.product.id === p.id);
    if (ex) return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
    return [...prev, { product: p, quantity: 1 }];
  });

  const updateQty = (id: number, delta: number) =>
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));

  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.product.id !== id));

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-5">
        <div className="flex flex-col gap-3 mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/10" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setSelectedCat(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCat === c
                    ? "bg-[#BA0204] text-white border-[#BA0204]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map(p => {
              const inCart = cart.find(i => i.product.id === p.id);
              const outOfStock = p.stock === 0;
              return (
                <div key={p.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col ${outOfStock ? "opacity-60" : ""}`}>
                  <div className="h-24 flex items-center justify-center" style={{ background: p.color }}>
                    <span className="text-5xl">{p.emoji}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-800 leading-tight">{p.name}</div>
                      <div className="text-xs text-gray-400">Stock: {p.stock}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#BA0204]">₱{p.price}</span>
                      {inCart ? (
                        <div className="flex items-center gap-1 bg-[#BA0204]/10 rounded-lg px-1">
                          <button onClick={() => updateQty(p.id, -1)} className="w-6 h-6 flex items-center justify-center text-[#BA0204] hover:bg-[#BA0204]/10 rounded"><Minus size={12} /></button>
                          <span className="text-xs font-bold text-[#BA0204] w-4 text-center">{inCart.quantity}</span>
                          <button onClick={() => updateQty(p.id, 1)} className="w-6 h-6 flex items-center justify-center text-[#BA0204] hover:bg-[#BA0204]/10 rounded"><Plus size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => !outOfStock && addToCart(p)} disabled={outOfStock}
                          className="flex items-center gap-1 bg-[#BA0204] hover:bg-[#9a0203] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50">
                          <Plus size={11} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Order panel */}
      <div className="w-72 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Current Order</h3>
          {cart.length > 0 && <span className="text-xs text-gray-400">{cart.reduce((s,i)=>s+i.quantity,0)} item(s)</span>}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
              <ShoppingCart size={36} /><span className="text-sm">No items yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: item.product.color }}>{item.product.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{item.product.name}</div>
                    <div className="text-xs text-gray-400">₱{item.product.price}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateQty(item.product.id,-1)} className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"><Minus size={10} /></button>
                    <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id,1)} className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100"><Plus size={10} /></button>
                  </div>
                  <div className="text-xs font-bold text-gray-800 w-12 text-right flex-shrink-0">₱{item.product.price * item.quantity}</div>
                  <button onClick={() => removeItem(item.product.id)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{peso(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Discount</span><span>{peso(discount)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100 mt-1">
              <span>Total</span><span className="text-[#BA0204]">{peso(total)}</span>
            </div>
          </div>
          <button onClick={() => setCart([])} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold hover:bg-gray-50 transition-all">Clear Order</button>
          <button onClick={() => cart.length > 0 && onPayment(cart, discount)} disabled={cart.length === 0}
            className="w-full py-3 bg-[#F99526] hover:bg-[#e8861a] text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Payment ───────────────────────────────────────────────────────────

function PaymentModal({ cart, discount, onConfirm, onCancel }: {
  cart: CartItem[]; discount: number;
  onConfirm: (method: string, amountReceived: number) => void;
  onCancel: () => void;
}) {
  const [method, setMethod] = useState<"Cash"|"GCash"|"Card">("Cash");
  const [received, setReceived] = useState("");
  const subtotal = cart.reduce((s,i) => s+i.product.price*i.quantity, 0);
  const total = subtotal - discount;
  const change = method === "Cash" ? (parseFloat(received) || 0) - total : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Complete Payment</h2>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h4>
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
              {cart.map(i => (
                <div key={i.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{i.product.name} × {i.quantity}</span>
                  <span className="font-medium">{peso(i.product.price*i.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 mt-2 pt-2 flex flex-col gap-1">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{peso(subtotal)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Discount</span><span>{peso(discount)}</span></div>
                <div className="flex justify-between font-bold text-base text-gray-900 mt-1">
                  <span>Total Amount</span><span className="text-[#BA0204]">{peso(total)}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Method</h4>
            <div className="flex gap-3">
              {(["Cash","GCash","Card"] as const).map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${method===m?"border-[#BA0204] bg-[#BA0204]/5":"border-gray-200 hover:border-gray-300"}`}>
                  <span className="text-xl">{m==="Cash"?"💵":m==="GCash"?"📱":"💳"}</span>
                  <span className={`text-xs font-semibold ${method===m?"text-[#BA0204]":"text-gray-600"}`}>{m}</span>
                </button>
              ))}
            </div>
          </div>
          {method === "Cash" && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Amount Received</label>
                <input type="number" value={received} onChange={e => setReceived(e.target.value)} placeholder={`₱${total}`}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/10" />
              </div>
              <div className="flex justify-between bg-green-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-green-700">Change</span>
                <span className="text-sm font-bold text-green-700">{change >= 0 ? peso(change) : "—"}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onConfirm(method, parseFloat(received)||total)}
            className="flex-1 py-3 bg-[#BA0204] hover:bg-[#9a0203] text-white font-bold rounded-xl transition-all shadow-md">
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Payment Success ──────────────────────────────────────────────────

function PaymentSuccessScreen({ txId, onPrint, onNewOrder, onDashboard }: {
  txId: string; onPrint: () => void; onNewOrder: () => void; onDashboard: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#FFF8F2]">
      <div className="text-center flex flex-col items-center gap-5 p-8">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={52} className="text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
          <p className="text-[#BA0204] font-bold text-lg">Transaction #{txId}</p>
          <p className="text-sm text-gray-500 mt-1">Thank you for your order!</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button onClick={onPrint} className="flex items-center gap-2 px-6 py-3 bg-[#BA0204] hover:bg-[#9a0203] text-white font-semibold rounded-xl transition-all shadow-md">
            <Printer size={16} /> Print Receipt
          </button>
          <button onClick={onNewOrder} className="flex items-center gap-2 px-6 py-3 bg-[#F99526] hover:bg-[#e8861a] text-white font-semibold rounded-xl transition-all shadow-md">
            <RefreshCw size={16} /> New Order
          </button>
          <button onClick={onDashboard} className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Receipt ──────────────────────────────────────────────────────────

function ReceiptScreen({ transaction, onNew, onPrint }: {
  transaction: Transaction;
  onNew: () => void;
  onPrint: (tx: Transaction) => Promise<void>;
}) {
  const subtotal = transaction.items.reduce((s,i) => s+i.price*i.qty, 0);
  return (
    <div className="flex-1 flex items-center justify-center bg-[#FFF8F2] p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-[#BA0204] px-6 py-5 text-white text-center">
            <div className="text-3xl mb-1">🐙</div>
            <div className="font-bold text-lg">ROJO-YAKI</div>
            <div className="text-[#F99526] font-semibold text-sm">TAKOYAKI</div>
          </div>
          <div className="px-6 py-5">
            <div className="text-center mb-4 text-xs text-gray-500 flex flex-col gap-0.5">
              <div><span className="font-semibold text-gray-700">Transaction #</span> {transaction.id}</div>
              <div><span className="font-semibold text-gray-700">Date:</span> {transaction.date}</div>
              <div><span className="font-semibold text-gray-700">Time:</span> {transaction.time}</div>
              <div><span className="font-semibold text-gray-700">Cashier:</span> {transaction.cashier}</div>
            </div>
            <div className="border-t border-dashed border-gray-300 mb-4" />
            <div className="text-xs mb-4">
              <div className="grid grid-cols-3 text-gray-500 font-semibold mb-2">
                <span>Item</span><span className="text-center">Qty</span><span className="text-right">Price</span>
              </div>
              {transaction.items.map((item,i) => (
                <div key={i} className="grid grid-cols-3 py-1 border-b border-gray-50 last:border-0">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-center text-gray-600">{item.qty}</span>
                  <span className="text-right text-gray-700">{peso(item.price*item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-gray-300 mb-4" />
            <div className="text-xs flex flex-col gap-1.5">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{peso(subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Discount</span><span>{peso(transaction.discount)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t border-gray-200 mt-1">
                <span>Total</span><span className="text-[#BA0204]">{peso(transaction.total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 mt-1"><span>Payment</span><span>{transaction.payment}</span></div>
              {transaction.payment === "Cash" && (
                <>
                  <div className="flex justify-between text-gray-600"><span>Received</span><span>{peso(transaction.amountReceived ?? transaction.total)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Change</span><span>{peso((transaction.amountReceived ?? transaction.total)-transaction.total)}</span></div>
                </>
              )}
            </div>
            <div className="text-center mt-5 text-xs text-gray-400">
              <p className="font-semibold text-[#F99526]">Thank you for your order!</p>
              <p>See you again! 🐙</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => onPrint(transaction)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#BA0204] hover:bg-[#9a0203] text-white font-semibold rounded-xl transition-all shadow-md">
            <Printer size={16} /> Print Receipt
          </button>
          <button onClick={onNew} className="flex-1 py-3 bg-[#F99526] hover:bg-[#e8861a] text-white font-semibold rounded-xl transition-all shadow-md">New Transaction</button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Products ─────────────────────────────────────────────────────────

function ProductsScreen({ products, setProducts }: { products: Product[]; setProducts: (p: Product[]) => void }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", category: "Takoyaki", price: "", stock: "", minStock: "10" });

  const filtered = products.filter(p => {
    const s = p.name.toLowerCase().includes(search.toLowerCase());
    const c = catFilter === "All Categories" || p.category === catFilter;
    return s && c;
  });

  const openAdd = () => { setForm({ name: "", category: "Takoyaki", price: "", stock: "", minStock: "10" }); setEditingProduct(null); setShowModal(true); };
  const openEdit = (p: Product) => { setForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), minStock: String(p.minStock) }); setEditingProduct(p); setShowModal(true); };

  const saveProduct = () => {
    if (!form.name || !form.price) return;
    const emojiMap: Record<string, string> = { Takoyaki: "🐙", Snacks: "🍟", Drinks: "🥤", "Add-ons": "🌶️", Other: "🎁" };
    const colorMap: Record<string, string> = { Takoyaki: "#FFF3E0", Snacks: "#FFF8E1", Drinks: "#E3F2FD", "Add-ons": "#FFEBEE", Other: "#F3E5F5" };
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...p, name: form.name, category: form.category, price: parseInt(form.price), stock: parseInt(form.stock), minStock: parseInt(form.minStock) } : p));
    } else {
      setProducts([...products, { id: Date.now(), name: form.name, category: form.category, price: parseInt(form.price), stock: parseInt(form.stock)||0, minStock: parseInt(form.minStock)||10, emoji: emojiMap[form.category]??"🍱", color: colorMap[form.category]??"#F5F5F5" }]);
    }
    setShowModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Product Management</h2>
          <p className="text-sm text-gray-500">Manage your products and pricing.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#BA0204] hover:bg-[#9a0203] text-white font-semibold rounded-xl text-sm transition-all shadow-md">
          <Plus size={15} /> Add Product
        </button>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#BA0204]" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none text-gray-600">
          <option>All Categories</option>
          {["Takoyaki","Snacks","Drinks","Add-ons","Other"].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Product","Category","Price","Stock","Status","Actions"].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: p.color }}>{p.emoji}</div>
                      <span className="font-semibold text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{p.category}</td>
                  <td className="px-5 py-3.5 font-semibold">{peso(p.price)}</td>
                  <td className="px-5 py-3.5"><span className={`font-semibold ${p.stock < p.minStock ? "text-orange-600" : "text-gray-800"}`}>{p.stock}</span></td>
                  <td className="px-5 py-3.5"><Badge status={getStockStatus(p)} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#BA0204] hover:text-[#BA0204] transition-all"><Pencil size={13} /></button>
                      <button onClick={() => setProducts(products.filter(x => x.id !== p.id))} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500 transition-all"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {[["Product Name","name","text","e.g. Original Takoyaki"],["Price (₱)","price","number","e.g. 80"],["Initial Stock","stock","number","e.g. 25"],["Minimum Stock","minStock","number","e.g. 10"]].map(([l,k,t,ph]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{l}</label>
                  <input type={t} value={(form as any)[k]} onChange={e => setForm(p => ({...p,[k]:e.target.value}))} placeholder={ph}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/10" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({...p,category:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204]">
                  {["Takoyaki","Snacks","Drinks","Add-ons","Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveProduct} className="flex-1 py-3 bg-[#BA0204] hover:bg-[#9a0203] text-white font-semibold rounded-xl">{editingProduct ? "Save Changes" : "Save Product"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Inventory (single branch) ───────────────────────────────────────

function SingleBranchInventory({
  products, setProducts, branchLabel,
}: {
  products: Product[];
  setProducts: (p: Product[]) => void;
  branchLabel: string;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addQty, setAddQty] = useState("");

  const inStock   = products.filter(p => getStockStatus(p) === "In Stock").length;
  const lowStock  = products.filter(p => getStockStatus(p) === "Low Stock").length;
  const outOfStock = products.filter(p => getStockStatus(p) === "Out of Stock").length;

  const filtered = products.filter(p => {
    const s = p.name.toLowerCase().includes(search.toLowerCase());
    const c = catFilter === "All Categories" || p.category === catFilter;
    return s && c;
  });

  const selectedProd = products.find(p => p.id === selectedId);

  const updateInventory = () => {
    if (!selectedId) return;
    const qty = parseInt(addQty);
    if (isNaN(qty) || qty <= 0) return;
    setProducts(products.map(p => p.id === selectedId ? { ...p, stock: p.stock + qty } : p));
    setShowModal(false);
  };

  const statCards = [
    { label: "Total Products", value: products.length, hex: "#1f2937" },
    { label: "In Stock",       value: inStock,          hex: "#16a34a" },
    { label: "Low Stock",      value: lowStock,         hex: "#f97316" },
    { label: "Out of Stock",   value: outOfStock,       hex: "#dc2626" },
  ];

  return (
    <div className="flex flex-col gap-4 flex-1">
      {branchLabel && (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[#BA0204]" />
          <span className="text-sm font-semibold text-gray-600">{branchLabel}</span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold mb-1 mt-1" style={{ color: c.hex }}>{c.value}</div>
            <div className="text-xs text-gray-500 font-medium">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#BA0204]" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none text-gray-600">
          <option>All Categories</option>
          {["Takoyaki","Snacks","Drinks","Add-ons","Other"].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{["Product","Category","Current Stock","Min Stock","Stock Status","Last Updated","Actions"].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const status = getStockStatus(p);
                const pct = Math.min(100, (p.stock/(p.minStock*3))*100);
                return (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: p.color }}>{p.emoji}</div>
                        <span className="font-semibold text-gray-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{p.category}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm" style={{ color: status==="In Stock"?"#16a34a":status==="Low Stock"?"#f97316":"#dc2626" }}>{p.stock}</span>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, background: status==="In Stock"?"#22c55e":status==="Low Stock"?"#f59e0b":"#ef4444" }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{p.minStock}</td>
                    <td className="px-5 py-3.5"><Badge status={status} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">May 20, 10:20 AM</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => { setSelectedId(p.id); setAddQty(""); setShowModal(true); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#BA0204] hover:text-[#BA0204] transition-all">
                        <Plus size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Add Stock</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product</label>
                <select value={selectedId??""} onChange={e => setSelectedId(parseInt(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204]">
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {selectedProd && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm flex justify-between text-gray-600">
                  <span>Current Stock</span><span className="font-semibold">{selectedProd.stock}</span>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Quantity to Add</label>
                <input type="number" value={addQty} onChange={e => setAddQty(e.target.value)} placeholder="e.g. 20" min="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/10" />
              </div>
              {selectedProd && addQty && parseInt(addQty)>0 && (
                <div className="bg-green-50 rounded-xl px-4 py-3 flex justify-between text-sm">
                  <span className="text-green-700 font-semibold">New Stock</span>
                  <span className="text-green-700 font-bold">{selectedProd.stock+parseInt(addQty)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600">Cancel</button>
              <button onClick={updateInventory} className="flex-1 py-3 bg-[#BA0204] hover:bg-[#9a0203] text-white font-semibold rounded-xl">Update Inventory</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Inventory (super admin — multi-branch view) ──────────────────────


function SuperAdminInventoryScreen({
  branch1Products, branch2Products,
  setBranch1Products, setBranch2Products,
  adminBranch,
}: {
  branch1Products: Product[];
  branch2Products: Product[];
  setBranch1Products: (p: Product[]) => void;
  setBranch2Products: (p: Product[]) => void;
  adminBranch: "branch1" | "branch2";
}) {
  const [showComparison, setShowComparison] = useState(false);

  // Aggregate stats for comparison view
  const allLow = [
    ...branch1Products.filter(p => getStockStatus(p) !== "In Stock").map(p => ({ ...p, branch: "Branch 1" })),
    ...branch2Products.filter(p => getStockStatus(p) !== "In Stock").map(p => ({ ...p, branch: "Branch 2" })),
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
          <p className="text-sm text-gray-500">
            {showComparison ? "Comparing stock across all branches" : `Managing ${adminBranch === "branch1" ? "Branch 1 — Quezon City" : "Branch 2 — Makati City"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComparison(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              showComparison
                ? "bg-[#BA0204] text-white border-[#BA0204]"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <GitCompare size={14} />
            {showComparison ? "Hide Comparison" : "Compare Branches"}
          </button>
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2">
            <Crown size={14} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-700">Super Admin</span>
          </div>
        </div>
      </div>

      {/* All branches comparison */}
      {showComparison && (
        <>
          {/* Side-by-side summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Branch 1 — Quezon City", products: branch1Products, accentColor: "#BA0204" },
              { label: "Branch 2 — Makati City",  products: branch2Products, accentColor: "#F99526" },
            ].map(b => {
              const inS  = b.products.filter(p => getStockStatus(p) === "In Stock").length;
              const lowS = b.products.filter(p => getStockStatus(p) === "Low Stock").length;
              const out  = b.products.filter(p => getStockStatus(p) === "Out of Stock").length;
              return (
                <div key={b.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: b.accentColor }} />
                    <h3 className="font-semibold text-gray-800">{b.label}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[["In Stock",inS,"#16a34a"],["Low Stock",lowS,"#f97316"],["Out of Stock",out,"#dc2626"]].map(([l,v,c]) => (
                      <div key={String(l)} className="text-center bg-gray-50 rounded-xl p-3">
                        <div className="text-xl font-bold" style={{ color: String(c) }}>{v}</div>
                        <div className="text-[10px] text-gray-500 font-medium mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <GitCompare size={16} className="text-[#BA0204]" />
              <h3 className="font-semibold text-gray-800">Stock Comparison — All Branches</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Product</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Category</th>
                    <th className="text-left text-xs font-semibold px-5 py-3.5" style={{ color: "#BA0204" }}>Branch 1 Stock</th>
                    <th className="text-left text-xs font-semibold px-5 py-3.5" style={{ color: "#F99526" }}>Branch 2 Stock</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Combined</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {BASE_PRODUCTS.map(base => {
                    const p1 = branch1Products.find(p => p.id === base.id)!;
                    const p2 = branch2Products.find(p => p.id === base.id)!;
                    const combined = p1.stock + p2.stock;
                    const s1 = getStockStatus(p1);
                    const s2 = getStockStatus(p2);
                    const hasAlert = s1 !== "In Stock" || s2 !== "In Stock";
                    return (
                      <tr key={base.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: base.color }}>{base.emoji}</span>
                            <span className="font-semibold text-gray-800">{base.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{base.category}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{ color: s1==="In Stock"?"#16a34a":s1==="Low Stock"?"#f97316":"#dc2626" }}>{p1.stock}</span>
                            {s1 !== "In Stock" && <Badge status={s1} />}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{ color: s2==="In Stock"?"#16a34a":s2==="Low Stock"?"#f97316":"#dc2626" }}>{p2.stock}</span>
                            {s2 !== "In Stock" && <Badge status={s2} />}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-800">{combined}</td>
                        <td className="px-5 py-3.5">
                          {hasAlert
                            ? <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><AlertTriangle size={12} />Restock needed</span>
                            : <span className="text-xs text-green-600 font-semibold">✓ Good</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alert summary */}
          {allLow.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-600" />
                <h3 className="font-semibold text-amber-800">{allLow.length} item(s) need restocking across branches</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {allLow.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-xs">
                    <span>{p.emoji}</span>
                    <span className="font-semibold text-gray-700">{p.name}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{p.branch}</span>
                    <Badge status={getStockStatus(p)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Active branch inventory — driven by sidebar adminBranch */}
      {!showComparison && (
        <SingleBranchInventory
          products={adminBranch === "branch1" ? branch1Products : branch2Products}
          setProducts={adminBranch === "branch1" ? setBranch1Products : setBranch2Products}
          branchLabel={adminBranch === "branch1" ? "Branch 1 — Quezon City" : "Branch 2 — Makati City"}
        />
      )}
    </div>
  );
}

// ─── Screen: Transactions ─────────────────────────────────────────────────────

function TransactionsScreen({
  transactions, userRole, branchId, onPrint,
}: {
  transactions: Transaction[];
  userRole: UserRole;
  branchId: "branch1" | "branch2";
  onPrint: (tx: Transaction) => Promise<void>;
}) {
  const isSuperAdmin = userRole === "super-admin";
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("All Payment Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [branchFilter, setBranchFilter] = useState<"all" | "branch1" | "branch2">(
    isSuperAdmin ? "all" : branchId
  );
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = transactions.filter(t => {
    const s = t.id.toLowerCase().includes(search.toLowerCase()) ||
              t.cashier.toLowerCase().includes(search.toLowerCase());
    const p = payFilter === "All Payment Methods" || t.payment === payFilter;
    const st = statusFilter === "All Status" || t.status === statusFilter;
    const b = branchFilter === "all" || (t.branch ?? "branch1") === branchFilter;
    return s && p && st && b;
  });

  const branchLabel = (b: "branch1" | "branch2") =>
    b === "branch1" ? "Branch 1 — QC" : "Branch 2 — Makati";

  const totalFiltered = filtered.reduce((s, t) => s + (t.status === "Completed" ? t.total : 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
          <p className="text-sm text-gray-500">
            {isSuperAdmin ? "All branches — " : ""}{filtered.length} transactions · {peso(totalFiltered)} completed
          </p>
        </div>
        {isSuperAdmin && (
          <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
            {(["all","branch1","branch2"] as const).map(b => (
              <button key={b} onClick={() => setBranchFilter(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  branchFilter === b
                    ? "bg-[#BA0204] text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}>
                {b === "all" ? "All Branches" : branchLabel(b)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or cashier…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#BA0204]" />
        </div>
        <select value={payFilter} onChange={e => setPayFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none text-gray-600">
          <option>All Payment Methods</option>
          {["Cash","GCash","Card"].map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none text-gray-600">
          <option>All Status</option>
          {["Completed","Pending","Cancelled"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["ID","Date","Time","Cashier", ...(isSuperAdmin ? ["Branch"] : []),"Items","Total","Payment","Status",""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-5 py-10 text-center text-sm text-gray-400">No transactions found</td></tr>
              )}
              {filtered.map(t => (
                <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[#BA0204]">{t.id}</td>
                  <td className="px-5 py-3.5 text-gray-600">{t.date}</td>
                  <td className="px-5 py-3.5 text-gray-600">{t.time}</td>
                  <td className="px-5 py-3.5 text-gray-600">{t.cashier}</td>
                  {isSuperAdmin && (
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: t.branch === "branch1" ? "#BA020418" : "#F9952618",
                          color:      t.branch === "branch1" ? "#BA0204"   : "#c17004",
                        }}>
                        {t.branch === "branch1" ? "Branch 1" : "Branch 2"}
                      </span>
                    </td>
                  )}
                  <td className="px-5 py-3.5 text-gray-600">{t.items.length}</td>
                  <td className="px-5 py-3.5 font-semibold">{peso(t.total)}</td>
                  <td className="px-5 py-3.5 text-gray-600">{t.payment}</td>
                  <td className="px-5 py-3.5"><Badge status={t.status} /></td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelected(t)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#BA0204] hover:text-[#BA0204] transition-all">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Transaction Details</h3>
                {isSuperAdmin && (
                  <span className="text-xs font-semibold" style={{ color: selected.branch === "branch1" ? "#BA0204" : "#F99526" }}>
                    {selected.branch === "branch1" ? "Branch 1 — Quezon City" : "Branch 2 — Makati City"}
                  </span>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                {[["Transaction ID",selected.id],["Date",selected.date],["Time",selected.time],["Cashier",selected.cashier],["Payment Method",selected.payment],["Status",""]].map(([k,v]) => (
                  <div key={String(k)}>
                    <div className="text-xs text-gray-500 mb-0.5">{k}</div>
                    {k==="Status" ? <Badge status={selected.status}/> : <div className="font-semibold text-gray-800">{v}</div>}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Purchased Items</h4>
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
                  {selected.items.map((item,i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-600">{item.name} × {item.qty}</span>
                      <span className="font-medium">{peso(item.price*item.qty)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 mt-2 pt-2 flex flex-col gap-1">
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{peso(selected.items.reduce((s,i)=>s+i.price*i.qty,0))}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Discount</span><span>{peso(selected.discount)}</span></div>
                    <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span className="text-[#BA0204]">{peso(selected.total)}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => selected && onPrint(selected)} className="w-full flex items-center justify-center gap-2 py-3 bg-[#BA0204] hover:bg-[#9a0203] text-white font-semibold rounded-xl">
                <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: Sales Reports ────────────────────────────────────────────────────

function ReportsScreen({ branchId }: { branchId: "branch1" | "branch2" }) {
  const stats = BRANCH_STATS[branchId];
  const salesData = branchId === "branch2" ? SALES_DATA_B2 : SALES_DATA_B1;
  const bestSellers = branchId === "branch2" ? BEST_SELLERS_B2 : BEST_SELLERS_B1;

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sales Reports</h2>
          <p className="text-sm text-gray-500">View your sales performance and insights.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600">
          <Calendar size={15} /><span>May 20, 2024 — May 20, 2024</span>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sales",           value: peso(stats.sales),         change: stats.salesChange },
          { label: "Total Transactions",    value: String(stats.transactions), change: stats.txChange },
          { label: "Average Transaction",   value: peso(stats.avgTx),         change: stats.avgChange },
          { label: "Best Selling Product",  value: stats.bestSeller,          change: `${stats.bestSold} sold` },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 mb-2">{c.label}</div>
            <div className="text-xl font-bold text-gray-900 mb-1 leading-tight">{c.value}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 font-semibold"><TrendingUp size={11} />{c.change}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => [peso(v), "Sales"]} />
              <Bar dataKey="sales" fill="#BA0204" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Best Selling Products</h3>
          <div className="flex flex-col gap-3">
            {bestSellers.map((p,i) => {
              const pct = (p.sold/bestSellers[0].sold)*100;
              const barColor = i===0?"#BA0204":i===1?"#F99526":"#f59e0b";
              return (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i+1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{p.name}</span>
                      <span className="font-bold text-gray-900">{p.sold}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${pct}%`, background: barColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#BA0204] hover:bg-[#9a0203] text-white font-semibold rounded-xl text-sm transition-all shadow-md">
          <BarChart2 size={15} /> Generate Report
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-all">
          <Download size={15} /> Export Report
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Settings ─────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full relative flex items-center transition-colors ${on ? "bg-[#BA0204]" : "bg-gray-300"}`}
    >
      <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "right-1" : "left-1"}`} />
    </button>
  );
}

function SettingsScreen({
  userRole, autoPrint, setAutoPrint, printerConnected, setPrinterConnected, onTestPrint,
}: {
  userRole: UserRole;
  autoPrint: boolean;
  setAutoPrint: (v: boolean) => void;
  printerConnected: boolean;
  setPrinterConnected: (v: boolean) => void;
  onTestPrint: () => Promise<void>;
}) {
  const [saved, setSaved] = useState(false);
  const [lowStock, setLowStock] = useState(true);
  const [btStatus, setBtStatus] = useState<"idle" | "connecting" | "printing" | "error">("idle");
  const [btError, setBtError] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const meta = ROLE_META[userRole];

  const handleConnect = async () => {
    if (printerConnected) {
      btDisconnect();
      setPrinterConnected(false);
      setDeviceName("");
      setBtStatus("idle");
      return;
    }
    setBtStatus("connecting");
    setBtError("");
    await btConnect(
      (name) => { setPrinterConnected(true); setDeviceName(name); setBtStatus("idle"); },
      ()     => { setPrinterConnected(false); setDeviceName(""); setBtStatus("idle"); },
      (msg)  => { setBtError(msg); setBtStatus("error"); },
    );
  };

  const handleTestPrint = async () => {
    setBtStatus("printing");
    try {
      await onTestPrint();
    } catch (e) {
      setBtError(e instanceof Error ? e.message : "Print failed");
      setBtStatus("error");
      return;
    }
    setBtStatus("idle");
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <p className="text-sm text-gray-500">Manage your account and system preferences.</p>
        </div>
        <div className="flex flex-col gap-5">
          {/* Account */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#BA0204]/10 flex items-center justify-center text-sm">👤</span>
              Account Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[["Full Name", meta.label], ["Username", userRole], ["Email", `${userRole}@rojo-yaki.com`]].map(([l,v]) => (
                <div key={l}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{l}</label>
                  <input defaultValue={v} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/10" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
                <input type="password" defaultValue="password123" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/10" />
              </div>
            </div>
          </div>

          {/* Business */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#F99526]/10 flex items-center justify-center text-sm">🏪</span>
              Business Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[["Business Name","Rojo-Yaki Takoyaki"],["Contact Number","09XX-XXX-XXXX"],["Address",meta.sub],["Email","hello@rojo-yaki.com"]].map(([l,v]) => (
                <div key={l}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{l}</label>
                  <input defaultValue={v} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204] focus:ring-2 focus:ring-[#BA0204]/10" />
                </div>
              ))}
            </div>
          </div>

          {/* Printer */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Printer size={15} className="text-blue-600" />
              </span>
              Bluetooth Printer
            </h3>

            {/* Connection status banner */}
            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-sm font-medium transition-all ${
              printerConnected
                ? "bg-green-50 text-green-700 border border-green-200"
                : btStatus === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : btStatus === "connecting"
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "bg-gray-50 text-gray-500 border border-gray-200"
            }`}>
              {btStatus === "connecting" ? <RefreshCw size={16} className="animate-spin" /> :
               printerConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <div className="flex-1">
                <div>
                  {btStatus === "connecting" ? "Searching for Bluetooth printer…" :
                   btStatus === "printing"   ? "Sending to printer…" :
                   printerConnected          ? `Connected: ${deviceName || "Bluetooth Printer"}` :
                   btStatus === "error"      ? "Connection failed" :
                   "No printer connected"}
                </div>
                {btStatus === "error" && btError && (
                  <div className="text-xs mt-0.5 opacity-80">{btError}</div>
                )}
              </div>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${printerConnected ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
            </div>

            {/* How-to note */}
            {!printerConnected && btStatus !== "connecting" && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-700 flex gap-2">
                <span className="flex-shrink-0 mt-0.5">ℹ️</span>
                <span>Make sure your Bluetooth thermal printer is <strong>powered on and discoverable</strong>, then click Connect. Works with ESC/POS BLE printers (Xprinter, GOOJPRT, etc.).</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Auto-print toggle */}
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Auto-print receipt</div>
                  <div className="text-xs text-gray-400">
                    {printerConnected
                      ? "Automatically send receipt to printer after payment"
                      : "Connect a printer to enable this feature"}
                  </div>
                </div>
                <Toggle on={autoPrint && printerConnected} onToggle={() => autoPrint ? setAutoPrint(false) : printerConnected && setAutoPrint(true)} />
              </div>

              {/* Connect / Test / Disconnect buttons */}
              <div className="flex items-center gap-3 flex-wrap pt-1">
                <button
                  onClick={handleConnect}
                  disabled={btStatus === "connecting" || btStatus === "printing"}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 ${
                    printerConnected
                      ? "bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 border border-gray-200"
                      : "bg-[#BA0204] hover:bg-[#9a0203] text-white"
                  }`}
                >
                  {btStatus === "connecting" ? (
                    <><RefreshCw size={14} className="animate-spin" /> Connecting…</>
                  ) : printerConnected ? (
                    <><WifiOff size={14} /> Disconnect</>
                  ) : (
                    <><Printer size={14} /> Connect via Bluetooth</>
                  )}
                </button>

                {printerConnected && (
                  <button
                    onClick={handleTestPrint}
                    disabled={btStatus === "printing" || btStatus === "connecting"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all shadow-sm disabled:opacity-50"
                  >
                    {btStatus === "printing"
                      ? <><RefreshCw size={14} className="animate-spin" /> Printing…</>
                      : <><Printer size={14} /> Test Print</>}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* System Preferences */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center text-sm">⚙️</span>
              System Preferences
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Low stock notifications</div>
                  <div className="text-xs text-gray-400">Notify when stock falls below minimum</div>
                </div>
                <Toggle on={lowStock} onToggle={() => setLowStock(!lowStock)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Currency</label>
                <select defaultValue="PHP" className="w-full max-w-xs px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-[#BA0204]">
                  <option value="PHP">Philippine Peso (₱ PHP)</option>
                  <option value="USD">US Dollar ($ USD)</option>
                </select>
              </div>
            </div>
          </div>

          <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
            className={`self-start flex items-center gap-2 px-6 py-3 font-semibold rounded-xl text-sm transition-all shadow-md ${saved ? "bg-green-500 text-white" : "bg-[#BA0204] hover:bg-[#9a0203] text-white"}`}>
            {saved ? <><Check size={15} /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [userRole, setUserRole] = useState<UserRole>("super-admin");

  // Per-branch product state — persisted to localStorage
  const [branch1Products, setBranch1Products] = useState<Product[]>(() => {
    try { const s = localStorage.getItem("rj_b1"); if (s) return JSON.parse(s); } catch {}
    return makeProducts(BRANCH1_STOCK);
  });
  const [branch2Products, setBranch2Products] = useState<Product[]>(() => {
    try { const s = localStorage.getItem("rj_b2"); if (s) return JSON.parse(s); } catch {}
    return makeProducts(BRANCH2_STOCK);
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const s = localStorage.getItem("rj_tx");
      if (s) {
        const parsed: Transaction[] = JSON.parse(s);
        // Migrate old records that lack a branch field
        return parsed.map(t => ({ ...t, branch: t.branch ?? "branch1" }));
      }
    } catch {}
    return INITIAL_TRANSACTIONS;
  });

  useEffect(() => { localStorage.setItem("rj_b1", JSON.stringify(branch1Products)); }, [branch1Products]);
  useEffect(() => { localStorage.setItem("rj_b2", JSON.stringify(branch2Products)); }, [branch2Products]);
  useEffect(() => { localStorage.setItem("rj_tx", JSON.stringify(transactions)); }, [transactions]);

  // Printer settings
  const [autoPrint, setAutoPrint] = useState<boolean>(() => {
    try { return localStorage.getItem("rj_autoprint") === "true"; } catch { return false; }
  });
  // printerConnected is NOT persisted — BT sessions don't survive page reloads
  const [printerConnected, setPrinterConnected] = useState(false);
  useEffect(() => { localStorage.setItem("rj_autoprint", String(autoPrint)); }, [autoPrint]);

  // Unified print: uses BT if connected, else window.print()
  // tx is optional — caller passes the transaction, or we fall back to window.print for DOM receipt
  const handlePrint = useCallback(async (tx?: Transaction): Promise<void> => {
    if (printerConnected && _btChar && tx) {
      await btPrint(tx);
    } else {
      window.print();
    }
  }, [printerConnected]);

  // Super-admin active branch selection
  const [adminBranch, setAdminBranch] = useState<"branch1" | "branch2">(() => {
    try { const s = localStorage.getItem("rj_adminbranch"); if (s === "branch2") return "branch2"; } catch {}
    return "branch1";
  });
  useEffect(() => { localStorage.setItem("rj_adminbranch", adminBranch); }, [adminBranch]);

  // POS flow state
  const [currentCart, setCurrentCart] = useState<CartItem[]>([]);
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState("Cash");
  const [currentAmountReceived, setCurrentAmountReceived] = useState(0);
  const [currentTxId, setCurrentTxId] = useState("RJ-000125");

  // Which products does the current user see
  const activeBranchId = userRole === "super-admin" ? adminBranch : userRole;
  const activeProducts = activeBranchId === "branch2" ? branch2Products : branch1Products;
  const setActiveProducts = activeBranchId === "branch2" ? setBranch2Products : setBranch1Products;

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setScreen(role === "super-admin" ? "dashboard" : "pos");
  };

  const handlePaymentStart = (cart: CartItem[], discount: number) => {
    setCurrentCart(cart);
    setCurrentDiscount(discount);
    setScreen("payment");
  };

  const handlePaymentConfirm = (method: string, amountReceived: number) => {
    const subtotal = currentCart.reduce((s,i) => s+i.product.price*i.quantity, 0);
    const total = subtotal - currentDiscount;
    const newId = `RJ-${String(parseInt(transactions[0]?.id.slice(3)??"000124")+1).padStart(6,"0")}`;
    const now = new Date();
    const cashier = ROLE_META[userRole].label;

    setTransactions(prev => [{
      id: newId,
      date: "May 20, 2024",
      time: now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
      cashier,
      branch: activeBranchId,
      items: currentCart.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.price })),
      total, payment: method, status: "Completed", discount: currentDiscount, amountReceived,
    }, ...prev]);

    // Deduct stock from correct branch
    setActiveProducts(activeProducts.map(p => {
      const cartItem = currentCart.find(i => i.product.id === p.id);
      if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      return p;
    }));

    setCurrentTxId(newId);
    setCurrentPaymentMethod(method);
    setCurrentAmountReceived(amountReceived);

    if (autoPrint && printerConnected && _btChar) {
      // Build the transaction object inline (currentTransaction isn't updated yet)
      const newTx: Transaction = {
        id: newId,
        date: "May 20, 2024",
        time: now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
        cashier, branch: activeBranchId,
        items: currentCart.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.price })),
        total, payment: method, status: "Completed", discount: currentDiscount, amountReceived,
      };
      btPrint(newTx).catch(console.error);
      setScreen("payment-success");
    } else if (autoPrint && !printerConnected) {
      // BT not connected — show receipt screen and use window.print
      setScreen("receipt");
      setTimeout(() => window.print(), 400);
    } else {
      setScreen("payment-success");
    }
  };

  const currentTransaction = useMemo<Transaction>(() => ({
    id: currentTxId,
    date: "May 20, 2024",
    time: new Date().toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }),
    cashier: ROLE_META[userRole].label,
    items: currentCart.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.price })),
    total: currentCart.reduce((s,i) => s+i.product.price*i.quantity, 0) - currentDiscount,
    payment: currentPaymentMethod,
    status: "Completed",
    discount: currentDiscount,
    amountReceived: currentAmountReceived,
  }), [currentTxId, currentCart, currentDiscount, currentPaymentMethod, currentAmountReceived, userRole]);

  const pageTitle: Record<Screen, string> = {
    login: "Login", dashboard: "Dashboard", pos: "Point of Sale",
    payment: "Payment", "payment-success": "Payment", receipt: "Receipt",
    products: "Products", inventory: "Inventory", transactions: "Transactions",
    reports: "Sales Reports", settings: "Settings",
  };

  if (screen === "login") {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif" }} className="size-full">
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const renderContent = () => {
    switch (screen) {
      case "dashboard":
        return <DashboardScreen products={activeProducts} transactions={transactions} userRole={userRole} branchId={activeBranchId} />;
      case "pos":
        return <POSScreen products={activeProducts} onPayment={handlePaymentStart} />;
      case "payment-success":
        return (
          <PaymentSuccessScreen
            txId={currentTxId}
            onPrint={() => setScreen("receipt")}
            onNewOrder={() => setScreen("pos")}
            onDashboard={() => setScreen(userRole === "super-admin" ? "dashboard" : "pos")}
          />
        );
      case "receipt":
        return <ReceiptScreen transaction={currentTransaction} onNew={() => setScreen("pos")} onPrint={handlePrint} />;
      case "products":
        return <ProductsScreen products={activeProducts} setProducts={setActiveProducts} />;
      case "inventory":
        return userRole === "super-admin"
          ? <SuperAdminInventoryScreen branch1Products={branch1Products} branch2Products={branch2Products} setBranch1Products={setBranch1Products} setBranch2Products={setBranch2Products} adminBranch={adminBranch} />
          : <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
                  <p className="text-sm text-gray-500">Monitor and update your inventory.</p>
                </div>
              </div>
              <SingleBranchInventory
                products={activeProducts}
                setProducts={setActiveProducts}
                branchLabel={userRole === "branch1" ? "Branch 1 — Quezon City" : "Branch 2 — Makati City"}
              />
            </div>;
      case "transactions":
        return <TransactionsScreen transactions={transactions} userRole={userRole} branchId={activeBranchId} onPrint={handlePrint} />;
      case "reports":
        return <ReportsScreen branchId={activeBranchId} />;
      case "settings":
        return (
          <SettingsScreen
            userRole={userRole}
            autoPrint={autoPrint}
            setAutoPrint={setAutoPrint}
            printerConnected={printerConnected}
            setPrinterConnected={setPrinterConnected}
            onTestPrint={() => handlePrint()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="size-full flex overflow-hidden">
      <Sidebar current={screen} onNav={setScreen} onLogout={() => setScreen("login")} userRole={userRole} adminBranch={adminBranch} setAdminBranch={setAdminBranch} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitle[screen] ?? ""} userRole={userRole} adminBranch={adminBranch} />
        <div className="flex-1 flex overflow-hidden bg-[#FFF8F2]">
          {renderContent()}
        </div>
      </div>
      {screen === "payment" && (
        <PaymentModal
          cart={currentCart}
          discount={currentDiscount}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setScreen("pos")}
        />
      )}
    </div>
  );
}
