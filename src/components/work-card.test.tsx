import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WorkCard from "./work-card";
import type { ContentEntry } from "@/lib/schemas/content";

const entry: ContentEntry = {
  title: "Sample Project",
  slug: "sample-project",
  date: "2025-06-01",
  tags: ["Next.js", "TypeScript"],
  category: "Tools",
  description: "A sample project description",
  body: "",
};

describe("WorkCard", () => {
  it("タイトル・タグを表示する", () => {
    render(<WorkCard entry={entry} href="/work/sample-project" />);
    expect(screen.getByText("Sample Project")).toBeInTheDocument();
    expect(screen.getByText("#Next.js")).toBeInTheDocument();
    expect(screen.getByText("#TypeScript")).toBeInTheDocument();
  });

  it("詳細ページへのリンクを持つ", () => {
    render(<WorkCard entry={entry} href="/work/sample-project" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/work/sample-project");
  });
});
