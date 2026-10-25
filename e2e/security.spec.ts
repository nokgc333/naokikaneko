import { test, expect } from "@playwright/test";

const paths = ["/", "/about", "/blog", "/work/naokikaneko-com"];

for (const path of paths) {
  test(`sends the security headers on ${path}`, async ({ request }) => {
    const headers = (await request.get(path)).headers();

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("object-src 'none'");
  });
}

test("does not reveal the framework in the X-Powered-By header", async ({ request }) => {
  const headers = (await request.get("/")).headers();

  expect(headers["x-powered-by"]).toBeUndefined();
});

test("does not apply the page CSP to the CMS entry page", async ({ request }) => {
  const headers = (await request.get("/admin/index.html")).headers();

  expect(headers["content-security-policy"]).toBeUndefined();
});
