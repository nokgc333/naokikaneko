import { test, expect, type Page } from "@playwright/test";

async function openForm(page: Page) {
  await page.goto("/about");
  await page.getByRole("button", { name: "お問い合わせを開く" }).click();
  await expect(page.getByRole("button", { name: "閉じる" })).toBeVisible();
}

async function fillValidForm(page: Page) {
  await page.getByLabel("個人・法人名").fill("Taro Yamada");
  await page.getByLabel("メールアドレス").fill("taro@example.com");
  await page.getByLabel("本文").fill("Hello from the end-to-end test");
}

test.describe("contact form", () => {
  test("shows validation errors and does not call the API when submitted empty", async ({
    page,
  }) => {
    let apiCalls = 0;
    await page.route("**/api/contact", async (route) => {
      apiCalls += 1;
      await route.fulfill({ status: 200, json: { ok: true } });
    });
    await openForm(page);

    await page.getByRole("button", { name: "送信" }).click();

    await expect(page.getByText("個人・法人名を入力してください")).toBeVisible();
    await expect(page.getByText("本文を入力してください")).toBeVisible();
    expect(apiCalls).toBe(0);
  });

  test("shows a confirmation after a successful submission", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, json: { ok: true } }),
    );
    await openForm(page);
    await fillValidForm(page);

    await page.getByRole("button", { name: "送信" }).click();

    await expect(page.getByText("送信しました")).toBeVisible();
  });

  test("shows a retry message when the server rate-limits the request", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 429, json: { error: "リクエストが多すぎます" } }),
    );
    await openForm(page);
    await fillValidForm(page);

    await page.getByRole("button", { name: "送信" }).click();

    await expect(
      page.getByText("送信に失敗しました。時間をおいて再度お試しください。"),
    ).toBeVisible();
    await expect(page.getByLabel("本文")).toHaveValue("Hello from the end-to-end test");
  });

  test("closes the widget with the close button", async ({ page }) => {
    await openForm(page);

    await page.getByRole("button", { name: "閉じる" }).click();

    await expect(page.getByRole("button", { name: "お問い合わせを開く" })).toBeVisible();
  });
});

test.describe("contact API", () => {
  const valid = { name: "Taro", email: "taro@example.com", message: "Hello" };

  test("accepts a filled honeypot silently without sending mail", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: { ...valid, honeypot: "bot-filled" },
    });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  test("rejects malformed JSON with 400", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: { "content-type": "application/json" },
      data: Buffer.from("{not json"),
    });

    expect(response.status()).toBe(400);
  });

  test("rejects an oversized body with 413", async ({ request }) => {
    const response = await request.post("/api/contact", {
      data: { ...valid, message: "a".repeat(20_000) },
    });

    expect(response.status()).toBe(413);
  });

  test("rejects invalid fields with 422", async ({ request }) => {
    const response = await request.post("/api/contact", { data: { ...valid, email: "nope" } });

    expect(response.status()).toBe(422);
  });
});
