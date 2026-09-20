import { test, expect } from "@playwright/test";

test("work一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
  await page.getByRole("link", { name: /Sample Project/ }).click();
  await expect(page).toHaveURL("/work/sample-project");
  await expect(page.getByRole("heading", { name: "Sample Project" })).toBeVisible();
});

test("blog一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await page.getByRole("link", { name: /Sample Post/ }).click();
  await expect(page).toHaveURL("/blog/sample-post");
  await expect(page.getByRole("heading", { name: "Sample Post" })).toBeVisible();
});
