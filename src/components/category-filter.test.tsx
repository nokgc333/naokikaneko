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

  it("always shows both the grid and list toggle buttons when cardType is blog, and they switch the view", async () => {
    const user = userEvent.setup();
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);

    const gridButton = screen.getByLabelText("グリッド表示");
    const listButton = screen.getByLabelText("リスト表示");
    expect(gridButton).toHaveAttribute("aria-pressed", "true");
    expect(listButton).toHaveAttribute("aria-pressed", "false");

    await user.click(listButton);

    expect(screen.getByText("A tools entry")).toBeInTheDocument();
    expect(gridButton).toHaveAttribute("aria-pressed", "false");
    expect(listButton).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the sort button in grid view too, and clicking it reverses the order", async () => {
    const user = userEvent.setup();
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);
    const links = () =>
      screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/blog/"));

    expect(screen.getByText("新しい順")).toBeInTheDocument();
    expect(links()[0]).toHaveAttribute("href", "/blog/hda-entry");

    await user.click(screen.getByText("新しい順"));

    expect(screen.getByText("古い順")).toBeInTheDocument();
    expect(links()[0]).toHaveAttribute("href", "/blog/tools-entry");
  });

  it("keeps the sort result when switching to list view", async () => {
    const user = userEvent.setup();
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);
    const links = () =>
      screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/blog/"));

    await user.click(screen.getByText("新しい順"));
    await user.click(screen.getByLabelText("リスト表示"));

    expect(screen.getByText("古い順")).toBeInTheDocument();
    expect(links()[0]).toHaveAttribute("href", "/blog/tools-entry");
  });
});

describe("CategoryFilter view toggle", () => {
  it("returns to the grid view after switching to the list view", async () => {
    const user = userEvent.setup();
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);

    await user.click(screen.getByRole("button", { name: "リスト表示" }));
    expect(screen.getByRole("button", { name: "リスト表示" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: "グリッド表示" }));

    expect(screen.getByRole("button", { name: "グリッド表示" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("CategoryFilter image priority", () => {
  const many: ContentEntry[] = Array.from({ length: 4 }, (_, index) => ({
    ...entries[1],
    title: `Entry ${index}`,
    slug: `entry-${index}`,
    date: `2025-06-0${4 - index}`,
  }));

  it("prioritizes only the first two images, which are above the fold", () => {
    render(<CategoryFilter entries={many} hrefPrefix="/work" cardType="work" />);

    const priorities = screen.getAllByRole("img").map((img) => img.getAttribute("fetchpriority"));
    expect(priorities).toEqual(["high", "high", null, null]);
  });
});
