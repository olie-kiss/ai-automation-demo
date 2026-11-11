// Product catalog and cart storage shared by every page.
export const PRODUCTS = [
  { id: "highlands", name: "Highlands Blend", origin: "Colombia · Ethiopia", notes: "Milk chocolate, red apple, honey", price: 18.5, color: "#7a4a2b", band: "#c9893f" },
  { id: "night-owl", name: "Night Owl Espresso", origin: "Brazil · Sumatra", notes: "Dark cocoa, molasses, toasted walnut", price: 19.0, color: "#2b211b", band: "#a0522d" },
  { id: "yirgacheffe", name: "Yirgacheffe Single Origin", origin: "Ethiopia", notes: "Jasmine, lemon zest, bergamot", price: 22.0, color: "#3f6b4f", band: "#e2c275" },
  { id: "decaf", name: "Swiss Water Decaf", origin: "Peru", notes: "Brown sugar, almond, soft citrus", price: 17.0, color: "#5b6f8a", band: "#d8b48a" },
];

const KEY = "fernwood-cart";
const DEFAULT_CART = [
  { id: "highlands", qty: 2 },
  { id: "yirgacheffe", qty: 1 },
];

export function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch {}
  return DEFAULT_CART.map((l) => ({ ...l }));
}

export function saveCart(cart) {
  try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {}
}

export function product(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function money(n) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

export function bagArt(p, size = 120) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
    <path d="M30 22 L90 22 L96 104 Q96 110 90 110 L30 110 Q24 110 24 104 Z" fill="${p.color}"/>
    <path d="M30 22 L90 22 L88 34 L32 34 Z" fill="#000" opacity=".18"/>
    <rect x="34" y="56" width="52" height="30" rx="4" fill="${p.band}"/>
    <circle cx="60" cy="71" r="8" fill="${p.color}"/>
  </svg>`;
}

export function updateCount() {
  const n = loadCart().reduce((s, l) => s + l.qty, 0);
  document.querySelectorAll(".cart-count").forEach((el) => (el.textContent = n));
}
