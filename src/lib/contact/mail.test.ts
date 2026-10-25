import { describe, it, expect } from "vitest";
import { buildContactMail } from "./mail";

const env = {
  ADMIN_EMAIL: "admin@example.com",
  CONTACT_MAIL_FROM: "お問い合わせ <contact@example.com>",
};
const data = { name: "Taro", email: "taro@example.com", message: "Hello\nWorld" };

describe("buildContactMail", () => {
  it("sends from the configured sender to the administrator", () => {
    const mail = buildContactMail(data, env);

    expect(mail.from).toBe(env.CONTACT_MAIL_FROM);
    expect(mail.to).toBe("admin@example.com");
  });

  it("lets the administrator reply straight to the visitor", () => {
    expect(buildContactMail(data, env).replyTo).toBe("taro@example.com");
  });

  it("puts the visitor's name in the subject", () => {
    expect(buildContactMail(data, env).subject).toBe("【お問い合わせ】Taro様より");
  });

  it("lists name and address before the message body, keeping line breaks", () => {
    expect(buildContactMail(data, env).text).toBe(
      "お名前: Taro\nメールアドレス: taro@example.com\n\nHello\nWorld",
    );
  });

  it("does not mutate its input", () => {
    const input = { ...data };

    buildContactMail(input, env);

    expect(input).toEqual(data);
  });
});
