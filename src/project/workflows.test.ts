import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";

const read = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), ".github", "workflows", file), "utf-8");

describe("CI workflow", () => {
  const ci = read("ci.yml");

  it("cancels superseded runs of the same ref", () => {
    expect(ci).toMatch(
      /concurrency:\s*\n\s+group: \$\{\{ github\.workflow \}\}-\$\{\{ github\.ref \}\}/,
    );
    expect(ci).toContain("cancel-in-progress:");
  });

  it("limits the default token to read access", () => {
    expect(ci).toMatch(/^permissions:\s*\n\s+contents: read/m);
  });

  it("runs the format check, the unit tests, the e2e tests and the performance budget", () => {
    for (const command of [
      "npm run format:check",
      "npm run test:coverage",
      "npm run test:e2e",
      "npm run test:perf",
    ]) {
      expect(ci).toContain(command);
    }
  });
});

describe("Security workflow", () => {
  const security = read("security.yml");

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
