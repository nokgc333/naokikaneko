import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/decap-oauth/callback", () => {
  it("returns 400 and does not contact GitHub when state does not match the cookie", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const request = new Request(
      "http://localhost:3000/api/decap-oauth/callback?code=dummy&state=wrong-state",
      { headers: { cookie: "decap_oauth_state=correct-state" } },
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns 400 and does not contact GitHub when the state parameter is missing", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const request = new Request("http://localhost:3000/api/decap-oauth/callback?code=dummy", {
      headers: { cookie: "decap_oauth_state=correct-state" },
    });
    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("embeds an access token containing </script> safely, without closing the script tag", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "test-client-secret");
    const dangerousToken = "</script><script>alert(1)</script>";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ access_token: dangerousToken }),
      }),
    );

    const request = new Request(
      "http://localhost:3000/api/decap-oauth/callback?code=dummy&state=correct-state",
      { headers: { cookie: "decap_oauth_state=correct-state" } },
    );
    const response = await GET(request);
    const html = await response.text();

    expect(html).not.toContain("</script><script>alert(1)</script>");
    expect(html).toContain("\\u003c/script\\u003e");
  });

  it("returns 500 without contacting GitHub when GITHUB_OAUTH_CLIENT_SECRET is not set", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "test-client-id");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const request = new Request(
      "http://localhost:3000/api/decap-oauth/callback?code=dummy&state=correct-state",
      { headers: { cookie: "decap_oauth_state=correct-state" } },
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(errorSpy.mock.calls.flat().join(" ")).toContain("GITHUB_OAUTH_CLIENT_SECRET");
    errorSpy.mockRestore();
  });
});

describe("GET /api/decap-oauth/callback error paths", () => {
  const callback = (query: string, cookie?: string) =>
    new Request(`http://localhost:3000/api/decap-oauth/callback?${query}`, {
      headers: cookie ? { cookie } : {},
    });

  it("returns 400 when the state cookie is absent", async () => {
    const response = await GET(callback("code=dummy&state=abc"));

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid state");
  });

  it("returns 400 when the code is missing", async () => {
    const response = await GET(callback("state=abc", "decap_oauth_state=abc"));

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Missing code");
  });

  it("returns 500 without contacting GitHub when the OAuth settings are missing", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await GET(callback("code=dummy&state=abc", "decap_oauth_state=abc"));

    expect(response.status).toBe(500);
    expect(fetchSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("reports the GitHub error text when the token exchange fails", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "id");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ error: "bad_verification_code" }) }),
    );

    const response = await GET(callback("code=dummy&state=abc", "decap_oauth_state=abc"));

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("OAuth error: bad_verification_code");
  });

  it("reports an unknown error when GitHub returns neither a token nor an error", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "id");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({}) }));

    const response = await GET(callback("code=dummy&state=abc", "decap_oauth_state=abc"));

    expect(await response.text()).toBe("OAuth error: unknown");
  });

  it("clears the state cookie after a successful login", async () => {
    vi.stubEnv("GITHUB_OAUTH_CLIENT_ID", "id");
    vi.stubEnv("GITHUB_OAUTH_CLIENT_SECRET", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ access_token: "token-1" }) }),
    );

    const response = await GET(callback("code=dummy&state=abc", "decap_oauth_state=abc"));

    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
