// "Deploy a preview" step: wait until Cloudflare serves the fixed code.
// Also watches Cloudflare's build check on the commit so a failed build stops the run at once.
const { PREVIEW, GITHUB_REPOSITORY: repo, GH_TOKEN } = process.env;
const sha = process.argv[2];
const fixed = 'getElementById("checkout-button").addEventListener';

async function cloudflareCheck() {
  const r = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}/check-runs`, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json" },
  });
  if (!r.ok) return null;
  return (await r.json()).check_runs.find((c) => c.name.startsWith("Workers Builds"));
}

console.log(`Waiting for Cloudflare to build and publish ${PREVIEW}`);
for (let i = 1; i <= 60; i++) {
  try {
    const res = await fetch(`${PREVIEW}/js/cart.js`, { cache: "no-store" });
    if (res.ok && (await res.text()).includes(fixed)) {
      console.log(`Preview is live with the fix after ~${i * 5}s`);
      process.exit(0);
    }
  } catch {}
  const check = await cloudflareCheck().catch(() => null);
  if (check?.status === "completed" && check.conclusion !== "success") {
    console.error(`::error::Cloudflare's build failed (${check.conclusion}). Details: ${check.details_url}`);
    process.exit(1);
  }
  if (i % 6 === 0) console.log(`  still waiting (${i * 5}s, Cloudflare build: ${check ? check.status : "not started"})`);
  await new Promise((r) => setTimeout(r, 5000));
}
console.error("::error::The preview did not go live within 5 minutes.");
process.exit(1);
