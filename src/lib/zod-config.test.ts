import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("zod jitless configuration", () => {
  it("disables runtime code generation", async () => {
    await import("./zod-config");

    expect(z.config().jitless).toBe(true);
  });
});
