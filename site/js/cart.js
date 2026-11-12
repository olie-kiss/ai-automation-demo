import { loadCart, saveCart, product, money, bagArt, updateCount } from "./products.js";

const SHIPPING_FREE_FROM = 50;
const SHIPPING = 7.5;
const TAX_RATE = 0.12; // BC: 5% GST + 7% PST

let cart = loadCart();

function totals() {
  const subtotal = cart.reduce((s, l) => s + product(l.id).price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= SHIPPING_FREE_FROM ? 0 : SHIPPING;
  const tax = Math.round((subtotal + shipping) * TAX_RATE * 100) / 100;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

function render() {
  const list = document.getElementById("cart-items");
  if (cart.length === 0) {
    list.innerHTML = `<div class="empty">Your cart is empty. <a href="index.html">Browse coffee</a></div>`;
  } else {
    list.innerHTML = cart
      .map((l) => {
        const p = product(l.id);
        return `<div class="line" data-id="${p.id}">
          <div class="thumb" style="background:#f3ece3">${bagArt(p, 64)}</div>
          <div>
            <h3>${p.name}</h3>
            <div class="meta">${p.origin} · 340 g whole bean</div>
            <div class="qty" role="group" aria-label="Quantity for ${p.name}">
              <button type="button" data-act="dec" aria-label="Decrease">−</button>
              <span>${l.qty}</span>
              <button type="button" data-act="inc" aria-label="Increase">+</button>
            </div>
          </div>
          <div class="right">
            <div class="price">${money(p.price * l.qty)}</div>
            <button type="button" class="remove" data-act="remove">Remove</button>
          </div>
        </div>`;
      })
      .join("");
  }

  const t = totals();
  document.getElementById("subtotal").textContent = money(t.subtotal);
  document.getElementById("shipping").textContent = t.shipping === 0 ? "Free" : money(t.shipping);
  document.getElementById("tax").textContent = money(t.tax);
  document.getElementById("total").textContent = money(t.total);
  document.getElementById("due").textContent = money(t.total);
  document.getElementById("checkout-button").disabled = cart.length === 0;
  updateCount();
}

document.getElementById("cart-items").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.closest(".line").dataset.id;
  const line = cart.find((l) => l.id === id);
  if (btn.dataset.act === "inc") line.qty += 1;
  if (btn.dataset.act === "dec") line.qty = Math.max(1, line.qty - 1);
  if (btn.dataset.act === "remove") cart = cart.filter((l) => l.id !== id);
  saveCart(cart);
  render();
});

// Checkout
const dialog = document.getElementById("checkout-dialog");

function openCheckout() {
  dialog.showModal();
  dialog.querySelector("input").focus();
}

document.getElementById("checkout-button").addEventListener("click", openCheckout);
document.getElementById("close-checkout").addEventListener("click", () => dialog.close());

render();
