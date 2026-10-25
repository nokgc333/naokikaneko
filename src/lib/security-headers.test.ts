import { describe, it, expect } from "vitest";
import { buildSecurityHeaders } from "./security-headers";

function headerMap(isDev: boolean) {
  return new Map(buildSecurityHeaders({ isDev }).map((h) => [h.key, h.value]));
}

describe("buildSecurityHeaders", () => {
  it("returns exactly the required headers", () => {
    expect([...headerMap(false).keys()].sort()).toEqual(
      [
        "Content-Security-Policy",
        "Permissions-Policy",
        "Referrer-Policy",
        "Strict-Transport-Security",
        "X-Content-Type-Options",
        "X-Frame-Options",
      ].sort(),
    );
  });

  it("enforces HTTPS for at least one year", () => {
    const value = headerMap(false).get("Strict-Transport-Security") ?? "";
    const maxAge = Number(/max-age=(\d+)/.exec(value)?.[1]);

    expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
  });

  it("disables the camera, microphone, geolocation, payment and USB features", () => {
    const value = headerMap(false).get("Permissions-Policy") ?? "";

    for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"]) {
      expect(value).toContain(`${feature}=()`);
    }
  });

  it("forbids embedding in other sites and disables MIME sniffing", () => {
    const headers = headerMap(false);

    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("restricts plugins, cross-origin form submission, the base element and embedding in the CSP", () => {
    const csp = headerMap(false).get("Content-Security-Policy") ?? "";

    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("default-src 'self'");
  });

  it("does not include 'unsafe-eval' in the production CSP", () => {
    expect(headerMap(false).get("Content-Security-Policy")).not.toContain("'unsafe-eval'");
  });

  it("allows 'unsafe-eval' in the development CSP only, for hot reloading", () => {
    expect(headerMap(true).get("Content-Security-Policy")).toContain("'unsafe-eval'");
  });
});
