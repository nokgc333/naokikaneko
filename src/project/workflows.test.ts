import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";

const ci = fs.readFileSync(path.join(process.cwd(), ".github/workflows/ci.yml"), "utf-8");

describe("CI workflow", () => {
  it("checks pushes and pull requests targeting main", () => {
    expect(ci).toMatch(/push:\s*\n\s+branches: \[main, "feature\/\*"\]/);
    expect(ci).toMatch(/pull_request:\s*\n\s+branches: \[main\]/);
  });

  it("cancels superseded runs of the same ref", () => {
    expect(ci).toMatch(
      /concurrency:\s*\n\s+group: \$\{\{ github\.workflow \}\}-\$\{\{ github\.ref \}\}/,
    );
    expect(ci).toContain("cancel-in-progress:");
  });

  it("limits the default token to read access", () => {
    expect(ci).toMatch(/^permissions:\s*\n\s+contents: read/m);
  });

  it("runs the existing static checks, unit tests and build", () => {
    for (const command of [
      "npm run lint",
      "npm run format:check",
      "npm run type-check",
      "npm test",
      "npm run build",
    ]) {
      expect(ci).toContain(command);
    }
    expect([...ci.matchAll(/^ {4}name: (.+)$/gm)].map((match) => match[1])).toEqual([
      "Lint",
      "Type Check",
      "Unit & Integration Tests",
      "Build",
    ]);
  });
});

describe("Security workflow", () => {
  const security = fs.readFileSync(
    path.join(process.cwd(), ".github/workflows/security.yml"),
    "utf-8",
  );

  it("fails the build on high severity production vulnerabilities", () => {
    expect(security).toContain("npm audit --omit=dev --audit-level=high");
  });

  it("reviews the dependencies added by a pull request", () => {
    expect(security).toContain("actions/dependency-review-action");
    expect(security).toMatch(/fail-on-severity: high/);
  });

  it("scans the source with CodeQL", () => {
    expect(security).toContain("github/codeql-action/init");
    expect(security).toContain("github/codeql-action/analyze");
    expect(security).toContain("security-events: write");
  });

  it("also runs on a weekly schedule so new advisories are noticed", () => {
    expect(security).toMatch(/schedule:\s*\n\s+- cron:/);
  });
});
