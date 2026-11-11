// After the preview is uploaded, wait until Cloudflare serves the fixed code at its address.
const { PREVIEW } = process.env;
const fixed = 'getElementById("checkout-button").addEventListener';
for (let i = 1; i <= 24; i++) {
  try {
    const res = await fetch(`${PREVIEW}/js/cart.js`, { cache: "no-store" });
    if (res.ok && (await res.text()).includes(fixed)) {
      console.log(`Preview is live with the fix: ${PREVIEW}/cart.html (after ~${i * 5}s)`);
      process.exit(0);
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 5000));
}
console.error(`::error::${PREVIEW} did not serve the fix within 2 minutes.`);
process.exit(1);
