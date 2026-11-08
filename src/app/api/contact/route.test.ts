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
});
