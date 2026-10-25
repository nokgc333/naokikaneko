import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaskListCheckbox from "./task-list-checkbox";

describe("TaskListCheckbox", () => {
  it("names a checked box as done", () => {
    render(<TaskListCheckbox type="checkbox" checked disabled readOnly />);

    expect(screen.getByRole("checkbox", { name: "完了" })).toBeChecked();
  });

  it("names an unchecked box as not done", () => {
    render(<TaskListCheckbox type="checkbox" disabled />);

    expect(screen.getByRole("checkbox", { name: "未完了" })).not.toBeChecked();
  });

  it("leaves other input types untouched", () => {
    render(<TaskListCheckbox type="text" aria-label="keep" />);

    expect(screen.getByLabelText("keep")).toHaveAttribute("type", "text");
  });
});
