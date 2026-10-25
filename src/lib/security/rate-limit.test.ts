import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimit();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("1.2.3.4", 5, 10_000)).toBe(true);
    }
  });

  it("rejects requests beyond the limit", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("1.2.3.4", 5, 10_000);
    }
    expect(checkRateLimit("1.2.3.4", 5, 10_000)).toBe(false);
  });

  it("counts independently for different keys (IPs)", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("1.2.3.4", 5, 10_000);
    }
    expect(checkRateLimit("5.6.7.8", 5, 10_000)).toBe(true);
  });

  it("resets the count after the time window passes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    for (let i = 0; i < 5; i++) {
      checkRateLimit("1.2.3.4", 5, 10_000);
    }
    expect(checkRateLimit("1.2.3.4", 5, 10_000)).toBe(false);

    vi.setSystemTime(10_001);
    expect(checkRateLimit("1.2.3.4", 5, 10_000)).toBe(true);
  });
});
