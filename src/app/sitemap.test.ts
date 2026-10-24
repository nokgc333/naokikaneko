import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { getEntries } from "@/lib/content";

describe("sitemap", () => {
  it("includes the fixed pages (top, About, blog list)", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://naokikaneko.com");
    expect(urls).toContain("https://naokikaneko.com/about");
    expect(urls).toContain("https://naokikaneko.com/blog");
  });

  it("includes the detail page of every work entry", () => {
    const urls = sitemap().map((entry) => entry.url);
    const workUrls = getEntries("work").map(
      (entry) => `https://naokikaneko.com/work/${entry.slug}`,
    );

    for (const url of workUrls) {
      expect(urls).toContain(url);
    }
  });

  it("includes the detail page of every blog entry", () => {
    const urls = sitemap().map((entry) => entry.url);
    const blogUrls = getEntries("blog").map(
      (entry) => `https://naokikaneko.com/blog/${entry.slug}`,
    );

    for (const url of blogUrls) {
      expect(urls).toContain(url);
    }
  });
});
