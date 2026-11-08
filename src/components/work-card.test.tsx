import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WorkCard, { WORK_CARD_IMAGE_SIZES } from "./work-card";
import type { ContentEntry } from "@/lib/content/schema";

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

describe("WorkCard", () => {
  it("shows the title and tags", () => {
    render(<WorkCard entry={entry} href="/work/sample-project" />);
    expect(screen.getByText("Sample Project")).toBeInTheDocument();
    expect(screen.getByText("#Next.js")).toBeInTheDocument();
    expect(screen.getByText("#TypeScript")).toBeInTheDocument();
  });

  it("has a link to the detail page", () => {
    render(<WorkCard entry={entry} href="/work/sample-project" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/work/sample-project");
  });
});

describe("WorkCard image loading", () => {
  it("loads the image lazily by default", () => {
    render(<WorkCard entry={entry} href="/work/sample-project" />);

    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
  });

  it("loads the image with high priority when it is above the fold", () => {
    render(<WorkCard entry={entry} href="/work/sample-project" priority />);

    expect(screen.getByRole("img")).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByRole("img")).toHaveAttribute("loading", "eager");
  });

  it("describes the rendered width so the browser does not fetch an oversized image", () => {
    render(
      <WorkCard
        entry={{ ...entry, thumbnail: "/images/uploads/sample.png" }}
        href="/work/sample-project"
      />,
    );

    expect(screen.getByRole("img").getAttribute("sizes")).toBe(WORK_CARD_IMAGE_SIZES);
  });
});

describe("WorkCard heading", () => {
  it("uses a level-2 heading so the page outline does not skip a level", () => {
    render(<WorkCard entry={entry} href="/x" />);

    expect(screen.getByRole("heading", { level: 2, name: "Sample Project" })).toBeInTheDocument();
  });
});
