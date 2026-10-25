import { describe, it, expect, beforeEach } from "vitest";
import { isOauthRateLimited, rateLimitedResponse } from "./oauth-rate-limit";
import { resetRateLimit } from "./rate-limit";

const from = (ip: string) =>
  new Request("http://localhost/x", { headers: { "x-forwarded-for": ip } });

describe("isOauthRateLimited", () => {
  beforeEach(() => resetRateLimit());

  it("allows ten requests and blocks the eleventh from one client", () => {
    const results = Array.from({ length: 11 }, () => isOauthRateLimited(from("192.0.2.1")));

    expect(results.slice(0, 10).every((limited) => limited === false)).toBe(true);
    expect(results[10]).toBe(true);
  });

  it("keeps a separate budget per client", () => {
    for (let i = 0; i < 10; i++) isOauthRateLimited(from("192.0.2.1"));

    expect(isOauthRateLimited(from("192.0.2.2"))).toBe(false);
  });
});

describe("rateLimitedResponse", () => {
  it("is a 429 without a body that reveals internals", async () => {
    const response = rateLimitedResponse();

    expect(response.status).toBe(429);
    expect(await response.text()).toBe("Too many requests");
  });
});
