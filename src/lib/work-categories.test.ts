import { describe, it, expect } from "vitest";
import { workCategories } from "./work-categories";
import { contentFrontmatterSchema } from "./schemas/content";

describe("workCategories", () => {
  it("lists every category the content schema accepts", () => {
    for (const category of workCategories) {
      const parsed = contentFrontmatterSchema.safeParse({
        title: "t",
        slug: "s",
        date: "2025-01-01",
        updatedDate: "2025-01-01",
        description: "d",
        category,
      });

      expect(parsed.success).toBe(true);
    }
  });

  it("falls back to Others when the schema receives no category", () => {
    const parsed = contentFrontmatterSchema.parse({
      title: "t",
      slug: "s",
      date: "2025-01-01",
      updatedDate: "2025-01-01",
      description: "d",
    });

    expect(parsed.category).toBe("Others");
    expect(workCategories).toContain(parsed.category);
  });
});
