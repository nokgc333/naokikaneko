import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { contentFrontmatterSchema, type ContentEntry } from "./schemas/content";

type Collection = "work" | "blog";

export function getEntries(collection: Collection): ContentEntry[] {
  const dir = path.join(process.cwd(), "content", collection);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".md"));

  const entries = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = contentFrontmatterSchema.parse(data);
    return { ...frontmatter, body: content.trim() };
  });

  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getEntry(collection: Collection, slug: string): ContentEntry | undefined {
  return getEntries(collection).find((entry) => entry.slug === slug);
}
