import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

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
