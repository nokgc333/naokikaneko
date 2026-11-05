import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import RootLayout, { metadata, viewport } from "./layout";

vi.mock("./globals.css", () => ({}));
vi.mock("@/components/site-header", () => ({ default: () => <header>header</header> }));
vi.mock("@/components/site-footer", () => ({ default: () => <footer>footer</footer> }));

vi.mock("@/components/contact-widget", () => ({ default: () => <aside>contact widget</aside> }));

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
    const order = ["header", "page body", "footer", "contact widget"].map((text) =>
      html.indexOf(text),
    );

    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("exports the site-wide metadata", () => {
    expect(metadata.title).toEqual({
      default: "naokikaneko.com",
      template: "%s | naokikaneko.com",
    });
    expect(metadata.openGraph).toMatchObject({ locale: "ja_JP", type: "website" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("declares the theme color in the viewport", () => {
    expect(viewport.themeColor).toBe("#ffffff");
  });

  it("embeds WebSite and Person structured data on every page", () => {
    const html = renderLayout();

    expect(html.match(/application\/ld\+json/g)).toHaveLength(2);
    expect(html).toContain("WebSite");
    expect(html).toContain("Person");
  });
});
