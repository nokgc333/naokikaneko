import { test, expect } from "@playwright/test";

test("work一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/work");
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
  await page.getByRole("link", { name: /Example Project/ }).click();
  await expect(page).toHaveURL("/work/example-project");
  await expect(page.getByRole("heading", { name: "Example Project" })).toBeVisible();
});

test("blog一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await page.getByRole("link", { name: /Example Post/ }).click();
  await expect(page).toHaveURL("/blog/example-post");
  await expect(page.getByRole("heading", { name: "Example Post" })).toBeVisible();
});
