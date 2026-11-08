import { describe, it, expect, vi, beforeEach } from "vitest";
import Image, { alt, contentType, generateStaticParams, size } from "./opengraph-image";

const getEntry = vi.fn();
const getEntries = vi.fn();
const renderEntryOgImage = vi.fn((...args: unknown[]) => ({ rendered: args }));
vi.mock("@/lib/content", () => ({
  getEntry: (...args: unknown[]) => getEntry(...args),
  getEntries: (...args: unknown[]) => getEntries(...args),
}));
vi.mock("@/lib/seo/entry-og-image", () => ({
  ENTRY_OG_SIZE: { width: 1200, height: 630 },
  ENTRY_OG_CONTENT_TYPE: "image/png",
  renderEntryOgImage: (...args: unknown[]) => renderEntryOgImage(...args),
}));

describe("work opengraph-image", () => {
  beforeEach(() => vi.clearAllMocks());

  it("declares a png of the standard size", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    expect(alt).toBe("Work");
  });

  it("draws the title of the requested entry", async () => {
    getEntry.mockReturnValue({ title: "pipeboard" });

    await Image({ params: Promise.resolve({ slug: "pipeboard" }) });

    expect(getEntry).toHaveBeenCalledWith("work", "pipeboard");
    expect(renderEntryOgImage).toHaveBeenCalledWith("pipeboard", "Work");
  });

  it("falls back to an empty title for an unknown slug", async () => {
    getEntry.mockReturnValue(undefined);

    await Image({ params: Promise.resolve({ slug: "nope" }) });

    expect(renderEntryOgImage).toHaveBeenCalledWith("", "Work");
  });

  it("pre-renders one image per entry", () => {
    getEntries.mockReturnValue([{ slug: "a" }, { slug: "b" }]);

    expect(generateStaticParams()).toEqual([{ slug: "a" }, { slug: "b" }]);
    expect(getEntries).toHaveBeenCalledWith("work");
  });
});
