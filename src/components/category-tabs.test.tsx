import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CategoryTabs from "./category-tabs";

describe("CategoryTabs", () => {
  it("lists All and the work categories in a labelled navigation", () => {
    render(<CategoryTabs activeFilter="All" onChange={() => {}} />);

    expect(screen.getByRole("navigation", { name: "カテゴリ" })).toBeInTheDocument();
    for (const name of ["All", "Tool", "HDA", "HP", "Others"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("marks only the active filter as pressed", () => {
    render(<CategoryTabs activeFilter="HDA" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "HDA" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Tool" })).toHaveAttribute("aria-pressed", "false");
  });

  it("reports the clicked filter", async () => {
    const onChange = vi.fn();
    render(<CategoryTabs activeFilter="All" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Tool" }));

    expect(onChange).toHaveBeenCalledWith("Tool");
  });
});
