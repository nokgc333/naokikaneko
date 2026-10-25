import { describe, it, expect, vi } from "vitest";
import type { ContentEntry } from "@/lib/content/schema";

const entryWithThumbnail: ContentEntry = {
  title: "Sample Post",
  slug: "sample-post",
  date: "2025-06-01",
  updatedDate: "2025-06-01",
  tags: ["Next.js"],
  category: "Tool",
  description: "動作確認用のサンプル記事",
  thumbnail: "/images/uploads/sample.png",
  body: "",
};

const entryWithoutThumbnail: ContentEntry = {
  title: "Sample Project",
  slug: "sample-project",
  date: "2025-06-01",
  updatedDate: "2025-06-01",
  tags: [],
  category: "Tool",
  description: "動作確認用のサンプル制作物",
  body: "",
};

vi.mock("@/lib/content", () => ({
  getEntry: (_collection: string, slug: string) => {
    if (slug === entryWithThumbnail.slug) return entryWithThumbnail;
    if (slug === entryWithoutThumbnail.slug) return entryWithoutThumbnail;
    return undefined;
  },
}));

const { buildEntryMetadata } = await import("./metadata");

describe("buildEntryMetadata", () => {
  it("generates metadata from the entry title and description", () => {
    const metadata = buildEntryMetadata("blog", "sample-post");

    expect(metadata.title).toBe("Sample Post");
    expect(metadata.description).toBe("動作確認用のサンプル記事");
    expect(metadata.openGraph).toMatchObject({ title: "Sample Post", type: "article" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "Sample Post" });
  });

  it("sets the canonical URL and og:url to the entry path", () => {
    const metadata = buildEntryMetadata("work", "sample-project");

    expect(metadata.alternates?.canonical).toBe("/work/sample-project");
    expect(metadata.openGraph?.url).toBe("/work/sample-project");
  });

  it("leaves the share image to the opengraph-image file of the route", () => {
    const metadata = buildEntryMetadata("blog", "sample-post");

    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(metadata.twitter).not.toHaveProperty("images");
  });

  it("returns empty metadata for a slug that does not exist", () => {
    expect(buildEntryMetadata("blog", "not-found")).toEqual({});
  });
});
