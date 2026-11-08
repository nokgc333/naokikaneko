import { timingSafeEqual } from "node:crypto";

// Compares two strings in time that depends only on the longer one. The
// shorter one is padded with zero bytes, and the lengths are compared at the
// end, so that a prefix of the other value does not count as equal.
export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  const size = Math.max(a.length, b.length);
  const paddedA = Buffer.alloc(size);
  const paddedB = Buffer.alloc(size);
  a.copy(paddedA);
  b.copy(paddedB);
  const sameBytes = timingSafeEqual(paddedA, paddedB);
  return sameBytes && a.length === b.length;
}
