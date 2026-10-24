export const UNKNOWN_CLIENT = "unknown";

export function getClientIp(request: Request): string {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (forwarded) return forwarded;

  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  return UNKNOWN_CLIENT;
}
