import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SiteHeader from "./site-header";

describe("SiteHeader", () => {
  it("サイト名がAboutページへのリンクになっている", () => {
    render(<SiteHeader />);
    const siteName = screen.getByRole("link", { name: "NAOKI KANEKO" });
    expect(siteName).toHaveAttribute("href", "/about");
  });

  it("About・Work・Blogへのナビゲーションリンクを持つ", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
  });

  it("GitHubアイコンのリンクを持つ", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "#");
  });
});
