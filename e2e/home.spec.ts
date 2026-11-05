import { test, expect } from "@playwright/test";

test("shows the heading on the About page", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { name: /naoki kaneko/i })).toBeVisible();
});
