import { test, expect } from "@playwright/test";

test("clicking Checkout opens the secure checkout form", async ({ page }, testInfo) => {
  await page.goto("/cart.html");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Proof for the demo: what a shopper sees right after clicking Checkout.
  await page.waitForTimeout(800);
  await page.screenshot({ path: testInfo.outputPath("after-checkout-click.png") });

  const dialog = page.getByRole("dialog", { name: "Secure checkout" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Email")).toBeFocused();
});
