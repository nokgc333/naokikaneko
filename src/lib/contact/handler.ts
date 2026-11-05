import { Resend } from "resend";
import { contactFormSchema, type ContactFormData } from "@/lib/contact/schema";
import { buildContactMail, type ContactMail } from "@/lib/contact/mail";
import { CONTACT_ERROR_MESSAGES, type ContactResponseBody } from "@/lib/contact/api-types";
import { describeEnvProblem, loadContactMailEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";
import { BodyTooLargeError, readLimitedText } from "@/lib/security/request-body";

const MAX_BODY_BYTES = 16 * 1024;

export type SendMail = (mail: ContactMail, apiKey: string) => Promise<{ error: unknown }>;

const sendWithResend: SendMail = async (mail, apiKey) => {
  const { error } = await new Resend(apiKey).emails.send(mail);
  return { error };
};

function respond(body: ContactResponseBody, status: number): Response {
  return Response.json(body, { status });
}

type ParsedBody = { ok: true; data: ContactFormData } | { ok: false; response: Response };

async function parseBody(request: Request): Promise<ParsedBody> {
  let raw: unknown;
  try {
    raw = JSON.parse(await readLimitedText(request, MAX_BODY_BYTES));
  } catch (error) {
    const message =
      error instanceof BodyTooLargeError
        ? CONTACT_ERROR_MESSAGES.bodyTooLarge
        : CONTACT_ERROR_MESSAGES.malformed;
    return {
      ok: false,
      response: respond({ error: message }, error instanceof BodyTooLargeError ? 413 : 400),
    };
  }

  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: respond({ error: parsed.error.flatten() }, 422) };
  }
  return { ok: true, data: parsed.data };
}

export async function handleContactRequest(
  request: Request,
  send: SendMail = sendWithResend,
): Promise<Response> {
  if (!checkRateLimit(getClientIp(request))) {
    return respond({ error: CONTACT_ERROR_MESSAGES.rateLimited }, 429);
  }

  const body = await parseBody(request);
  if (!body.ok) return body.response;
  if (body.data.honeypot) return respond({ ok: true }, 200);

  const env = loadContactMailEnv();
  if (!env.ok) {
    console.error(`[api/contact] ${describeEnvProblem(env)}. Cannot send contact form email.`);
    return respond({ error: CONTACT_ERROR_MESSAGES.sendFailed }, 500);
  }

  const { error } = await send(buildContactMail(body.data, env.value), env.value.RESEND_API_KEY);
  if (error) {
    console.error("[api/contact] Resend送信エラー:", error);
    return respond({ error: CONTACT_ERROR_MESSAGES.sendFailed }, 500);
  }
  return respond({ ok: true }, 200);
}
