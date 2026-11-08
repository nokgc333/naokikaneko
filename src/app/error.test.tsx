import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ErrorPage from "./error";

describe("ErrorPage", () => {
  it("shows the error message", () => {
    render(<ErrorPage error={new Error("boom")} />);

    expect(screen.getByRole("heading", { name: "エラーが発生しました" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "再試行" })).not.toBeInTheDocument();
  });
});
