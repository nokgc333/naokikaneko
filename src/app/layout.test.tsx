import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import RootLayout, { metadata, viewport } from "./layout";

const fontOptions = vi.hoisted(() => new Map<string, Record<string, unknown>>());

vi.mock("next/font/google", () => {
  const font = (name: string) => (options: Record<string, unknown>) => {
    fontOptions.set(name, options);
    return { variable: `--font-${name}` };
  };
  return { Roboto: font("roboto"), Noto_Sans_JP: font("noto"), Geist_Mono: font("mono") };
});
vi.mock("./globals.css", () => ({}));
vi.mock("@/components/site-header", () => ({ default: () => <header>header</header> }));
vi.mock("@/components/site-footer", () => ({ default: () => <footer>footer</footer> }));
vi.mock("@/components/contact-widget", () => ({ default: () => <aside>widget</aside> }));

function renderLayout() {
  return renderToStaticMarkup(
    <RootLayout {...({ children: <p>page body</p> } as React.ComponentProps<typeof RootLayout>)} />,
  );
}

describe("RootLayout fonts", () => {
  it("never swaps the Japanese web font in after first paint, to avoid layout shift", () => {
    expect(fontOptions.get("noto")?.display).toBe("optional");
  });

  it("does not preload the fonts that are not needed for the first paint", () => {
    expect(fontOptions.get("noto")?.preload).toBe(false);
    expect(fontOptions.get("mono")?.preload).toBe(false);
  });
});

describe("RootLayout accessibility landmarks", () => {
  it("puts a skip link to the main content before everything else", () => {
    const html = renderLayout();

    expect(html.indexOf('href="#main-content"')).toBeGreaterThan(-1);
    expect(html.indexOf('href="#main-content"')).toBeLessThan(html.indexOf("header"));
    expect(html).toContain("Skip to main content");
  });

  it("makes the content wrapper a focus target for the skip link", () => {
    const html = renderLayout();

    expect(html).toMatch(/<div id="main-content" tabindex="-1"/);
  });
});

describe("RootLayout", () => {
  it("renders a Japanese document with the font variables on the html element", () => {
    const html = renderLayout();

    expect(html).toContain('lang="ja"');
    expect(html).toContain("--font-roboto");
    expect(html).toContain("--font-noto");
    expect(html).toContain("--font-mono");
  });

  it("places the header, page content, footer and contact widget in order", () => {
    const html = renderLayout();

    const order = ["header", "page body", "footer", "widget"].map((text) => html.indexOf(text));
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
