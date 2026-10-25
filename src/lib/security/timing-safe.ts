import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function safeEqual(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}
