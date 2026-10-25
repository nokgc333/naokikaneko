import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";

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
