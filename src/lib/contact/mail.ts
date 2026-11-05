import type { ContactFormData } from "@/lib/contact/schema";

export type ContactMailEnv = {
  ADMIN_EMAIL: string;
  CONTACT_MAIL_FROM: string;
};

export type ContactMail = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

export function buildContactMail(
  { name, email, message }: Pick<ContactFormData, "name" | "email" | "message">,
  env: ContactMailEnv,
): ContactMail {
  return {
    from: env.CONTACT_MAIL_FROM,
    to: env.ADMIN_EMAIL,
    replyTo: email,
    subject: `【お問い合わせ】${name}様より`,
    text: `お名前: ${name}\nメールアドレス: ${email}\n\n${message}`,
  };
}
