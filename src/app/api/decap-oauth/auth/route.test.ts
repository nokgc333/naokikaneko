import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("GET /api/decap-oauth/auth", () => {
  it("redirects to the GitHub authorization URL", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "test-client-secret");
    const request = new Request("http://localhost:3000/api/decap-oauth/auth");
    const response = await GET(request);
    expect(response.status).toBe(302);
    const location = response.headers.get("location");
    expect(location).toContain("https://github.com/login/oauth/authorize");
    expect(location).toContain("client_id=test-client-id");
  });

  it("generates a CSRF state parameter and includes it in both the authorization URL and the cookie", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "test-client-secret");
    const request = new Request("http://localhost:3000/api/decap-oauth/auth");
    const response = await GET(request);

    const location = new URL(response.headers.get("location") ?? "");
    const stateInUrl = location.searchParams.get("state");
    expect(stateInUrl).toBeTruthy();

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toContain(`decap_oauth_state=${stateInUrl}`);
    expect(setCookie).toContain("HttpOnly");
  });

  it("returns 500 instead of redirecting with an empty client_id when GITHUB_OAUTH_CLIENT_ID is not set", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const request = new Request("http://localhost:3000/api/decap-oauth/auth");

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(response.headers.get("location")).toBeNull();
    expect(errorSpy.mock.calls.flat().join(" ")).toContain("GITHUB_OAUTH_CLIENT_ID");
    errorSpy.mockRestore();
  });
});

describe("GET /api/decap-oauth/auth cookie attributes", () => {
  it("adds Secure to the state cookie over https", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");

    const response = await GET(new Request("https://example.com/api/decap-oauth/auth"));

    expect(response.headers.get("set-cookie")).toContain("Secure");
  });

  it("omits Secure over plain http so local development keeps working", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");

    const response = await GET(new Request("http://localhost:3000/api/decap-oauth/auth"));

    expect(response.headers.get("set-cookie")).not.toContain("Secure");
  });
});

describe("GET /api/decap-oauth/auth hardening", () => {
  it("requests only the public_repo scope", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");

    const response = await GET(new Request("http://localhost:3000/api/decap-oauth/auth"));

    const location = new URL(response.headers.get("location") ?? "");
    expect(location.searchParams.get("scope")).toBe("public_repo");
  });

  it("rate-limits repeated requests from one client", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");
    resetRateLimit();
    const request = () =>
      new Request("http://localhost:3000/api/decap-oauth/auth", {
        headers: { "x-forwarded-for": "203.0.113.9" },
      });

    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) statuses.push((await GET(request())).status);

    expect(statuses.slice(0, 10).every((status) => status === 302)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
  });

  it("counts different clients separately", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");
    resetRateLimit();
    const from = (ip: string) =>
      new Request("http://localhost:3000/api/decap-oauth/auth", {
        headers: { "x-forwarded-for": ip },
      });
    for (let i = 0; i < 10; i++) await GET(from("203.0.113.1"));

    expect((await GET(from("203.0.113.1"))).status).toBe(429);
    expect((await GET(from("203.0.113.2"))).status).toBe(302);
  });

  it("does not share its budget with the contact form", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");
    resetRateLimit();
    for (let i = 0; i < 5; i++) checkRateLimit("203.0.113.5");

    const response = await GET(
      new Request("http://localhost:3000/api/decap-oauth/auth", {
        headers: { "x-forwarded-for": "203.0.113.5" },
      }),
    );

    expect(response.status).toBe(302);
  });
});
