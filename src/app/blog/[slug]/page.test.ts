import { describe, it, expect, vi } from "vitest";
import type { ContentEntry } from "@/lib/schemas/content";

const entry: ContentEntry = {
  title: "Sample Post",
  slug: "sample-post",
  date: "2025-06-01",
  tags: ["Next.js"],
  category: "Tool",
  description: "動作確認用のサンプル記事",
  body: "",
};

vi.mock("@/lib/content", () => ({
  getEntries: () => [entry],
  getEntry: (_collection: string, slug: string) => (slug === entry.slug ? entry : undefined),
}));

const { generateMetadata } = await import("./page");

describe("generateMetadata (blog)", () => {
  it("エントリのタイトル・説明文からメタデータを生成する", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "sample-post" }),
    });

    expect(metadata.title).toBe("Sample Post");
    expect(metadata.description).toBe("動作確認用のサンプル記事");
    expect(metadata.openGraph?.title).toBe("Sample Post");
  });

  it("存在しないslugの場合は空のメタデータを返す", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "not-found" }),
    });

    expect(metadata).toEqual({});
  });
});
