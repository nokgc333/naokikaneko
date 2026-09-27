import { test, expect } from "@playwright/test";

// TODO: 実記事投入後、対象の記事slugに差し替えてskipを解除する
// （sample-project.md / sample-post.mdxの削除に伴い、検証対象の記事が0件のため一時停止中）
test.skip("work一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
  await page.getByRole("button", { name: "All" }).click();
  await page.getByRole("link", { name: /Sample Project/ }).click();
  await expect(page).toHaveURL("/work/sample-project");
  await expect(page.getByRole("heading", { name: "Sample Project" })).toBeVisible();
});

// TODO: 実記事投入後、対象の記事slugに差し替えてskipを解除する
// （sample-project.md / sample-post.mdxの削除に伴い、検証対象の記事が0件のため一時停止中）
test.skip("blog一覧から詳細ページに遷移できる", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await page.getByRole("button", { name: "All" }).click();
  await page.getByRole("link", { name: /Sample Post/ }).click();
  await expect(page).toHaveURL("/blog/sample-post");
  await expect(page.getByRole("heading", { name: "Sample Post" })).toBeVisible();
});
