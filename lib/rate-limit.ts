import "server-only";
import { headers } from "next/headers";

/**
 * Small in-memory sliding-window limiter for public form endpoints (PRD §13).
 * Per server instance — enough to blunt scripted abuse of a demo deployment.
 */
const hits = new Map<string, number[]>();

export async function rateLimit(bucket: string, limit = 10, windowMs = 60_000): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}
