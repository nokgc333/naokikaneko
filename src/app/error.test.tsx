import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ErrorPage from "./error";

describe("ErrorPage", () => {
  it("エラーメッセージを表示する", () => {
    render(<ErrorPage error={new Error("boom")} retry={() => {}} />);

    expect(screen.getByRole("heading", { name: "エラーが発生しました" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "再試行" })).not.toBeInTheDocument();
  });
});
