import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimit();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("上限回数以内であれば許可する", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("1.2.3.4", 5, 10_000)).toBe(true);
    }
  });

  it("上限回数を超えたら拒否する", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("1.2.3.4", 5, 10_000);
    }
    expect(checkRateLimit("1.2.3.4", 5, 10_000)).toBe(false);
  });

  it("キー（IP）が異なれば独立してカウントする", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("1.2.3.4", 5, 10_000);
    }
    expect(checkRateLimit("5.6.7.8", 5, 10_000)).toBe(true);
  });

  it("時間枠が過ぎたらカウントがリセットされる", () => {
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
