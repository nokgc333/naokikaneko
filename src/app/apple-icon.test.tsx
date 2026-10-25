import { describe, it, expect, vi } from "vitest";
import AppleIcon, { contentType, size } from "./apple-icon";

const imageResponse = vi.fn();
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(...args: unknown[]) {
      imageResponse(...args);
    }
  },
}));

describe("apple-icon", () => {
  it("is a 180x180 png", () => {
    expect(size).toEqual({ width: 180, height: 180 });
    expect(contentType).toBe("image/png");
  });

  it("draws the monogram at the declared size", () => {
    AppleIcon();

    const [element, options] = imageResponse.mock.calls[0];
    expect(options).toEqual({ width: 180, height: 180 });
    expect(element.props.children).toBe("NK");
  });
});
