import { defineConfig, devices } from "@playwright/test";

// BASE_URL lets the same tests run against a deployed preview.
const remote = process.env.BASE_URL;

export default defineConfig({
  testDir: "tests",
  timeout: 15_000,
  expect: { timeout: 3_000 },
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    baseURL: remote || "http://localhost:4173",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: remote ? undefined : { command: "node scripts/serve.mjs", url: "http://localhost:4173", reuseExistingServer: true },
});
