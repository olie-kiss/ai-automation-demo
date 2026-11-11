// "Find cause" step: read the failing test, then check every element ID the
// shop's JavaScript looks up against the IDs that exist in the HTML.
// Prints a plain-English diagnosis and writes it to diagnosis.json.
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const SITE = new URL("../site/", import.meta.url).pathname;

// 1. Which test failed, and how?
const results = JSON.parse(await readFile("test-results/results.json", "utf8"));
const failed = [];
(function walk(suite) {
  for (const s of suite.suites ?? []) walk(s);
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const r = t.results.at(-1);
      if (r && r.status !== "passed") failed.push({ title: spec.title, file: spec.file, error: (r.error?.message ?? "").replace(/\x1b\[[0-9;]*m/g, "").split("\n")[0] });
    }
  }
})(results);

// 2. IDs that exist in the HTML pages.
const htmlIds = new Set();
const buttonIds = new Set();
for (const f of (await readdir(SITE)).filter((f) => f.endsWith(".html"))) {
  const html = await readFile(join(SITE, f), "utf8");
  for (const m of html.matchAll(/\bid="([^"]+)"/g)) htmlIds.add(m[1]);
  for (const m of html.matchAll(/<button\b[^>]*\bid="([^"]+)"/g)) buttonIds.add(m[1]);
}

// 3. IDs the JavaScript looks up, and whether each exists.
const problems = [];
const jsDir = join(SITE, "js");
for (const f of await readdir(jsDir)) {
  const lines = (await readFile(join(jsDir, f), "utf8")).split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/getElementById\("([^"]+)"\)|querySelector\("#([\w-]+)"\)/g)) {
      const id = m[1] ?? m[2];
      if (!htmlIds.has(id)) {
        const close = [...buttonIds].filter((h) => h.startsWith(id.split("-")[0]));
        problems.push({ file: `site/js/${f}`, line: i + 1, code: line.trim(), missingId: id, likelyMeant: close });
      }
    }
  });
}

console.log(`Failing tests: ${failed.length}`);
for (const t of failed) console.log(`  ✗ ${t.title}\n    ${t.error}`);
console.log("");
if (problems.length === 0) {
  console.log("No missing element IDs found.");
} else {
  for (const p of problems) {
    console.log(`Cause: ${p.file}:${p.line} attaches the click handler to #${p.missingId},`);
    console.log(`       but no element on the page has id="${p.missingId}".`);
    if (p.likelyMeant.length) console.log(`       The button on the page is id="${p.likelyMeant.join('" or id="')}".`);
    console.log(`       The ?. operator hides the error, so the button silently does nothing.`);
    console.log(`  > ${p.code}`);
  }
}

await writeFile("diagnosis.json", JSON.stringify({ failed, problems }, null, 2));
if (problems.length === 0 && failed.length > 0) process.exit(1);
