import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import CategoryFilter from "./category-filter";
import type { ContentEntry } from "@/lib/schemas/content";

const entries: ContentEntry[] = [
  {
    title: "Tools Entry",
    slug: "tools-entry",
    date: "2025-06-01",
    tags: [],
    category: "Tool",
    description: "A tools entry",
    body: "",
  },
  {
    title: "HDA Entry",
    slug: "hda-entry",
    date: "2025-06-02",
    tags: [],
    category: "HDA",
    description: "An HDA entry",
    body: "",
  },
];

describe("CategoryFilter", () => {
  it("defaultFilter省略時はAllが選択され、全件表示される", () => {
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Tools Entry")).toBeInTheDocument();
    expect(screen.getByText("HDA Entry")).toBeInTheDocument();
  });

  it("defaultFilterを指定すると該当カテゴリのみ表示される", () => {
    render(
      <CategoryFilter
        entries={entries}
        hrefPrefix="/work"
        cardType="work"
        defaultFilter="Tool"
      />
    );
    expect(screen.getByText("Tools Entry")).toBeInTheDocument();
    expect(screen.queryByText("HDA Entry")).not.toBeInTheDocument();
  });

  it("タブを切り替えると該当カテゴリの項目のみ表示される", async () => {
    const user = userEvent.setup();
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);

    await user.click(screen.getByRole("button", { name: "HDA" }));

    expect(screen.getByText("HDA Entry")).toBeInTheDocument();
    expect(screen.queryByText("Tools Entry")).not.toBeInTheDocument();
  });

  it("hrefPrefixに応じたリンク先を生成する", () => {
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);
    expect(screen.getByRole("link", { name: /Tools Entry/ })).toHaveAttribute(
      "href",
      "/blog/tools-entry"
    );
  });
});
