// "Deploy a preview" step: wait until Cloudflare Pages serves the fixed code.
const url = `${process.env.PREVIEW}/js/cart.js`;
const fixed = 'getElementById("checkout-button").addEventListener';
console.log(`Waiting for Cloudflare to publish ${process.env.PREVIEW}`);
for (let i = 1; i <= 60; i++) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok && (await res.text()).includes(fixed)) {
      console.log(`Preview is live with the fix after ~${i * 5}s`);
      process.exit(0);
    }
  } catch {}
  await new Promise((r) => setTimeout(r, 5000));
}
console.error("::error::The preview did not go live within 5 minutes.");
process.exit(1);
