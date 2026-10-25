import { describe, it, expect } from "vitest";
import { z } from "zod";
import { contactFormSchema, EMAIL_MAX_LENGTH } from "./contact";

const valid = { name: "Taro", email: "taro@example.com", message: "Hello" };

describe("contactFormSchema", () => {
  it("accepts valid input", () => {
    expect(contactFormSchema.safeParse(valid).success).toBe(true);
  });

  it("trims surrounding whitespace from the name and message", () => {
    const result = contactFormSchema.parse({
      ...valid,
      name: "  Taro  ",
      message: " Hi \n",
    });

    expect(result.name).toBe("Taro");
    expect(result.message).toBe("Hi");
  });

  it("keeps line breaks inside the message", () => {
    const result = contactFormSchema.parse({ ...valid, message: "1行目\n2行目" });

    expect(result.message).toBe("1行目\n2行目");
  });

  it.each(["Taro\nHanako", "Taro\r\nBcc: x@example.com", "Taro\u0000", "Taro\tX"])(
    "rejects a name that contains control characters (%j)",
    (name) => {
      expect(contactFormSchema.safeParse({ ...valid, name }).success).toBe(false);
    },
  );

  it("accepts an email address exactly at the limit and rejects a longer one", () => {
    const domain = "@example.com";
    const atLimit = `${"a".repeat(EMAIL_MAX_LENGTH - domain.length)}${domain}`;

    expect(contactFormSchema.safeParse({ ...valid, email: atLimit }).success).toBe(true);
    expect(contactFormSchema.safeParse({ ...valid, email: `a${atLimit}` }).success).toBe(false);
  });

  it("accepts a message up to 2000 characters and rejects a longer one", () => {
    expect(contactFormSchema.safeParse({ ...valid, message: "a".repeat(2000) }).success).toBe(true);
    expect(contactFormSchema.safeParse({ ...valid, message: "a".repeat(2001) }).success).toBe(
      false,
    );
  });

  it("configures zod not to use eval (avoids violation reports in browsers whose CSP forbids eval)", () => {
    expect(z.config().jitless).toBe(true);
  });
});
