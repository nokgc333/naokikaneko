import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf-8");
const json = (file: string) => JSON.parse(read(file));

describe("Dependabot", () => {
  const config = read(".github/dependabot.yml");

  it("watches npm and GitHub Actions weekly", () => {
    expect(config).toContain("package-ecosystem: npm");
    expect(config).toContain("package-ecosystem: github-actions");
    expect(config.match(/interval: weekly/g)).toHaveLength(2);
  });

  it("groups minor and patch updates to keep the number of pull requests down", () => {
    expect(config).toMatch(/minor-and-patch:/);
  });

  it("ignores the major versions that upstream constraints block", () => {
    for (const name of ["eslint", "typescript", "@types/node"]) {
      expect(config, name).toContain(name);
    }
    expect(config).toContain("version-update:semver-major");
  });
});

describe("pre-commit checks", () => {
  it("runs lint-staged from the husky pre-commit hook", () => {
    expect(read(".husky/pre-commit")).toContain("lint-staged");
  });

  it("enables the hooks on install", () => {
    expect(json("package.json").scripts.prepare).toBe("husky");
  });

  it("checks every staged file for secrets and formats code", () => {
    const config = json(".lintstagedrc.json");

    expect(config["*"]).toContain("secretlint");
    expect(config["*.{ts,tsx,mjs,cjs}"].join(" ")).toContain("eslint");
    expect(config["*.{ts,tsx,mjs,cjs}"].join(" ")).toContain("prettier");
  });

  it("uses the recommended secretlint rules and skips generated files", () => {
    expect(json(".secretlintrc.json").rules[0].id).toBe(
      "@secretlint/secretlint-rule-preset-recommend",
    );
    expect(read(".secretlintignore")).toContain("package-lock.json");
  });
});
