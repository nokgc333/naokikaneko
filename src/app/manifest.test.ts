import { describe, it, expect } from "vitest";
import manifest from "./manifest";

describe("manifest", () => {
  it("names the site and starts at the top page", () => {
    expect(manifest()).toMatchObject({
      name: "naokikaneko.com",
      short_name: "NAOKI KANEKO",
      start_url: "/",
      lang: "ja",
    });
  });

  it("matches the theme color declared in the viewport", () => {
    expect(manifest().theme_color).toBe("#ffffff");
  });

  it("lists the favicon and the apple touch icon", () => {
    const sources = (manifest().icons ?? []).map((icon) => icon.src);

    expect(sources).toEqual(["/favicon.ico", "/apple-icon"]);
  });
});
