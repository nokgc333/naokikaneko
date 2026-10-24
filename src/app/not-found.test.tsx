import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("shows the 404 heading and a link to the top page", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /トップに戻る/ })).toHaveAttribute("href", "/");
  });
});
