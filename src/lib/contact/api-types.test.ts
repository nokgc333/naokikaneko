import { describe, it, expect } from "vitest";
import { CONTACT_API_PATH, CONTACT_ERROR_MESSAGES, isContactSuccess } from "./api-types";

describe("isContactSuccess", () => {
  it("accepts the success body", () => {
    expect(isContactSuccess({ ok: true })).toBe(true);
  });

  it.each([null, undefined, "ok", 1, {}, { ok: false }, { ok: "true" }, { error: "x" }])(
    "rejects %j",
    (value) => {
      expect(isContactSuccess(value)).toBe(false);
    },
  );
});

describe("shared contract", () => {
  it("exposes the endpoint path used by the client and the route", () => {
    expect(CONTACT_API_PATH).toBe("/api/contact");
  });

  it("has a distinct message for each error case", () => {
    const messages = Object.values(CONTACT_ERROR_MESSAGES);

    expect(new Set(messages).size).toBe(messages.length);
  });
});
