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

  it("frontmatterを検証し、日付の新しい順に並べて返す", () => {
    fs.writeFileSync(
      path.join(tempDir, "content", "work", "old.md"),
      `---\ntitle: Old\nslug: old\ndate: "2024-01-01"\ndescription: old entry\n---\nOld body`
    );
    fs.writeFileSync(
      path.join(tempDir, "content", "work", "new.md"),
      `---\ntitle: New\nslug: new\ndate: "2025-01-01"\ndescription: new entry\n---\nNew body`
    );

    const entries = getEntries("work");

    expect(entries).toHaveLength(2);
    expect(entries[0].slug).toBe("new");
    expect(entries[1].slug).toBe("old");
    expect(entries[0].body.trim()).toBe("New body");
  });

  it("存在しないディレクトリの場合は空配列を返す", () => {
    const entries = getEntries("blog");
    expect(entries).toEqual([]);
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
      `---\ntitle: Target\nslug: target\ndate: "2025-01-01"\ndescription: target entry\n---\nTarget body`
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("slugが一致するエントリを返す", () => {
    const entry = getEntry("work", "target");
    expect(entry?.title).toBe("Target");
  });

  it("slugが一致しない場合はundefinedを返す", () => {
    const entry = getEntry("work", "not-found");
    expect(entry).toBeUndefined();
  });
});
