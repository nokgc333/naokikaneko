import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("404の見出しとトップへのリンクを表示する", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /トップに戻る/ })).toHaveAttribute("href", "/");
  });
});
