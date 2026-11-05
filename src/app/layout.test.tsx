import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import RootLayout from "./layout";

vi.mock("./globals.css", () => ({}));
vi.mock("@/components/site-header", () => ({ default: () => <header>header</header> }));
vi.mock("@/components/site-footer", () => ({ default: () => <footer>footer</footer> }));

function renderLayout() {
  return renderToStaticMarkup(
    <RootLayout>
      <p>page body</p>
    </RootLayout>,
  );
}

describe("RootLayout", () => {
  it("renders a Japanese document", () => {
    expect(renderLayout()).toContain('lang="ja"');
  });

  it("places the header, page content and footer in order", () => {
    const html = renderLayout();
    const order = ["header", "page body", "footer"].map((text) => html.indexOf(text));

    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});
