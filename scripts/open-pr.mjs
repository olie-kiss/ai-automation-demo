// "Open the pull request" step: open a PR with the diagnosis and screenshots,
// then close it so main keeps the bug for the next visitor.
import { readFile, appendFile } from "node:fs/promises";

const { EVIDENCE_SHA, GH_TOKEN, GITHUB_REPOSITORY: repo, GITHUB_SERVER_URL: server, GITHUB_RUN_ID, RUN_ID, BRANCH, PREVIEW, GITHUB_ENV } = process.env;
const api = (path, method, body) =>
  fetch(`https://api.github.com/repos/${repo}${path}`, {
    method,
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async (r) => {
    if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${await r.text()}`);
    return r.json();
  });

const diagnosis = (await readFile("evidence/diagnosis.txt", "utf8")).split("\n").filter((l, i, a) => i >= a.findIndex((x) => x.startsWith("Cause:"))).join("\n").trim();
// Link screenshots by commit, not branch, so they keep working if old run branches are deleted.
const raw = `https://raw.githubusercontent.com/${repo}/${EVIDENCE_SHA}/evidence`;
const runUrl = `${server}/${repo}/actions/runs/${GITHUB_RUN_ID}`;

const body = `A visitor on [ai.oliverkiss.com](https://ai.oliverkiss.com) clicked **Fix it**. This pull request was created by an AI-assisted pipeline: [view the run](${runUrl}).

### What was wrong
\`\`\`
${diagnosis}
\`\`\`

### Proof
| Before: clicking Checkout | After: same test on the live preview |
|---|---|
| ![before](${raw}/before.png) | ![after](${raw}/live.png) |

Live preview with the fix: ${PREVIEW}/cart.html

_This pull request is closed automatically so the next visitor starts with the same bug._`;

const pr = await api("/pulls", "POST", { title: `AI-assisted fix: checkout button does nothing (run ${RUN_ID})`, head: BRANCH, base: "main", body });
console.log(`Opened pull request #${pr.number}: ${pr.html_url}`);
await api(`/pulls/${pr.number}`, "PATCH", { state: "closed" });
console.log("Closed it so main keeps the bug for the next visitor.");
await appendFile(GITHUB_ENV, `PR_URL=${pr.html_url}\n`);
