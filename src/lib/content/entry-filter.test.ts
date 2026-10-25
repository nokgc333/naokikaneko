import { describe, it, expect } from "vitest";
import { ENTRY_FILTERS, filterAndSortEntries, toggleSortOrder } from "./entry-filter";
import type { ContentEntry } from "@/lib/content/schema";

const make = (slug: string, category: ContentEntry["category"]): ContentEntry => ({
  title: slug,
  slug,
  date: "2025-01-01",
  updatedDate: "2025-01-01",
  tags: [],
  category,
  description: slug,
  body: "",
});

const entries = [make("a", "Tool"), make("b", "HDA"), make("c", "Tool")];

describe("filterAndSortEntries", () => {
  it("keeps every entry for All", () => {
    expect(filterAndSortEntries(entries, "All", "desc").map((e) => e.slug)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("keeps only the entries of the chosen category", () => {
    expect(filterAndSortEntries(entries, "Tool", "desc").map((e) => e.slug)).toEqual(["a", "c"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterAndSortEntries(entries, "HP", "desc")).toEqual([]);
  });

  it("reverses the order for ascending without changing the input", () => {
    const result = filterAndSortEntries(entries, "All", "asc");

    expect(result.map((e) => e.slug)).toEqual(["c", "b", "a"]);
    expect(entries.map((e) => e.slug)).toEqual(["a", "b", "c"]);
  });
});

describe("toggleSortOrder", () => {
  it("flips between descending and ascending", () => {
    expect(toggleSortOrder("desc")).toBe("asc");
    expect(toggleSortOrder("asc")).toBe("desc");
  });
});

describe("ENTRY_FILTERS", () => {
  it("starts with All followed by the work categories", () => {
    expect(ENTRY_FILTERS[0]).toBe("All");
    expect(ENTRY_FILTERS).toContain("Tool");
  });
});
