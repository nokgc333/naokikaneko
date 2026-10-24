import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";
import { getEntries, getEntry } from "./content";

describe("getEntries", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
    fs.mkdirSync(path.join(tempDir, "content", "work"), { recursive: true });
    vi.spyOn(process, "cwd").mockReturnValue(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("validates frontmatter and returns entries sorted by date, newest first", () => {
    fs.writeFileSync(
      path.join(tempDir, "content", "work", "old.md"),
      `---\ntitle: Old\nslug: old\ndate: "2024-01-01"\nupdatedDate: "2024-01-01"\ndescription: old entry\n---\nOld body`
    );
    fs.writeFileSync(
      path.join(tempDir, "content", "work", "new.md"),
      `---\ntitle: New\nslug: new\ndate: "2025-01-01"\nupdatedDate: "2025-01-01"\ndescription: new entry\n---\nNew body`
    );

    const entries = getEntries("work");

    expect(entries).toHaveLength(2);
    expect(entries[0].slug).toBe("new");
    expect(entries[1].slug).toBe("old");
    expect(entries[0].body.trim()).toBe("New body");
  });

  it("returns an empty array for a directory that does not exist", () => {
    const entries = getEntries("blog");
    expect(entries).toEqual([]);
  });

  it("also reads .mdx files", () => {
    fs.writeFileSync(
      path.join(tempDir, "content", "work", "mdx-entry.mdx"),
      `---\ntitle: MDX Entry\nslug: mdx-entry\ndate: "2025-06-01"\nupdatedDate: "2025-06-01"\ndescription: mdx entry\n---\nMDX body`
    );

    const entries = getEntries("work");

    expect(entries).toHaveLength(1);
    expect(entries[0].slug).toBe("mdx-entry");
  });
});

describe("getEntry", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-test-"));
    fs.mkdirSync(path.join(tempDir, "content", "work"), { recursive: true });
    vi.spyOn(process, "cwd").mockReturnValue(tempDir);
    fs.writeFileSync(
      path.join(tempDir, "content", "work", "target.md"),
      `---\ntitle: Target\nslug: target\ndate: "2025-01-01"\nupdatedDate: "2025-01-01"\ndescription: target entry\n---\nTarget body`
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("returns the entry whose slug matches", () => {
    const entry = getEntry("work", "target");
    expect(entry?.title).toBe("Target");
  });

  it("returns undefined when no slug matches", () => {
    const entry = getEntry("work", "not-found");
    expect(entry).toBeUndefined();
  });
});
