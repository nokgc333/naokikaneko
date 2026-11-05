import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BlogPage, { metadata } from "./page";

const getEntries = vi.fn();
vi.mock("@/lib/content", () => ({ getEntries: (...args: unknown[]) => getEntries(...args) }));
vi.mock("@/components/category-filter", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="filter" data-props={JSON.stringify(props)} />
  ),
}));

describe("BlogPage", () => {
  it("lists the blog entries through the category filter", () => {
    getEntries.mockReturnValue([{ slug: "post" }]);

    render(<BlogPage />);

    expect(getEntries).toHaveBeenCalledWith("blog");
    const props = JSON.parse(screen.getByTestId("filter").dataset.props as string);
    expect(props).toMatchObject({
      entries: [{ slug: "post" }],
      hrefPrefix: "/blog",
      cardType: "blog",
      title: "Blog",
    });
  });

  it("exports the page metadata", () => {
    expect(metadata).toMatchObject({ title: "Blog" });
    expect(metadata.alternates?.canonical).toBe("/blog");
  });
});
