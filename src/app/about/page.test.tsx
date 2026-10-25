import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About, { metadata } from "./page";

describe("About", () => {
  it('shows "Naoki Kaneko" in the heading', () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: /naoki kaneko/i })).toBeInTheDocument();
  });
});

describe("About metadata", () => {
  it("declares the canonical URL of the page", () => {
    expect(metadata.alternates?.canonical).toBe("/about");
  });
});
