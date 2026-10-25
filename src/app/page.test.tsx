import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home, { metadata } from "./page";

const getEntries = vi.fn();
vi.mock("@/lib/content", () => ({ getEntries: (...args: unknown[]) => getEntries(...args) }));
vi.mock("@/components/category-filter", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="filter" data-props={JSON.stringify(props)} />
  ),
}));

describe("Home", () => {
  it("lists the work entries through the category filter", () => {
    getEntries.mockReturnValue([{ slug: "a" }]);

    render(<Home />);

    expect(getEntries).toHaveBeenCalledWith("work");
    expect(screen.getByRole("heading", { level: 1, name: "Work" })).toBeInTheDocument();
    const props = JSON.parse(screen.getByTestId("filter").dataset.props as string);
    expect(props).toMatchObject({
      entries: [{ slug: "a" }],
      hrefPrefix: "/work",
      cardType: "work",
      defaultFilter: "Tool",
    });
  });

  it("declares the canonical URL of the top page", () => {
    expect(metadata.alternates?.canonical).toBe("/");
  });
});
