import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SiteFooter from "./site-footer";

describe("SiteFooter", () => {
  it("shows the copyright notice inside a contentinfo landmark", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent("NAOKI KANEKO");
  });
});
