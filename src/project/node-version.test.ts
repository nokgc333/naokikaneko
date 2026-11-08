import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf-8");

describe("pinned Node version", () => {
  const nvmrcMajor = Number(read(".nvmrc").trim().replace(/^v/, "").split(".")[0]);
  const engines = JSON.parse(read("package.json")).engines.node as string;

  it("pins a major version in .nvmrc", () => {
    expect(Number.isInteger(nvmrcMajor)).toBe(true);
    expect(nvmrcMajor).toBeGreaterThanOrEqual(24);
  });

  it("declares the same minimum major version in package.json engines", () => {
    const minimum = Number(/>=\s*(\d+)/.exec(engines)?.[1]);

    expect(minimum).toBe(nvmrcMajor);
  });

  it("makes npm refuse to install on an unsupported Node", () => {
    expect(read(".npmrc")).toMatch(/^engine-strict=true$/m);
  });

  it("runs the tests on the pinned major version", () => {
    expect(Number(process.versions.node.split(".")[0])).toBe(nvmrcMajor);
  });

  it("reads the version from .nvmrc in every workflow instead of hard-coding it", () => {
    const workflows = fs
      .readdirSync(path.join(root, ".github", "workflows"))
      .filter((file) => file.endsWith(".yml"));

    expect(workflows.length).toBeGreaterThan(0);
    for (const file of workflows) {
      const text = read(path.join(".github", "workflows", file));
      expect(text, file).not.toMatch(/^\s*node-version:\s/m);
      if (text.includes("actions/setup-node")) {
        expect(text, file).toContain("node-version-file: .nvmrc");
      }
    }
  });
});
