# AI automation demo: Fernwood Coffee

This is a fictional coffee shop with a **deliberately broken Checkout button**. It's the live demo on **[ai.oliverkiss.com](https://ai.oliverkiss.com)**.

When a visitor clicks **Fix it** on that page, this repository's [AI-assisted fix workflow](.github/workflows/fix.yml) runs for real:

1. **Reproduce the bug.** Automated browser tests (Playwright) click Checkout and confirm nothing happens.
2. **Find the cause.** The failing test is traced to the exact line of code ([`scripts/diagnose.mjs`](scripts/diagnose.mjs)).
3. **Write the fix (AI-assisted).** The fix is committed to a new branch, `run-<number>`.
4. **Run the tests.** All tests must pass.
5. **Deploy a preview.** Cloudflare publishes the fixed shop at its own preview address.
6. **Verify in a real browser.** The same test runs again against the live preview.
7. **Open the pull request.** It includes the diagnosis and before/after screenshots, and is then closed so the next visitor starts with the same bug.

Every run leaves public evidence behind, so you can check that the work really happened:

- [Pull requests](../../pulls?q=is%3Apr): one for each fix, with screenshots
- [Workflow runs](../../actions/workflows/fix.yml): full logs for each run
- Branches named `run-*`: the fixed code

The broken original is live at https://ai-automation-demo.oliver-835.workers.dev/cart.html.

## Run it locally

```sh
npm install
npx playwright install chromium
npm test        # 1 failing test: the checkout bug
npm run serve   # http://localhost:4173
```

Built by [Oliver Kiss](https://ai.oliverkiss.com). Fernwood Coffee Roasters is not a real business.
