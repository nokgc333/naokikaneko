import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import JsonLd from "./json-ld";

describe("JsonLd", () => {
  it("renders a ld+json script containing the serialized data", () => {
    const { container } = render(<JsonLd data={{ "@type": "Person", name: "Taro" }} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? "{}")).toEqual({ "@type": "Person", name: "Taro" });
  });

  it("does not let data close the script element", () => {
    const { container } = render(<JsonLd data={{ name: "</script><b>x</b>" }} />);

    expect(container.querySelectorAll("script")).toHaveLength(1);
    expect(container.querySelector("b")).toBeNull();
  });
});
