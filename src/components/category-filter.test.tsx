import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import CategoryFilter from "./category-filter";
import type { ContentEntry } from "@/lib/content/schema";

const entries: ContentEntry[] = [
  {
    title: "HDA Entry",
    slug: "hda-entry",
    date: "2025-06-02",
    updatedDate: "2025-06-02",
    tags: [],
    category: "HDA",
    description: "An HDA entry",
    body: "",
  },
  {
    title: "Tools Entry",
    slug: "tools-entry",
    date: "2025-06-01",
    updatedDate: "2025-06-01",
    tags: [],
    category: "Tool",
    description: "A tools entry",
    body: "",
  },
];

describe("CategoryFilter", () => {
  it("selects All and shows every item when defaultFilter is omitted", () => {
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Tools Entry")).toBeInTheDocument();
    expect(screen.getByText("HDA Entry")).toBeInTheDocument();
  });

  it("shows only the matching category when defaultFilter is given", () => {
    render(
      <CategoryFilter entries={entries} hrefPrefix="/work" cardType="work" defaultFilter="Tool" />,
    );
    expect(screen.getByText("Tools Entry")).toBeInTheDocument();
    expect(screen.queryByText("HDA Entry")).not.toBeInTheDocument();
  });

  it("shows only the items of the selected category after switching tabs", async () => {
    const user = userEvent.setup();
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);

    await user.click(screen.getByRole("button", { name: "HDA" }));

    expect(screen.getByText("HDA Entry")).toBeInTheDocument();
    expect(screen.queryByText("Tools Entry")).not.toBeInTheDocument();
  });

  it("generates links according to hrefPrefix", () => {
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);
    expect(screen.getByRole("link", { name: /Tools Entry/ })).toHaveAttribute(
      "href",
      "/blog/tools-entry",
    );
  });

  it("does not show the view toggle buttons when cardType is work", () => {
    render(<CategoryFilter entries={entries} hrefPrefix="/work" cardType="work" />);
    expect(screen.queryByLabelText("リスト表示")).not.toBeInTheDocument();
  });
});
