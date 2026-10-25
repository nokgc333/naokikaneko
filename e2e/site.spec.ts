import { test, expect } from "@playwright/test";

test.describe("not found", () => {
  test("shows the 404 page with a link back to the top", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await page.getByRole("link", { name: "トップに戻る" }).click();
    await expect(page).toHaveURL("/");
  });

  test("returns 404 for an unknown work slug", async ({ page }) => {
    const response = await page.goto("/work/unknown-slug");

    expect(response?.status()).toBe(404);
  });
});

test.describe("crawler files", () => {
  test("robots.txt hides /admin and points to the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(body).toContain("Disallow: /admin");
    expect(body).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  });

  test("sitemap.xml lists the static pages and every entry", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(body).toContain("/about");
    expect(body).toContain("/blog");
    expect(body).toContain("/work/naokikaneko-com");
    expect(body).toContain("/blog/mdx-markdown-differences");
  });
});

test.describe("social images", () => {
  test("serves the Open Graph image as a png", async ({ request }) => {
    const response = await request.get("/opengraph-image");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("declares the Open Graph and Twitter metadata on a work page", async ({ page }) => {
    await page.goto("/work/naokikaneko-com");

    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });
});

test.describe("admin", () => {
  test("serves the CMS entry page", async ({ page }) => {
    const response = await page.goto("/admin/index.html");

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle("Content Manager");
  });
});
