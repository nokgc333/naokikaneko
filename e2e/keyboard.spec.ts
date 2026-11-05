import { test, expect } from "@playwright/test";

test.describe("keyboard operation", () => {
  test("the first Tab stop is a visible skip link that moves focus to the main content", async ({
    page,
  }) => {
    await page.goto("/about");

    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");

    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("the skip link stays out of sight until it is focused", async ({ page }) => {
    await page.goto("/about");

    const box = await page.getByRole("link", { name: "Skip to main content" }).boundingBox();

    expect(box === null || box.width <= 1).toBe(true);
  });

  test("focus is shown with a visible outline on links reached by keyboard", async ({ page }) => {
    await page.goto("/about");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
    });

    expect(outline.style).toBe("solid");
    expect(outline.width).toBeGreaterThanOrEqual(2);
  });

  test("the whole contact flow works without a mouse", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, json: { ok: true } }),
    );
    await page.goto("/about");

    await page.getByRole("button", { name: "お問い合わせを開く" }).focus();
    await page.keyboard.press("Enter");
    await page.getByLabel("個人・法人名").focus();
    await page.keyboard.type("Taro Yamada");
    await page.keyboard.press("Tab");
    await page.keyboard.type("taro@example.com");
    await page.keyboard.press("Tab");
    await page.keyboard.type("Hello from the keyboard");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "送信" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("status")).toHaveText("送信しました");
  });

  test("validation errors are exposed as alerts tied to the fields", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "お問い合わせを開く" }).click();

    await page.getByRole("button", { name: "送信" }).click();

    await expect(page.getByLabel("個人・法人名")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("個人・法人名")).toHaveAccessibleDescription(/入力してください/);
    await expect(
      page.getByRole("alert").filter({ hasText: "入力してください" }).first(),
    ).toBeVisible();
  });

  test("the category filter and view toggles can be operated with the keyboard", async ({
    page,
  }) => {
    await page.goto("/blog");

    await page.getByRole("button", { name: "リスト表示" }).focus();
    await page.keyboard.press("Enter");

    await expect(page.getByRole("button", { name: "リスト表示" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

test.describe("reduced motion", () => {
  test("transitions are effectively disabled when the user prefers reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const duration = await page.evaluate(() => {
      const card = document.querySelector("a.group") as Element;
      return parseFloat(getComputedStyle(card.querySelector("img") as Element).transitionDuration);
    });

    expect(duration).toBeLessThan(0.01);
  });

  test("transitions keep their normal duration otherwise", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    const duration = await page.evaluate(() => {
      const card = document.querySelector("a.group") as Element;
      return parseFloat(getComputedStyle(card.querySelector("img") as Element).transitionDuration);
    });

    expect(duration).toBeGreaterThan(0.1);
  });
});
