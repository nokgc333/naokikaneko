import { Resend } from "resend";
import { contactFormSchema } from "@/lib/schemas/contact";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "リクエストが多すぎます。時間をおいて再度お試しください" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email, message, honeypot } = parsed.data;

  if (honeypot) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_EMAIL;

  const { error } = await resend.emails.send({
    from: "お問い合わせ <onboarding@resend.dev>",
    to: adminEmail ?? "",
    replyTo: email,
    subject: `【お問い合わせ】${name}様より`,
    text: `お名前: ${name}\nメールアドレス: ${email}\n\n${message}`,
  });

  if (error) {
    return Response.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
