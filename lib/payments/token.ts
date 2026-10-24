import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Compact signed tokens (`base64url(payload).base64url(hmac)`) for the mock checkout,
 * and Stripe's webhook signature scheme. Pure functions with unit tests.
 */

function b64url(buf: Buffer | string) {
  return Buffer.from(buf).toString("base64url");
}

function hmac(secret: string, data: string) {
  return createHmac("sha256", secret).update(data).digest();
}

function safeEqual(a: Buffer, b: Buffer) {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function signToken(payload: object, secret: string): string {
  const body = b64url(JSON.stringify(payload));
  return `${body}.${b64url(hmac(secret, body))}`;
}

/** Returns the payload when the signature matches and `exp` (ms epoch, if present) hasn't passed. */
export function verifyToken<T extends object>(token: string, secret: string, now = Date.now()): T | null {
  const [body, sig, extra] = token.split(".");
  if (!body || !sig || extra !== undefined) return null;
  if (!safeEqual(Buffer.from(sig, "base64url"), hmac(secret, body))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T & { exp?: unknown };
    if (typeof payload.exp === "number" && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Build a `Stripe-Signature` header value (used by tests and local tooling). */
export function stripeSignatureHeader(rawBody: string, secret: string, timestampSec: number): string {
  return `t=${timestampSec},v1=${hmac(secret, `${timestampSec}.${rawBody}`).toString("hex")}`;
}

/** Verify a `Stripe-Signature` header: HMAC-SHA256 of `${t}.${body}`, within `toleranceSec`. */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, nowSec = Math.floor(Date.now() / 1000), toleranceSec = 300): boolean {
  if (!header) return false;
  const parts = header.split(",").map((p) => p.trim().split("=") as [string, string]);
  const t = Number(parts.find(([k]) => k === "t")?.[1]);
  if (!Number.isFinite(t) || Math.abs(nowSec - t) > toleranceSec) return false;
  const expected = hmac(secret, `${t}.${rawBody}`);
  return parts.filter(([k]) => k === "v1").some(([, v]) => safeEqual(Buffer.from(v ?? "", "hex"), expected));
}
