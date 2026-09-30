import { describe, it, expect } from "vitest";
import { extractHeadings } from "./toc";

describe("extractHeadings", () => {
  it("見出しのテキスト・深さを抽出する", () => {
    const markdown = "# タイトル\n\n本文です。\n\n## サブ見出し\n";

    const headings = extractHeadings(markdown);

    expect(headings).toEqual([
      { id: "user-content-タイトル", text: "タイトル", depth: 1 },
      { id: "user-content-サブ見出し", text: "サブ見出し", depth: 2 },
    ]);
  });

  it("idにrehype-sanitizeのclobberPrefixと同じuser-content-を付与する", () => {
    const headings = extractHeadings("# Hello World");

    expect(headings[0].id).toBe("user-content-hello-world");
  });

  it("同名見出しが複数ある場合、末尾に連番を付けて重複を避ける", () => {
    const markdown = "# 見出し\n\n## 見出し\n";

    const headings = extractHeadings(markdown);

    expect(headings[0].id).toBe("user-content-見出し");
    expect(headings[1].id).toBe("user-content-見出し-1");
  });

  it("見出しが無い場合は空配列を返す", () => {
    const headings = extractHeadings("本文のみで見出しはありません。");

    expect(headings).toEqual([]);
  });
});
