import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

const paths = [
  "/",
  "/about",
  "/blog",
  "/blog/mdx-markdown-differences",
  "/work/naokikaneko-com",
  "/this-page-does-not-exist",
];

for (const path of paths) {
  test(`${path} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.getByRole("heading").first().waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
      .analyze();

    expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });
}

test("the open contact form has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/about");
  await page.getByRole("button", { name: "お問い合わせを開く" }).click();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
    .analyze();

  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
});
