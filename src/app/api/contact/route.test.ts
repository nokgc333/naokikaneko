import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { resetRateLimit } from "@/lib/security/rate-limit";

const sendMock = vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null });

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

function makeRequest(body: unknown, ip = "127.0.0.1") {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    sendMock.mockClear();
    resetRateLimit();
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    vi.stubEnv("CONTACT_MAIL_FROM", "お問い合わせ <contact@example.com>");
  });

  it("sends the mail through Resend and returns 200 for valid input", async () => {
    const response = await POST(
      makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" }),
    );

    expect(response.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const callArgs = sendMock.mock.calls[0][0];
    expect(callArgs.to).toBe("admin@example.com");
    expect(callArgs.replyTo).toBe("taro@example.com");
  });

  it("returns 422 and sends nothing when name is empty", async () => {
    const response = await POST(
      makeRequest({ name: "", email: "taro@example.com", message: "Hello" }),
    );

    expect(response.status).toBe(422);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 422 when email is malformed", async () => {
    const response = await POST(
      makeRequest({ name: "Taro", email: "not-an-email", message: "Hello" }),
    );

    expect(response.status).toBe(422);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 200 but sends nothing when the honeypot is filled", async () => {
    const response = await POST(
      makeRequest({
        name: "Bot",
        email: "bot@example.com",
        message: "spam",
        honeypot: "filled",
      }),
    );

    expect(response.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("returns 500 without calling Resend when ADMIN_EMAIL is not set", async () => {
    vi.stubEnv("ADMIN_EMAIL", "");

    const response = await POST(
      makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" }),
    );

    expect(response.status).toBe(500);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("uses the CONTACT_MAIL_FROM environment variable as the sender", async () => {
    await POST(makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" }));

    expect(sendMock.mock.calls[0][0].from).toBe("お問い合わせ <contact@example.com>");
  });

  it.each(["RESEND_API_KEY", "CONTACT_MAIL_FROM"])(
    "returns 500 without calling Resend and logs only the variable name when %s is not set",
    async (name) => {
      vi.stubEnv(name, "");
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const response = await POST(
        makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" }),
      );

      expect(response.status).toBe(500);
      expect(sendMock).not.toHaveBeenCalled();
      const logged = errorSpy.mock.calls.flat().join(" ");
      expect(logged).toContain(name);
      expect(logged).not.toContain("test-key");
      errorSpy.mockRestore();
    },
  );

  it("returns 429 when one IP exceeds the send limit", async () => {
    for (let i = 0; i < 5; i++) {
      const response = await POST(
        makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" }, "9.9.9.9"),
      );
      expect(response.status).toBe(200);
    }

    const response = await POST(
      makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" }, "9.9.9.9"),
    );

    expect(response.status).toBe(429);
    expect(sendMock).toHaveBeenCalledTimes(5);
  });

  describe("resilience to malformed and oversized requests", () => {
    const valid = { name: "Taro", email: "taro@example.com", message: "Hello" };

    function makeRawRequest(raw: string, headers: Record<string, string> = {}) {
      return new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: raw,
      });
    }

    it("returns 400 and sends nothing when the body is not valid JSON", async () => {
      const response = await POST(makeRawRequest("{not json"));

      expect(response.status).toBe(400);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it("returns 400 when the body is empty", async () => {
      const response = await POST(makeRawRequest(""));

      expect(response.status).toBe(400);
    });

    it("returns 413 when Content-Length declares more than the limit", async () => {
      const response = await POST(
        makeRawRequest(JSON.stringify(valid), { "content-length": "100000" }),
      );

      expect(response.status).toBe(413);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it("returns 413 when the actual body exceeds the limit even without Content-Length", async () => {
      const huge = JSON.stringify({ ...valid, message: "a".repeat(20_000) });

      const response = await POST(makeRawRequest(huge));

      expect(response.status).toBe(413);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it("returns 422 when the JSON is not an object (null)", async () => {
      const response = await POST(makeRawRequest("null"));

      expect(response.status).toBe(422);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it("returns 422 and sends nothing when the name contains a line break (prevents subject injection)", async () => {
      const response = await POST(
        makeRequest({ ...valid, name: "Taro\r\nBcc: attacker@example.com" }),
      );

      expect(response.status).toBe(422);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it("returns 422 when the email address exceeds 254 characters", async () => {
      const longEmail = `${"a".repeat(250)}@example.com`;

      const response = await POST(makeRequest({ ...valid, email: longEmail }));

      expect(response.status).toBe(422);
      expect(sendMock).not.toHaveBeenCalled();
    });

    it("trims surrounding whitespace from the name and message before sending", async () => {
      await POST(makeRequest({ ...valid, name: "  Taro  ", message: " Hi \n" }));

      const callArgs = sendMock.mock.calls[0][0];
      expect(callArgs.subject).toBe("【お問い合わせ】Taro様より");
      expect(callArgs.text).toContain("お名前: Taro\n");
      expect(callArgs.text.endsWith("Hi")).toBe(true);
    });

    it("returns 422 for a whitespace-only message because it is required", async () => {
      const response = await POST(makeRequest({ ...valid, message: "   " }));

      expect(response.status).toBe(422);
    });

    it("counts the rate limit by x-real-ip when x-forwarded-for is absent", async () => {
      const body = JSON.stringify(valid);
      const send = () =>
        POST(
          new Request("http://localhost:3000/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-real-ip": "7.7.7.7" },
            body,
          }),
        );

      for (let i = 0; i < 5; i++) expect((await send()).status).toBe(200);

      expect((await send()).status).toBe(429);
    });

    it("counts different x-real-ip values as separate senders", async () => {
      const sendFrom = (ip: string) =>
        POST(
          new Request("http://localhost:3000/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-real-ip": ip },
            body: JSON.stringify(valid),
          }),
        );

      for (let i = 0; i < 5; i++) await sendFrom("1.1.1.1");

      expect((await sendFrom("1.1.1.1")).status).toBe(429);
      expect((await sendFrom("2.2.2.2")).status).toBe(200);
    });
  });
});

describe("POST /api/contact when Resend rejects the mail", () => {
  beforeEach(() => {
    resetRateLimit();
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("ADMIN_EMAIL", "admin@example.com");
    vi.stubEnv("CONTACT_MAIL_FROM", "contact@example.com");
  });

  it("returns 500 and logs the provider error without leaking it to the client", async () => {
    sendMock.mockResolvedValueOnce({ data: null, error: { message: "provider down" } });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(
      makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" }),
    );

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("provider down");
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
