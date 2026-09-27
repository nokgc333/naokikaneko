import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { getEntries } from "@/lib/content";

describe("sitemap", () => {
  it("固定ページ（トップ・About・Blog一覧）を含む", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://naokikaneko.vercel.app");
    expect(urls).toContain("https://naokikaneko.vercel.app/about");
    expect(urls).toContain("https://naokikaneko.vercel.app/blog");
  });

  it("Work記事すべての詳細ページを含む", () => {
    const urls = sitemap().map((entry) => entry.url);
    const workUrls = getEntries("work").map(
      (entry) => `https://naokikaneko.vercel.app/work/${entry.slug}`,
    );

    for (const url of workUrls) {
      expect(urls).toContain(url);
    }
  });

  it("Blog記事すべての詳細ページを含む", () => {
    const urls = sitemap().map((entry) => entry.url);
    const blogUrls = getEntries("blog").map(
      (entry) => `https://naokikaneko.vercel.app/blog/${entry.slug}`,
    );

    for (const url of blogUrls) {
      expect(urls).toContain(url);
    }
  });
});
