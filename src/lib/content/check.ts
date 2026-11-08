import { contentFrontmatterSchema } from "./schema";

export type RawEntry = { file: string; data: Record<string, unknown> };
export type CheckIssue = { file: string; message: string };
export type Collection = "work" | "blog";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UPLOAD_PREFIX = "/images/uploads/";
const THUMBNAIL_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "svg"];

function isRealDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function checkDates(data: Record<string, unknown>): string[] {
  const problems: string[] = [];
  for (const key of ["date", "updatedDate"] as const) {
    if (!isRealDate(data[key])) problems.push(`${key} must be a real date written as YYYY-MM-DD`);
  }
  if (problems.length === 0 && (data.updatedDate as string) < (data.date as string)) {
    problems.push("updatedDate must not be earlier than date");
  }
  return problems;
}

function checkThumbnail(
  thumbnail: unknown,
  fileExists: (publicPath: string) => boolean,
): string[] {
  if (thumbnail === undefined) return [];
  if (typeof thumbnail !== "string" || !thumbnail.startsWith(UPLOAD_PREFIX)) {
    return [`thumbnail must be under ${UPLOAD_PREFIX}`];
  }
  const extension = thumbnail.split(".").pop()?.toLowerCase() ?? "";
  if (!THUMBNAIL_EXTENSIONS.includes(extension)) {
    return ["thumbnail must be a png, jpg, jpeg, webp or svg file"];
  }
  return fileExists(thumbnail) ? [] : [`thumbnail does not exist: public${thumbnail}`];
}

function checkTagsAndUrl(data: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const tags = Array.isArray(data.tags) ? data.tags : [];
  if (tags.some((tag) => typeof tag !== "string" || tag.trim() === "" || tag !== tag.trim())) {
    problems.push("tags must not contain empty values or surrounding spaces");
  }
  if (typeof data.url === "string" && !/^https?:\/\//.test(data.url)) {
    problems.push("url must start with http:// or https://");
  }
  return problems;
}

function checkSlug(file: string, slug: unknown): string[] {
  if (typeof slug !== "string") return [];
  const problems: string[] = [];
  if (!SLUG_PATTERN.test(slug)) problems.push("slug must use lowercase letters, digits and hyphens");
  const stem = file.replace(/\.mdx?$/, "");
  if (stem !== slug) problems.push(`slug "${slug}" must match the file name "${stem}"`);
  return problems;
}

function checkOne(
  collection: Collection,
  { file, data }: RawEntry,
  fileExists: (publicPath: string) => boolean,
): string[] {
  const problems: string[] = [];
  const parsed = contentFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      problems.push(`${issue.path.join(".") || "frontmatter"}: ${issue.message}`);
    }
  }
  if (collection === "work" && data.category === undefined) {
    problems.push("category is required for Work entries");
  }
  problems.push(...checkSlug(file, data.slug), ...checkDates(data));
  problems.push(...checkThumbnail(data.thumbnail, fileExists), ...checkTagsAndUrl(data));
  return problems;
}

export function checkCollection(
  collection: Collection,
  entries: RawEntry[],
  fileExists: (publicPath: string) => boolean,
): CheckIssue[] {
  const issues: CheckIssue[] = [];
  const seen = new Map<string, string>();

  for (const entry of entries) {
    for (const message of checkOne(collection, entry, fileExists)) {
      issues.push({ file: entry.file, message });
    }
    const slug = entry.data.slug;
    if (typeof slug === "string") {
      const first = seen.get(slug);
      if (first !== undefined) {
        issues.push({ file: entry.file, message: `duplicated slug "${slug}" (also used by ${first})` });
      } else {
        seen.set(slug, entry.file);
      }
    }
  }
  return issues;
}
