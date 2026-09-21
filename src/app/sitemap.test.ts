import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("固定ページ（トップ・About・Blog一覧）を含む", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://naokikaneko.vercel.app");
    expect(urls).toContain("https://naokikaneko.vercel.app/about");
    expect(urls).toContain("https://naokikaneko.vercel.app/blog");
  });

  it("Work記事の詳細ページを含む", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://naokikaneko.vercel.app/work/sample-project");
  });

  it("Blog記事の詳細ページを含む", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://naokikaneko.vercel.app/blog/sample-post");
  });
});
