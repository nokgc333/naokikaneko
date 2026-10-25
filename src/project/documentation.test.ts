import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import { contentFrontmatterSchema } from "@/lib/content/schema";
import { workCategories } from "@/lib/content/work-categories";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf-8");

describe("environment documentation", () => {
  const names = [...read(".env.example").matchAll(/^([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]);

  it("lists at least the mail and OAuth variables in .env.example", () => {
    expect(names).toEqual(
      expect.arrayContaining([
        "RESEND_API_KEY",
        "ADMIN_EMAIL",
        "CONTACT_MAIL_FROM",
        "GITHUB_OAUTH_CLIENT_ID",
        "GITHUB_OAUTH_CLIENT_SECRET",
      ]),
    );
  });

  it("explains every variable of .env.example in the README", () => {
    const readme = read("README.md");

    for (const name of names) {
      expect(readme, name).toContain(`\`${name}\``);
    }
  });

  it("explains the Node version, the OAuth callback and the local CMS server in the README", () => {
    const readme = read("README.md");

    expect(readme).toContain(".nvmrc");
    expect(readme).toContain("npm run cms:proxy");
    expect(readme).toContain("/api/decap-oauth/callback");
  });
});

describe("license files", () => {
  it("ships the MIT license for the source code", () => {
    const license = read("LICENSE");

    expect(license).toMatch(/^MIT License/);
    expect(license).toMatch(/Copyright \(c\) \d{4} Naoki Kaneko/);
  });

  it("reserves the rights to the content and images", () => {
    const notice = read("CONTENT_LICENSE.md");

    expect(notice).toContain("content/");
    expect(notice).toContain("public/images/uploads/");
    expect(notice).toMatch(/All rights are reserved/);
  });

  it("points to both licenses from the README", () => {
    const readme = read("README.md");

    expect(readme).toContain("`LICENSE`");
    expect(readme).toContain("`CONTENT_LICENSE.md`");
  });
});

describe("content guide", () => {
  const guide = read("CONTENT_GUIDE.md");

  it("documents every frontmatter field of the schema", () => {
    for (const key of Object.keys(contentFrontmatterSchema.shape)) {
      expect(guide, key).toContain(`\`${key}\``);
    }
  });

  it("lists every category", () => {
    for (const category of workCategories) {
      expect(guide, category).toContain(category);
    }
  });

  it("explains both ways of adding content and the checker", () => {
    expect(guide).toContain("/admin/index.html");
    expect(guide).toContain("content/work/<slug>.mdx");
    expect(guide).toContain("npm run content:check");
  });

  it("is linked from the README and the checker is a package script", () => {
    expect(read("README.md")).toContain("CONTENT_GUIDE.md");
    expect(JSON.parse(read("package.json")).scripts["content:check"]).toBeDefined();
  });

  it("runs the checker in CI", () => {
    expect(read(".github/workflows/ci.yml")).toContain("npm run content:check");
  });
});

describe("design records", () => {
  const adrDir = path.join(process.cwd(), "docs", "adr");
  const adrFiles = fs
    .readdirSync(adrDir)
    .filter((file) => /^\d{4}-.+\.md$/.test(file))
    .sort();

  it("keeps at least four records", () => {
    expect(adrFiles.length).toBeGreaterThanOrEqual(4);
  });

  it("numbers the records consecutively from 0001", () => {
    adrFiles.forEach((file, index) => {
      expect(file.slice(0, 4)).toBe(String(index + 1).padStart(4, "0"));
    });
  });

  it.each(adrFiles)(
    "%s states its status, context, decision, consequences and when to revisit",
    (file) => {
      const text = fs.readFileSync(path.join(adrDir, file), "utf-8");

      expect(text).toMatch(/^# ADR-\d{4}: .+/m);
      expect(text).toMatch(/^- 状態: /m);
      for (const heading of ["## 背景", "## 決定", "## 結果", "## 見直す条件"]) {
        expect(text, heading).toContain(heading);
      }
    },
  );

  it("links every record from the README", () => {
    const readme = read("README.md");

    for (const file of adrFiles) {
      expect(readme, file).toContain(`docs/adr/${file}`);
    }
  });
});

describe("README coverage of scripts", () => {
  it("lists every npm script in the script table", () => {
    const readme = read("README.md");
    const scripts = Object.keys(JSON.parse(read("package.json")).scripts);

    for (const name of scripts) {
      expect(readme, name).toContain(`npm run ${name}`);
    }
  });

  it("describes the architecture, security policy, performance and deployment", () => {
    const readme = read("README.md");

    for (const heading of ["## アーキテクチャ", "## セキュリティ方針", "## 性能", "## デプロイ"]) {
      expect(readme, heading).toContain(heading);
    }
    expect(readme).toContain("```mermaid");
  });
});
