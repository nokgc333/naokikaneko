import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContentListItem from "./content-list-item";
import type { ContentEntry } from "@/lib/schemas/content";

const entry: ContentEntry = {
  title: "Sample Post",
  slug: "sample-post",
  date: "2025-06-01",
  tags: ["Next.js", "TypeScript"],
  category: "Others",
  description: "A sample post description",
  body: "",
};

describe("ContentListItem", () => {
  it("タイトル・説明文・タグ・日付を表示する", () => {
    render(<ContentListItem entry={entry} href="/blog/sample-post" />);
    expect(screen.getByText("Sample Post")).toBeInTheDocument();
    expect(screen.getByText("A sample post description")).toBeInTheDocument();
    expect(screen.getByText("#Next.js")).toBeInTheDocument();
    expect(screen.getByText("2025-06-01")).toBeInTheDocument();
  });

  it("詳細ページへのリンクを持つ", () => {
    render(<ContentListItem entry={entry} href="/blog/sample-post" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/blog/sample-post");
  });
});
