import { describe, it, expect, vi } from "vitest";
import { ENTRY_OG_SIZE, pickOgHeadline, renderEntryOgImage } from "./entry-og-image";

const imageResponse = vi.fn();
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(...args: unknown[]) {
      imageResponse(...args);
    }
  },
}));

describe("pickOgHeadline", () => {
  it("uses the title when it can be drawn with the default font", () => {
    expect(pickOgHeadline("pipeboard", "Work")).toBe("pipeboard");
  });

  it("falls back to the section label when the title has Japanese characters", () => {
    expect(pickOgHeadline("MDXでできること", "Blog")).toBe("Blog");
  });

  it("falls back for an empty title", () => {
    expect(pickOgHeadline("", "Work")).toBe("Work");
  });
});

describe("renderEntryOgImage", () => {
  it("renders at the standard Open Graph size", () => {
    renderEntryOgImage("pipeboard", "Work");

    const [, options] = imageResponse.mock.calls.at(-1) ?? [];
    expect(options).toEqual(ENTRY_OG_SIZE);
  });

  it("puts the headline and the owner name in the image", () => {
    renderEntryOgImage("pipeboard", "Work");

    const [element] = imageResponse.mock.calls.at(-1) ?? [];
    const text = JSON.stringify(element);
    expect(text).toContain("pipeboard");
    expect(text).toContain("NAOKI KANEKO");
  });
});
