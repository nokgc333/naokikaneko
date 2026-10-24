import "./zod-config";
import { z } from "zod";

const CONTROL_CHARACTERS = /\p{Cc}/u;

export const EMAIL_MAX_LENGTH = 254;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "個人・法人名を入力してください")
    .max(100)
    .refine((value) => !CONTROL_CHARACTERS.test(value), "改行などの制御文字は使えません"),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX_LENGTH, "メールアドレスが長すぎます")
    .email("有効なメールアドレスを入力してください"),
  message: z.string().trim().min(1, "本文を入力してください").max(2000),
  honeypot: z.string().max(200).optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
