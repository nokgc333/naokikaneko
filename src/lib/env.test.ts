import { describe, it, expect, vi, afterEach } from "vitest";
import { describeEnvProblem, loadContactMailEnv, loadGithubOAuthEnv } from "./env";

const CONTACT_ENV = {
  RESEND_API_KEY: "re_test_key",
  ADMIN_EMAIL: "admin@example.com",
  CONTACT_MAIL_FROM: "お問い合わせ <contact@example.com>",
};

describe("loadContactMailEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the values when all three are set", () => {
    const result = loadContactMailEnv(CONTACT_ENV);

    expect(result).toEqual({ ok: true, value: CONTACT_ENV });
  });

  it("returns every missing variable name when nothing is set", () => {
    const result = loadContactMailEnv({});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect([...result.missing].sort()).toEqual(
        ["ADMIN_EMAIL", "CONTACT_MAIL_FROM", "RESEND_API_KEY"].sort(),
      );
      expect(result.invalid).toEqual([]);
    }
  });

  it("treats an empty string as unset", () => {
    const result = loadContactMailEnv({ ...CONTACT_ENV, RESEND_API_KEY: "" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.missing).toEqual(["RESEND_API_KEY"]);
  });

  it("reports ADMIN_EMAIL as invalid, distinct from missing, when it is not an email address", () => {
    const result = loadContactMailEnv({
      ...CONTACT_ENV,
      ADMIN_EMAIL: "not-an-email",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.missing).toEqual([]);
      expect(result.invalid).toEqual(["ADMIN_EMAIL"]);
    }
  });

  it("reads process.env when the argument is omitted", () => {
    vi.stubEnv("RESEND_API_KEY", "re_from_process_env");
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    vi.stubEnv("CONTACT_MAIL_FROM", "from@example.com");

    const result = loadContactMailEnv();

    expect(result.ok && result.value.RESEND_API_KEY).toBe("re_from_process_env");
  });
});

describe("loadGithubOAuthEnv", () => {
  it("returns the values when both are set", () => {
    const env = {
      GITHUB_OAUTH_CLIENT_ID: "client-id",
      GITHUB_OAUTH_CLIENT_SECRET: "client-secret",
    };

    expect(loadGithubOAuthEnv(env)).toEqual({ ok: true, value: env });
  });

  it("returns only the missing variable name when one is absent", () => {
    const result = loadGithubOAuthEnv({ GITHUB_OAUTH_CLIENT_ID: "client-id" });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.missing).toEqual(["GITHUB_OAUTH_CLIENT_SECRET"]);
  });
});

describe("describeEnvProblem", () => {
  it("names the missing and invalid variables without including any configured value", () => {
    const result = loadContactMailEnv({
      ADMIN_EMAIL: "not-an-email",
      RESEND_API_KEY: "re_super_secret",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    const message = describeEnvProblem(result);

    expect(message).toContain("CONTACT_MAIL_FROM");
    expect(message).toContain("ADMIN_EMAIL");
    expect(message).not.toContain("not-an-email");
    expect(message).not.toContain("re_super_secret");
  });
});

describe("describeEnvProblem branches", () => {
  it("mentions only the missing names when nothing is invalid", () => {
    expect(describeEnvProblem({ missing: ["A"], invalid: [] })).toBe(
      "Environment variables are not configured correctly (missing: A)",
    );
  });

  it("mentions only the invalid names when nothing is missing", () => {
    expect(describeEnvProblem({ missing: [], invalid: ["B"] })).toBe(
      "Environment variables are not configured correctly (invalid: B)",
    );
  });

  it("mentions both when both exist", () => {
    expect(describeEnvProblem({ missing: ["A"], invalid: ["B"] })).toContain(
      "missing: A; invalid: B",
    );
  });
});
