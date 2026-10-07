export type CartItem = {
  id: number;
  slug: string;
  name: string;
  model: string | null;
  imageUrl: string | null;
  qty: number;
  inStock: boolean;
};

const STORAGE_KEY = "instru-cart";

function loadItems(): CartItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(items: CartItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const cart = $state({
  items: [] as CartItem[],
  open: false,
});

export function hydrateCart() {
  cart.items = loadItems();
}

export function cartCount() {
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}

export function openCart() {
  cart.open = true;
  if (typeof document !== "undefined") document.body.style.overflow = "hidden";
}

export function closeCart() {
  cart.open = false;
  if (typeof document !== "undefined") document.body.style.overflow = "";
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const existing = cart.items.find((line) => line.id === item.id);
  if (existing) existing.qty += qty;
  else cart.items.push({ ...item, qty });
  persist(cart.items);
  openCart();
}

export function setQty(id: number, qty: number) {
  const line = cart.items.find((item) => item.id === id);
  if (!line) return;
  line.qty = Math.max(1, qty);
  persist(cart.items);
}

export function removeFromCart(id: number) {
  cart.items = cart.items.filter((item) => item.id !== id);
  persist(cart.items);
}

export function quoteWhatsAppText() {
  if (!cart.items.length) return "Hola, quiero cotizar productos.";
  const lines = cart.items.map((item) => {
    const model = item.model ? ` (${item.model})` : "";
    return `- ${item.qty}x ${item.name}${model}`;
  });
  return `Hola, quiero cotizar:\n${lines.join("\n")}`;
}
