import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import CategoryFilter from "./category-filter";
import type { ContentEntry } from "@/lib/schemas/content";

const entries: ContentEntry[] = [
  {
    title: "HDA Entry",
    slug: "hda-entry",
    date: "2025-06-02",
    tags: [],
    category: "HDA",
    description: "An HDA entry",
    body: "",
  },
  {
    title: "Tools Entry",
    slug: "tools-entry",
    date: "2025-06-01",
    tags: [],
    category: "Tool",
    description: "A tools entry",
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

  it("cardTypeがworkの場合は表示切り替えボタンが表示されない", () => {
    render(<CategoryFilter entries={entries} hrefPrefix="/work" cardType="work" />);
    expect(screen.queryByLabelText("リスト表示")).not.toBeInTheDocument();
  });

  it("cardTypeがblogの場合はグリッド・リストの両方の表示切り替えボタンが常時表示され、切り替えられる", async () => {
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

  it("グリッド表示中も並び替えボタンが表示され、クリックで順序が反転する", async () => {
    const user = userEvent.setup();
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);
    const links = () => screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/blog/"));

    expect(screen.getByText("新しい順")).toBeInTheDocument();
    expect(links()[0]).toHaveAttribute("href", "/blog/hda-entry");

    await user.click(screen.getByText("新しい順"));

    expect(screen.getByText("古い順")).toBeInTheDocument();
    expect(links()[0]).toHaveAttribute("href", "/blog/tools-entry");
  });

  it("リスト表示に切り替えても並び替え結果が引き継がれる", async () => {
    const user = userEvent.setup();
    render(<CategoryFilter entries={entries} hrefPrefix="/blog" cardType="blog" />);
    const links = () => screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/blog/"));

    await user.click(screen.getByText("新しい順"));
    await user.click(screen.getByLabelText("リスト表示"));

    expect(screen.getByText("古い順")).toBeInTheDocument();
    expect(links()[0]).toHaveAttribute("href", "/blog/tools-entry");
  });
});
