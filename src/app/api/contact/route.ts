import { Resend } from "resend";
import { contactFormSchema } from "@/lib/schemas/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";
import { describeEnvProblem, loadContactMailEnv } from "@/lib/env";
import { BodyTooLargeError, readLimitedText } from "@/lib/request-body";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  if (!checkRateLimit(getClientIp(request))) {
    return Response.json(
      { error: "リクエストが多すぎます。時間をおいて再度お試しください" },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(await readLimitedText(request, MAX_BODY_BYTES));
  } catch (error) {
    if (error instanceof BodyTooLargeError) {
      return Response.json(
        { error: "送信内容が大きすぎます" },
        { status: 413 }
      );
    }
    return Response.json(
      { error: "リクエストの形式が正しくありません" },
      { status: 400 }
    );
  }

  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email, message, honeypot } = parsed.data;

  if (honeypot) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const env = loadContactMailEnv();

  if (!env.ok) {
    console.error(`[api/contact] ${describeEnvProblem(env)}. Cannot send contact form email.`);
    return Response.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }

  const resend = new Resend(env.value.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: env.value.CONTACT_MAIL_FROM,
    to: env.value.ADMIN_EMAIL,
    replyTo: email,
    subject: `【お問い合わせ】${name}様より`,
    text: `お名前: ${name}\nメールアドレス: ${email}\n\n${message}`,
  });

  if (error) {
    console.error("[api/contact] Resend送信エラー:", error);
    return Response.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
