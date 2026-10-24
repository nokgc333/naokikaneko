import { describe, it, expect } from "vitest";
import { getClientIp, UNKNOWN_CLIENT } from "./client-ip";

function requestWith(headers: Record<string, string>) {
  return new Request("http://localhost:3000/api/x", { headers });
}

describe("getClientIp", () => {
  it("returns the value when x-forwarded-for has a single address", () => {
    expect(getClientIp(requestWith({ "x-forwarded-for": "1.2.3.4" }))).toBe(
      "1.2.3.4"
    );
  });

  it("returns the first address, trimmed, when x-forwarded-for has several", () => {
    const request = requestWith({ "x-forwarded-for": " 1.2.3.4 , 10.0.0.1" });

    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("uses x-real-ip when x-forwarded-for is absent", () => {
    expect(getClientIp(requestWith({ "x-real-ip": "5.6.7.8" }))).toBe(
      "5.6.7.8"
    );
  });

  it("uses x-real-ip when x-forwarded-for is an empty string", () => {
    const request = requestWith({
      "x-forwarded-for": "",
      "x-real-ip": "5.6.7.8",
    });

    expect(getClientIp(request)).toBe("5.6.7.8");
  });

  it("returns the shared identifier when neither header is present", () => {
    expect(getClientIp(requestWith({}))).toBe(UNKNOWN_CLIENT);
  });
});
