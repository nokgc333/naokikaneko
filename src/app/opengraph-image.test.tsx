import { describe, it, expect, vi } from "vitest";
import OpengraphImage, { alt, contentType, size } from "./opengraph-image";

const imageResponse = vi.fn();
vi.mock("next/og", () => ({
  ImageResponse: class {
    constructor(...args: unknown[]) {
      imageResponse(...args);
    }
  },
}));

describe("opengraph-image", () => {
  it("declares a 1200x630 png with the site name as alt text", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe("image/png");
    expect(alt).toBe("naokikaneko.com");
  });

  it("renders the owner name at the declared size", () => {
    OpengraphImage();

    const [element, options] = imageResponse.mock.calls[0];
    expect(options).toEqual({ width: 1200, height: 630 });
    expect(element.props.children).toBe("NAOKI KANEKO");
  });
});
