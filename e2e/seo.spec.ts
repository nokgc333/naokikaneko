import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", canonical: "https://naokikaneko.com" },
  { path: "/about", canonical: "https://naokikaneko.com/about" },
  { path: "/blog", canonical: "https://naokikaneko.com/blog" },
  {
    path: "/blog/mdx-markdown-differences",
    canonical: "https://naokikaneko.com/blog/mdx-markdown-differences",
  },
  { path: "/work/pipeboard", canonical: "https://naokikaneko.com/work/pipeboard" },
];

for (const { path, canonical } of pages) {
  test.describe(path, () => {
    test("has a title, description, canonical URL and Open Graph tags", async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        /^https?:\/\/[^/]+\/(.+\/)?opengraph-image/,
      );
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
    });

    test("serves the Open Graph image as a png", async ({ page, request }) => {
      await page.goto(path);
      const content = await page.locator('meta[property="og:image"]').getAttribute("content");
      const imagePath = new URL(content ?? "").pathname;

      const response = await request.get(imagePath);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("image/png");
    });
  });
}

test.describe("structured data", () => {
  async function readJsonLd(page: import("@playwright/test").Page) {
    const texts = await page.locator('script[type="application/ld+json"]').allTextContents();
    return texts.map((text) => JSON.parse(text));
  }

  test("every page describes the website and the person", async ({ page }) => {
    await page.goto("/about");

    const types = (await readJsonLd(page)).map((item) => item["@type"]);

    expect(types).toEqual(expect.arrayContaining(["WebSite", "Person"]));
  });

  test("a blog post is described as a BlogPosting with both dates", async ({ page }) => {
    await page.goto("/blog/mdx-markdown-differences");

    const posting = (await readJsonLd(page)).find((item) => item["@type"] === "BlogPosting");

    expect(posting).toMatchObject({
      url: "https://naokikaneko.com/blog/mdx-markdown-differences",
      inLanguage: "ja",
    });
    expect(posting.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(posting.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(posting.headline.length).toBeGreaterThan(0);
  });

  test("a work page is described as a CreativeWork", async ({ page }) => {
    await page.goto("/work/pipeboard");

    const work = (await readJsonLd(page)).find((item) => item["@type"] === "CreativeWork");

    expect(work).toMatchObject({
      name: "pipeboard",
      url: "https://naokikaneko.com/work/pipeboard",
    });
  });
});

test.describe("icons and installability metadata", () => {
  test("links the apple touch icon, the manifest and a theme color", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#ffffff");
  });

  test("serves the manifest and the apple touch icon", async ({ request }) => {
    const manifest = await request.get("/manifest.webmanifest");
    const icon = await request.get("/apple-icon");

    expect(manifest.status()).toBe(200);
    expect((await manifest.json()).short_name).toBe("NAOKI KANEKO");
    expect(icon.status()).toBe(200);
    expect(icon.headers()["content-type"]).toBe("image/png");
  });
});

test("the 404 page asks search engines not to index it", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
});
