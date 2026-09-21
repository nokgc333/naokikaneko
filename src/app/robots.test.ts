import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("/adminを除いて全て許可し、sitemapを参照する", () => {
    const result = robots();

    expect(result.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    });
    expect(result.sitemap).toBe("https://naokikaneko.vercel.app/sitemap.xml");
  });
});
