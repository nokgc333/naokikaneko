import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("見出しをHTMLに変換する", async () => {
    const html = await renderMarkdown("# Hello");
    expect(html).toContain("<h1>Hello</h1>");
  });

  it("GFMのテーブル記法を変換する", async () => {
    const html = await renderMarkdown("| a | b |\n| - | - |\n| 1 | 2 |");
    expect(html).toContain("<table>");
  });
});
