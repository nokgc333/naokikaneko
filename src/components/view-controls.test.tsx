import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ViewControls from "./view-controls";

describe("ViewControls", () => {
  it("labels the sort button with the current order", () => {
    const { rerender } = render(
      <ViewControls view="grid" sortOrder="desc" onViewChange={() => {}} onSortToggle={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "新しい順" })).toBeInTheDocument();

    rerender(
      <ViewControls view="grid" sortOrder="asc" onViewChange={() => {}} onSortToggle={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "古い順" })).toBeInTheDocument();
  });

  it("marks the current view as pressed", () => {
    render(
      <ViewControls view="list" sortOrder="desc" onViewChange={() => {}} onSortToggle={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "リスト表示" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "グリッド表示" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports the chosen view and the sort toggle", async () => {
    const onViewChange = vi.fn();
    const onSortToggle = vi.fn();
    render(
      <ViewControls
        view="grid"
        sortOrder="desc"
        onViewChange={onViewChange}
        onSortToggle={onSortToggle}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "リスト表示" }));
    await userEvent.click(screen.getByRole("button", { name: "新しい順" }));

    expect(onViewChange).toHaveBeenCalledWith("list");
    expect(onSortToggle).toHaveBeenCalledTimes(1);
  });
});
