import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";

describe("next.config", () => {
  it("does not expose the framework through X-Powered-By", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("applies the security headers to every path except the admin page (/admin)", async () => {
    const rules = (await nextConfig.headers?.()) ?? [];

    expect(rules).toHaveLength(1);
    const pattern = new RegExp(`^${rules[0].source}$`);
    expect(pattern.test("/")).toBe(true);
    expect(pattern.test("/about")).toBe(true);
    expect(pattern.test("/api/contact")).toBe(true);
    expect(pattern.test("/admin")).toBe(false);
    expect(pattern.test("/admin/index.html")).toBe(false);
  });

  it("includes HSTS and Permissions-Policy among the applied headers", async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    const keys = rules[0].headers.map((h) => h.key);

    expect(keys).toContain("Strict-Transport-Security");
    expect(keys).toContain("Permissions-Policy");
  });
});
