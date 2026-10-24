import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("zod jitless configuration", () => {
  it("is jitless even when only the content schema is loaded", async () => {
    await import("./content");

    expect(z.config().jitless).toBe(true);
  });
});
