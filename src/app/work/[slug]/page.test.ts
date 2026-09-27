import { describe, it, expect, vi } from "vitest";
import type { ContentEntry } from "@/lib/schemas/content";

const entry: ContentEntry = {
  title: "Sample Project",
  slug: "sample-project",
  date: "2025-06-01",
  tags: ["Next.js"],
  category: "Tool",
  description: "動作確認用のサンプル制作物",
  body: "",
};

vi.mock("@/lib/content", () => ({
  getEntries: () => [entry],
  getEntry: (_collection: string, slug: string) => (slug === entry.slug ? entry : undefined),
}));

const { generateMetadata } = await import("./page");

describe("generateMetadata (work)", () => {
  it("エントリのタイトル・説明文からメタデータを生成する", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "sample-project" }),
    });

    expect(metadata.title).toBe("Sample Project");
    expect(metadata.description).toBe("動作確認用のサンプル制作物");
    expect(metadata.openGraph?.title).toBe("Sample Project");
  });

  it("存在しないslugの場合は空のメタデータを返す", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "not-found" }),
    });

    expect(metadata).toEqual({});
  });
});
