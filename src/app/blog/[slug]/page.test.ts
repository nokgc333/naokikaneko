import { describe, it, expect } from "vitest";
import { generateMetadata } from "./page";

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
