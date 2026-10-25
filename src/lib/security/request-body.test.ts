import { describe, it, expect } from "vitest";
import { BodyTooLargeError, readLimitedText } from "./request-body";

function makeRequest(body?: BodyInit, headers: Record<string, string> = {}) {
  return new Request("http://localhost:3000/api/x", {
    method: "POST",
    headers,
    body,
  });
}

function streamOf(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

describe("readLimitedText", () => {
  it("returns a body within the limit as a string", async () => {
    const text = await readLimitedText(makeRequest('{"a":1}'), 100);

    expect(text).toBe('{"a":1}');
  });

  it("returns an empty string when there is no body", async () => {
    const text = await readLimitedText(makeRequest(), 100);

    expect(text).toBe("");
  });

  it("rejects without reading the body when Content-Length declares more than the limit", async () => {
    const request = makeRequest("small", { "content-length": "999999" });

    await expect(readLimitedText(request, 100)).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it("rejects when the actual byte count exceeds the limit even without Content-Length", async () => {
    const request = makeRequest("x".repeat(101));

    await expect(readLimitedText(request, 100)).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it("accepts a body exactly at the limit", async () => {
    const text = await readLimitedText(makeRequest("x".repeat(100)), 100);

    expect(text).toHaveLength(100);
  });

  it("counts bytes, not characters (Japanese characters take 3 bytes each)", async () => {
    const request = makeRequest("あ".repeat(10));

    await expect(readLimitedText(request, 29)).rejects.toBeInstanceOf(BodyTooLargeError);
    await expect(readLimitedText(makeRequest("あ".repeat(10)), 30)).resolves.toBe("あ".repeat(10));
  });

  it("restores a body whose multibyte characters are split across chunks", async () => {
    const bytes = new TextEncoder().encode("あいう");
    const request = new Request("http://localhost:3000/api/x", {
      method: "POST",
      body: streamOf([bytes.slice(0, 1), bytes.slice(1, 5), bytes.slice(5)]),
      duplex: "half",
    } as RequestInit);

    await expect(readLimitedText(request, 100)).resolves.toBe("あいう");
  });
});
