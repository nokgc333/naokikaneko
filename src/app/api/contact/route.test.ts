import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { resetRateLimit } from "@/lib/rate-limit";

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
  });

  it("正しい入力の場合、Resendでメールを送信し200を返す", async () => {
    const response = await POST(
      makeRequest({ name: "Taro", email: "taro@example.com", message: "Hello" })
    );

    expect(response.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const callArgs = sendMock.mock.calls[0][0];
    expect(callArgs.to).toBe("admin@example.com");
    expect(callArgs.replyTo).toBe("taro@example.com");
  });

  it("nameが空の場合、422を返しメールを送信しない", async () => {
    const response = await POST(
      makeRequest({ name: "", email: "taro@example.com", message: "Hello" })
    );

    expect(response.status).toBe(422);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("emailが不正な形式の場合、422を返す", async () => {
    const response = await POST(
      makeRequest({ name: "Taro", email: "not-an-email", message: "Hello" })
    );

    expect(response.status).toBe(422);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("honeypotに値が入っている場合、200を返すがメールは送信しない", async () => {
    const response = await POST(
      makeRequest({
        name: "Bot",
        email: "bot@example.com",
        message: "spam",
        honeypot: "filled",
      })
    );

    expect(response.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("同一IPからの送信が上限回数を超えた場合、429を返す", async () => {
    for (let i = 0; i < 5; i++) {
      const response = await POST(
        makeRequest(
          { name: "Taro", email: "taro@example.com", message: "Hello" },
          "9.9.9.9"
        )
      );
      expect(response.status).toBe(200);
    }

    const response = await POST(
      makeRequest(
        { name: "Taro", email: "taro@example.com", message: "Hello" },
        "9.9.9.9"
      )
    );

    expect(response.status).toBe(429);
    expect(sendMock).toHaveBeenCalledTimes(5);
  });
});
