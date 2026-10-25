import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContentCard, { CONTENT_CARD_IMAGE_SIZES } from "./content-card";
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

describe("ContentCard image loading", () => {
  it("loads the image lazily by default", () => {
    render(<ContentCard entry={entry} href="/blog/sample" />);

    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
  });

  it("loads the image with high priority when it is above the fold", () => {
    render(<ContentCard entry={entry} href="/blog/sample" priority />);

    expect(screen.getByRole("img")).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByRole("img")).toHaveAttribute("loading", "eager");
  });

  it("describes the rendered width so the browser does not fetch an oversized image", () => {
    render(
      <ContentCard
        entry={{ ...entry, thumbnail: "/images/uploads/sample.png" }}
        href="/blog/sample"
      />,
    );

    expect(screen.getByRole("img").getAttribute("sizes")).toBe(CONTENT_CARD_IMAGE_SIZES);
  });
});
