import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContentCard from "./content-card";
import type { ContentEntry } from "@/lib/schemas/content";

const entry: ContentEntry = {
  title: "Sample Project",
  slug: "sample-project",
  date: "2025-06-01",
  updatedDate: "2025-06-01",
  tags: ["Next.js", "TypeScript"],
  category: "Tool",
  description: "A sample project description",
  body: "",
};

describe("ContentCard", () => {
  it("shows the title and tags", () => {
    render(<ContentCard entry={entry} href="/work/sample-project" />);
    expect(screen.getByText("Sample Project")).toBeInTheDocument();
    expect(screen.getByText("#Next.js")).toBeInTheDocument();
  });

  it("has a link to the detail page", () => {
    render(<ContentCard entry={entry} href="/work/sample-project" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/work/sample-project");
  });
});
