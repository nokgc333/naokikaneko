import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 375, height: 812 } });

const paths = ["/", "/about", "/blog", "/blog/mdx-markdown-differences", "/work/naokikaneko-com"];

for (const path of paths) {
  test(`${path} does not scroll horizontally on a phone`, async ({ page }) => {
    await page.goto(path);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("the navigation links are reachable on a phone", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "About" }).click();

  await expect(page).toHaveURL("/about");
});

test("the contact widget opens and the form is usable on a phone", async ({ page }) => {
  await page.goto("/about");

  await page.getByRole("button", { name: "お問い合わせを開く" }).click();

  await expect(page.getByRole("button", { name: "閉じる" })).toBeVisible();
  await expect(page.getByLabel("本文")).toBeVisible();
  const box = await page.getByRole("button", { name: "送信" }).boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(375);
});
