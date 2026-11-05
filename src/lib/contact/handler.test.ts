import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleContactRequest } from "./handler";
import { resetRateLimit } from "@/lib/security/rate-limit";

const valid = { name: "Taro", email: "taro@example.com", message: "Hello" };

function request(body: unknown, ip = "203.0.113.50") {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("handleContactRequest", () => {
  const send = vi.fn();

  beforeEach(() => {
    send.mockReset().mockResolvedValue({ error: null });
    resetRateLimit();
    vi.stubEnv("RESEND_API_KEY", "key-123");
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    vi.stubEnv("CONTACT_MAIL_FROM", "contact@example.com");
  });

  it("hands the built mail and the API key to the sender and answers ok", async () => {
    const response = await handleContactRequest(request(valid), send);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: "admin@example.com", replyTo: "taro@example.com" }),
      "key-123",
    );
  });

  it("answers 400 for a body that is not JSON", async () => {
    const response = await handleContactRequest(request("{nope"), send);

    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("answers 413 for an oversized body", async () => {
    const response = await handleContactRequest(
      request({ ...valid, message: "a".repeat(20_000) }),
      send,
    );

    expect(response.status).toBe(413);
  });

  it("answers 422 with field errors for invalid input", async () => {
    const response = await handleContactRequest(request({ ...valid, email: "nope" }), send);

    expect(response.status).toBe(422);
    expect((await response.json()).error.fieldErrors.email).toBeDefined();
  });

  it("answers ok without sending when the honeypot is filled", async () => {
    const response = await handleContactRequest(request({ ...valid, honeypot: "bot" }), send);

    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("answers 429 once the client exceeds the limit", async () => {
    for (let i = 0; i < 5; i++) await handleContactRequest(request(valid), send);

    const response = await handleContactRequest(request(valid), send);

    expect(response.status).toBe(429);
    expect(send).toHaveBeenCalledTimes(5);
  });

  it("answers 500 without sending when the mail settings are missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await handleContactRequest(request(valid), send);

    expect(response.status).toBe(500);
    expect(send).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("answers 500 and hides the provider error from the visitor when sending fails", async () => {
    send.mockResolvedValue({ error: { message: "provider down" } });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await handleContactRequest(request(valid), send);

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("provider down");
    errorSpy.mockRestore();
  });
});
