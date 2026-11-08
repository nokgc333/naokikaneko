import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";

const OAUTH_LIMIT = 10;
const OAUTH_WINDOW_MS = 10 * 60 * 1000;

export function isOauthRateLimited(request: Request): boolean {
  return !checkRateLimit(`decap-oauth:${getClientIp(request)}`, OAUTH_LIMIT, OAUTH_WINDOW_MS);
}

export function rateLimitedResponse(): Response {
  return new Response("Too many requests", { status: 429 });
}
