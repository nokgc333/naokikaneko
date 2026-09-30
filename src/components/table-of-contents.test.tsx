import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TableOfContents from "./table-of-contents";
import type { TocHeading } from "@/lib/toc";

const headings: TocHeading[] = [
  { id: "user-content-heading-1", text: "見出し1", depth: 2 },
  { id: "user-content-heading-2", text: "見出し2", depth: 3 },
];

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let observeCallback: ObserverCallback | undefined;

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    observeCallback = callback;
  }
  observe() {}
  disconnect() {}
}

describe("TableOfContents", () => {
  beforeEach(() => {
    observeCallback = undefined;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    for (const heading of headings) {
      const el = document.createElement("h2");
      el.id = heading.id;
      document.body.appendChild(el);
    }
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("見出しが無い場合は何も描画しない", () => {
    const { container } = render(<TableOfContents headings={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("各見出しへのアンカーリンクを表示する", () => {
    render(<TableOfContents headings={headings} />);

    expect(screen.getByRole("link", { name: "見出し1" })).toHaveAttribute(
      "href",
      "#user-content-heading-1"
    );
    expect(screen.getByRole("link", { name: "見出し2" })).toHaveAttribute(
      "href",
      "#user-content-heading-2"
    );
  });

  it("交差した見出しをアクティブ表示にする", () => {
    render(<TableOfContents headings={headings} />);
    const activeLink = screen.getByRole("link", { name: "見出し2" });

    expect(activeLink).toHaveClass("text-muted-foreground");

    act(() => {
      observeCallback?.([
        { isIntersecting: true, target: document.getElementById("user-content-heading-2")! },
      ]);
    });

    expect(screen.getByRole("link", { name: "見出し2" })).toHaveClass("text-foreground");
  });
});
