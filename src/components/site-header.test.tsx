import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SiteHeader from "./site-header";

describe("SiteHeader", () => {
  it("links the site name to the About page", () => {
    render(<SiteHeader />);
    const siteName = screen.getByRole("link", { name: "NAOKI KANEKO" });
    expect(siteName).toHaveAttribute("href", "/about");
  });

  it("has navigation links to About, Work and Blog", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
  });

  it("has a GitHub icon link", () => {
    render(<SiteHeader />);
    const githubLink = screen.getByRole("link", { name: "GitHub" });
    expect(githubLink).toHaveAttribute("href", "https://github.com/nokgc333");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
