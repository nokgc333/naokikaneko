import { describe, it, expect } from "vitest";
import {
  buildBlogPostingJsonLd,
  buildCreativeWorkJsonLd,
  buildPersonJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from "./structured-data";
import type { ContentEntry } from "@/lib/content/schema";

const entry: ContentEntry = {
  title: "Sample Entry",
  slug: "sample-entry",
  date: "2025-06-01",
  updatedDate: "2025-07-02",
  tags: ["Next.js", "TypeScript"],
  category: "Tool",
  description: "A sample description",
  url: "https://example.com/sample",
  body: "",
};

describe("site-wide structured data", () => {
  it("describes the website and its author", () => {
    const site = buildWebSiteJsonLd();

    expect(site).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: "https://naokikaneko.com",
      inLanguage: "ja",
    });
    expect(site.author).toMatchObject({ "@type": "Person", name: "Naoki Kaneko" });
  });

  it("describes the person with the profile links", () => {
    expect(buildPersonJsonLd()).toMatchObject({
      "@type": "Person",
      name: "Naoki Kaneko",
      sameAs: ["https://github.com/nokgc333"],
    });
  });
});

describe("buildBlogPostingJsonLd", () => {
  it("maps the entry to a BlogPosting with absolute URLs and both dates", () => {
    const posting = buildBlogPostingJsonLd(entry);

    expect(posting).toMatchObject({
      "@type": "BlogPosting",
      headline: "Sample Entry",
      description: "A sample description",
      datePublished: "2025-06-01",
      dateModified: "2025-07-02",
      url: "https://naokikaneko.com/blog/sample-entry",
      mainEntityOfPage: "https://naokikaneko.com/blog/sample-entry",
      image: "https://naokikaneko.com/blog/sample-entry/opengraph-image",
      keywords: "Next.js, TypeScript",
    });
  });

  it("omits keywords when the entry has no tags", () => {
    expect(buildBlogPostingJsonLd({ ...entry, tags: [] })).not.toHaveProperty("keywords");
  });
});

describe("buildCreativeWorkJsonLd", () => {
  it("maps the entry to a CreativeWork and links the external page", () => {
    const work = buildCreativeWorkJsonLd(entry);

    expect(work).toMatchObject({
      "@type": "CreativeWork",
      name: "Sample Entry",
      dateCreated: "2025-06-01",
      dateModified: "2025-07-02",
      url: "https://naokikaneko.com/work/sample-entry",
      image: "https://naokikaneko.com/work/sample-entry/opengraph-image",
      sameAs: "https://example.com/sample",
    });
  });

  it("omits sameAs and keywords when there is no external url or tag", () => {
    const work = buildCreativeWorkJsonLd({ ...entry, url: undefined, tags: [] });

    expect(work).not.toHaveProperty("sameAs");
    expect(work).not.toHaveProperty("keywords");
  });
});

describe("serializeJsonLd", () => {
  it("escapes characters that could close the script element", () => {
    const text = serializeJsonLd({ name: "</script><script>alert(1)</script> & more" });

    expect(text).not.toContain("<");
    expect(text).not.toContain(">");
    expect(text).not.toContain("&");
    expect(JSON.parse(text).name).toBe("</script><script>alert(1)</script> & more");
  });

  it("escapes the unicode line separators", () => {
    const value = `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c`;
    const text = serializeJsonLd({ name: value });

    expect(text).toContain("\\u2028");
    expect(text).toContain("\\u2029");
    expect(text).not.toContain(String.fromCharCode(0x2028));
    expect(JSON.parse(text).name).toBe(value);
  });
});
