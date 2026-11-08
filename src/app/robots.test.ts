import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("allows everything except /admin and references the sitemap", () => {
    const result = robots();

    expect(result.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    });
    expect(result.sitemap).toBe("https://naokikaneko.com/sitemap.xml");
  });
});
