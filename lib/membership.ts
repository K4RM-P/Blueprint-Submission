/** Membership periods and upgrade rules (PP-12, PIF-04). Pure; dates in UTC. */
import type { PartnerTier } from "./domain";
import { tierRank } from "./pricing";

export type PaidTier = Exclude<PartnerTier, "community">;

export interface MembershipPeriod {
  start: Date;
  end: Date;
}

function addYear(d: Date): Date {
  const out = new Date(d);
  out.setUTCFullYear(out.getUTCFullYear() + 1);
  return out;
}

/**
 * The period a new payment buys. Renewing the same tier before it expires stacks onto the
 * current period; upgrading (or lapsed/new members) starts today. Always one year long.
 */
export function membershipPeriod(now: Date, current: { tier: PartnerTier; expiresAt: Date | null }, purchased: PaidTier): MembershipPeriod {
  const active = current.expiresAt !== null && current.expiresAt > now;
  const start = active && current.tier === purchased ? current.expiresAt! : now;
  return { start, end: addYear(start) };
}

/** Is the membership currently active? Community never expires. */
export function isMembershipActive(tier: PartnerTier, expiresAt: Date | null, now = new Date()): boolean {
  if (tier === "community") return true;
  return expiresAt !== null && expiresAt > now;
}

/** Tiers a partner can buy from where they are: renew the current paid tier or move up. */
export function purchasableTiers(current: PartnerTier): PaidTier[] {
  return (["impact", "champion"] as const).filter((t) => tierRank(t) >= tierRank(current));
}

/** Days left on a paid membership (0 when lapsed). */
export function daysRemaining(expiresAt: Date | null, now = new Date()): number {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 86_400_000));
}

/** Date column value (YYYY-MM-DD) for membership_payments.period_start/end. */
export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
