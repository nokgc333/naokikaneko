import { describe, it, expect, vi } from "vitest";
import type { ContentEntry } from "@/lib/schemas/content";

const entryWithThumbnail: ContentEntry = {
  title: "Sample Post",
  slug: "sample-post",
  date: "2025-06-01",
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
  it("エントリのタイトル・説明文・サムネイルからメタデータを生成する", () => {
    const metadata = buildEntryMetadata("blog", "sample-post");

    expect(metadata.title).toBe("Sample Post");
    expect(metadata.description).toBe("動作確認用のサンプル記事");
    expect(metadata.openGraph?.images).toEqual(["/images/uploads/sample.png"]);
  });

  it("サムネイル未設定時はプレースホルダー画像を使用する", () => {
    const metadata = buildEntryMetadata("work", "sample-project");

    expect(metadata.openGraph?.images).toEqual(["/images/placeholder.svg"]);
  });

  it("存在しないslugの場合は空のメタデータを返す", () => {
    const metadata = buildEntryMetadata("blog", "not-found");

    expect(metadata).toEqual({});
  });
});
