import { test, expect } from "@playwright/test";

test.describe("blog", () => {
  test("filters the list by category", async ({ page }) => {
    await page.goto("/blog");
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.getByRole("link", { name: /MDXでできること/ })).toBeVisible();

    await page.getByRole("button", { name: "Tool", exact: true }).click();

    await expect(page.getByRole("link", { name: /MDXでできること/ })).toHaveCount(0);
  });

  test("switches between the grid and list views", async ({ page }) => {
    await page.goto("/blog");

    await page.getByRole("button", { name: "リスト表示" }).click();
    await expect(page.getByRole("button", { name: "リスト表示" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: "グリッド表示" }).click();

    await expect(page.getByRole("button", { name: "グリッド表示" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("shows the table of contents on wide screens and jumps to a heading", async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto("/blog/mdx-markdown-differences");

    const toc = page.getByRole("navigation", { name: "目次" });
    await expect(toc).toBeVisible();
    const firstLink = toc.getByRole("link").first();
    const href = await firstLink.getAttribute("href");
    await firstLink.click();

    await expect.poll(() => decodeURIComponent(page.url()).endsWith(href ?? "")).toBe(true);
  });

  test("hides the table of contents on narrow screens", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto("/blog/mdx-markdown-differences");

    await expect(page.getByRole("navigation", { name: "目次" })).toBeHidden();
  });
});
