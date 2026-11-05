import { describe, it, expect } from "vitest";
import { checkCollection, type RawEntry } from "./check";

const base = {
  title: "T",
  slug: "sample",
  date: "2026-01-01",
  updatedDate: "2026-01-02",
  tags: ["a"],
  category: "Tool",
  thumbnail: "/images/uploads/sample.png",
  description: "d",
};

const entry = (data: Record<string, unknown>, file = "sample.mdx"): RawEntry => ({
  file,
  data: { ...base, ...data },
});

const exists = (path: string) => path === "/images/uploads/sample.png";

const messages = (entries: RawEntry[], collection: "work" | "blog" = "work") =>
  checkCollection(collection, entries, exists).map((issue) => issue.message);

describe("checkCollection", () => {
  it("accepts a valid entry", () => {
    expect(messages([entry({})])).toEqual([]);
  });

  it("reports a schema violation with the offending field", () => {
    const result = messages([entry({ description: "" })]);

    expect(result.some((m) => m.includes("description"))).toBe(true);
  });

  it("requires the slug to match the file name", () => {
    expect(messages([entry({ slug: "other" })]).join()).toContain("must match the file name");
  });

  it("reports a duplicated slug", () => {
    const result = messages([entry({}, "sample.mdx"), entry({ slug: "sample" }, "sample.md")]);

    expect(result.join()).toContain("duplicated slug");
  });

  it("rejects a slug that is not URL friendly", () => {
    expect(messages([entry({ slug: "Bad Slug" }, "Bad Slug.mdx")]).join()).toContain(
      "lowercase letters, digits and hyphens",
    );
  });

  it.each(["2026/01/01", "2026-13-01", "2026-02-30", "yesterday"])(
    "rejects the date %s",
    (value) => {
      expect(messages([entry({ date: value, updatedDate: "2026-12-31" })]).join()).toContain(
        "date",
      );
    },
  );

  it("rejects an update date earlier than the date", () => {
    expect(messages([entry({ date: "2026-05-01", updatedDate: "2026-04-01" })]).join()).toContain(
      "updatedDate",
    );
  });

  it("requires a Work entry to set its category explicitly", () => {
    const { category: _omit, ...withoutCategory } = base;
    void _omit;

    const result = checkCollection("work", [{ file: "sample.mdx", data: withoutCategory }], exists);

    expect(result.map((i) => i.message).join()).toContain("category");
  });

  it("rejects a category that is not one of the known categories", () => {
    expect(messages([entry({ category: "Misc" })]).length).toBeGreaterThan(0);
  });

  it("requires a thumbnail to live in /images/uploads/ and to exist", () => {
    expect(messages([entry({ thumbnail: "/elsewhere/x.png" })]).join()).toContain(
      "/images/uploads/",
    );
    expect(messages([entry({ thumbnail: "/images/uploads/missing.png" })]).join()).toContain(
      "does not exist",
    );
  });

  it("accepts an entry without a thumbnail", () => {
    const { thumbnail: _omit, ...withoutThumbnail } = base;
    void _omit;

    expect(
      checkCollection("work", [{ file: "sample.mdx", data: withoutThumbnail }], exists),
    ).toEqual([]);
  });

  it("rejects a thumbnail with an unsupported extension", () => {
    expect(
      messages([entry({ thumbnail: "/images/uploads/sample.bmp" })]).join(),
    ).toContain("png, jpg, jpeg, webp or svg");
  });

  it("requires url to be an http(s) address", () => {
    expect(messages([entry({ url: "javascript:alert(1)" })]).join()).toContain("http");
    expect(messages([entry({ url: "https://example.com" })])).toEqual([]);
  });

  it("rejects empty or padded tags", () => {
    expect(messages([entry({ tags: ["ok", " "] })]).join()).toContain("tags");
    expect(messages([entry({ tags: [" padded"] })]).join()).toContain("tags");
  });

  it("does not require a category for blog posts", () => {
    const { category: _omit, ...withoutCategory } = base;
    void _omit;

    expect(
      checkCollection("blog", [{ file: "sample.mdx", data: withoutCategory }], exists),
    ).toEqual([]);
  });

  it("names the file in every issue", () => {
    const issues = checkCollection("work", [entry({ description: "" }, "broken.mdx")], exists);

    expect(issues.every((issue) => issue.file === "broken.mdx")).toBe(true);
  });
});
