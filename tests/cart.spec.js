import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/cart.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("cart shows the default items", async ({ page }) => {
  await expect(page.locator(".line")).toHaveCount(2);
  await expect(page.locator(".cart-count")).toHaveText("3");
});

test("totals add up, including free shipping and BC tax", async ({ page }) => {
  // 2 × 18.50 + 1 × 22.00 = 59.00 → free shipping, 12% tax = 7.08
  await expect(page.locator("#subtotal")).toHaveText("$59.00");
  await expect(page.locator("#shipping")).toHaveText("Free");
  await expect(page.locator("#tax")).toHaveText("$7.08");
  await expect(page.locator("#total")).toHaveText("$66.08");
});

test("quantity buttons update the line and total", async ({ page }) => {
  const line = page.locator('.line[data-id="yirgacheffe"]');
  await line.getByRole("button", { name: "Increase" }).click();
  await expect(line.locator(".qty span")).toHaveText("2");
  await expect(page.locator("#subtotal")).toHaveText("$81.00");
});

test("removing an item updates the cart", async ({ page }) => {
  await page.locator('.line[data-id="highlands"]').getByRole("button", { name: "Remove" }).click();
  await expect(page.locator(".line")).toHaveCount(1);
  await expect(page.locator("#shipping")).toHaveText("$7.50");
});
