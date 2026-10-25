import { describe, it, expect } from "vitest";
import { extractHeadings } from "./toc";

describe("extractHeadings", () => {
  it("extracts the text and depth of headings", () => {
    const markdown = "# タイトル\n\n本文です。\n\n## サブ見出し\n";

    const headings = extractHeadings(markdown);

    expect(headings).toEqual([
      { id: "user-content-タイトル", text: "タイトル", depth: 1 },
      { id: "user-content-サブ見出し", text: "サブ見出し", depth: 2 },
    ]);
  });

  it("prefixes ids with user-content-, the same as rehype-sanitize's clobberPrefix", () => {
    const headings = extractHeadings("# Hello World");

    expect(headings[0].id).toBe("user-content-hello-world");
  });

  it("appends a sequence number to duplicate heading names to keep ids unique", () => {
    const markdown = "# 見出し\n\n## 見出し\n";

    const headings = extractHeadings(markdown);

    expect(headings[0].id).toBe("user-content-見出し");
    expect(headings[1].id).toBe("user-content-見出し-1");
  });

  it("returns an empty array when there are no headings", () => {
    const headings = extractHeadings("本文のみで見出しはありません。");

    expect(headings).toEqual([]);
  });
});
