import { test, expect } from "@playwright/test";

test("work一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
  await page.getByRole("button", { name: "All" }).click();
  await page.getByRole("link", { name: /naokikaneko\.com/ }).click();
  await expect(page).toHaveURL("/work/naokikaneko-com");
  await expect(page.getByRole("heading", { name: "naokikaneko.com" })).toBeVisible();
});

test("blog一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await page.getByRole("button", { name: "All" }).click();
  await page.getByRole("link", { name: /MDXでできること/ }).click();
  await expect(page).toHaveURL("/blog/mdx-markdown-differences");
  await expect(
    page.getByRole("heading", { name: "MDXでできること、Markdownとの違いを徹底解説" })
  ).toBeVisible();
});
