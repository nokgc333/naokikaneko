import { describe, it, expect } from "vitest";
import { safeEqual } from "./timing-safe";

describe("safeEqual", () => {
  it("returns true for identical strings", () => {
    expect(safeEqual("abc-123", "abc-123")).toBe(true);
  });

  it("returns false for different strings of the same length", () => {
    expect(safeEqual("abc-123", "abc-124")).toBe(false);
  });

  it("returns false for strings of different lengths without throwing", () => {
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("returns false when either side is empty", () => {
    expect(safeEqual("", "x")).toBe(false);
    expect(safeEqual("x", "")).toBe(false);
  });

  it("treats two empty strings as equal", () => {
    expect(safeEqual("", "")).toBe(true);
  });

  it("compares multi-byte characters correctly", () => {
    expect(safeEqual("日本語", "日本語")).toBe(true);
    expect(safeEqual("日本語", "日本誤")).toBe(false);
  });
});
