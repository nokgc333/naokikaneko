import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import { contentFrontmatterSchema } from "@/lib/content/schema";
import { workCategories } from "@/lib/content/work-categories";

const config = fs.readFileSync(path.join(process.cwd(), "public", "admin", "config.yml"), "utf-8");

function collectionBlock(name: string): string {
  const start = config.indexOf(`name: "${name}"`);
  const next = config.indexOf('\n  - name: "', start + 1);
  return config.slice(start, next === -1 ? undefined : next);
}

function fieldNames(block: string): string[] {
  return [...block.matchAll(/- \{ name: "([A-Za-z]+)"/g)].map((match) => match[1]);
}

describe("Decap CMS configuration", () => {
  const schemaKeys = [...Object.keys(contentFrontmatterSchema.shape), "body"];

  it.each(["work", "blog"])("%s defines every frontmatter field of the schema", (collection) => {
    const names = fieldNames(collectionBlock(collection));

    for (const key of schemaKeys) {
      expect(names, `${collection} is missing "${key}"`).toContain(key);
    }
  });

  it.each(["work", "blog"])("%s offers exactly the known categories", (collection) => {
    const block = collectionBlock(collection);
    const options = /name: "category"[^\n]*options: \[([^\]]*)\]/.exec(block)?.[1] ?? "";
    const listed = [...options.matchAll(/"([^"]+)"/g)].map((match) => match[1]);

    expect(listed).toEqual([...workCategories]);
  });

  it("keeps the content folders the site reads from", () => {
    expect(config).toContain('folder: "content/work"');
    expect(config).toContain('folder: "content/blog"');
  });

  it("stores uploaded images where the content checker expects them", () => {
    expect(config).toContain('media_folder: "public/images/uploads"');
    expect(config).toContain('public_folder: "/images/uploads"');
  });
});
