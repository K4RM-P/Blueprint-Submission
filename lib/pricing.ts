/** Price transparency breakdown (PRD §9.7) and membership pricing (PRD §6.1). */
import type { PartnerTier } from "./domain";

export interface BreakdownSlice {
  label: string;
  percent: number;
  description?: string;
}

export function breakdownTotal(slices: BreakdownSlice[]): number {
  return slices.reduce((s, x) => s + x.percent, 0);
}

export function validateBreakdown(slices: BreakdownSlice[]): string | null {
  if (slices.length === 0) return "Add at least one slice.";
  if (slices.some((s) => !s.label.trim())) return "Every slice needs a label.";
  if (slices.some((s) => !Number.isFinite(s.percent) || s.percent < 0)) return "Percentages can't be negative.";
  const total = breakdownTotal(slices);
  if (Math.abs(total - 100) > 0.001) return `Percentages must add up to 100 (now ${total}).`;
  return null;
}

/** Dollar amount of each slice for a given price (cents). Rounds so the parts add up exactly. */
export function splitPrice(priceCents: number, slices: BreakdownSlice[]): number[] {
  const raw = slices.map((s) => (priceCents * s.percent) / 100);
  const floored = raw.map(Math.floor);
  let rest = priceCents - floored.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (rest <= 0) break;
    floored[i] += 1;
    rest -= 1;
  }
  return floored;
}

/** Annual membership prices in cents [ASSUMPTION — PRD §6.1]. */
export const TIER_PRICE_CENTS: Record<PartnerTier, number> = { community: 0, impact: 50_000, champion: 150_000 };

/** One-line pitch per tier, used wherever tiers are compared (Become a Partner, Membership). */
export const TIER_PITCH: Record<PartnerTier, string> = {
  community: "Everything the core needs: certified data wipe, a certificate for every batch, a Device Passport for every laptop and your impact summary.",
  impact: "Optional: a detailed impact dashboard, annual report and LinkedIn card for your team, clients and board, plus pickup requests (to be confirmed by Free Geek Toronto).",
  champion: "Optional: everything in Impact, plus a hosted employee volunteer day at the FGT Community Hub (to be confirmed by Free Geek Toronto) and 10 laptops sponsored through the Pay-It-Forward fund.",
};

export const TIER_BENEFITS: Record<PartnerTier, string[]> = {
  community: [
    "Batch submission and drop-off scheduling",
    "Certified data wipe, with a certificate for every batch",
    "A Device Passport for every laptop",
    "Impact summary on your dashboard",
  ],
  impact: ["Everything in Community", "Pickup requests (to be confirmed by Free Geek Toronto)", "Detailed impact dashboard", "Downloadable annual impact report", "Shareable LinkedIn impact card", "Logo on the public Partner Wall"],
  champion: [
    "Everything in Impact",
    "One hosted employee volunteer day at the FGT Community Hub each year (to be confirmed by Free Geek Toronto)",
    "Featured placement on the Partner Wall",
    "10 sponsored laptops credited to the Pay-It-Forward fund in your name",
  ],
};

export function tierRank(t: PartnerTier): number {
  return t === "community" ? 0 : t === "impact" ? 1 : 2;
}

/** Paid tiers can request pickup (PP-03). */
export function canRequestPickup(t: PartnerTier): boolean {
  return tierRank(t) >= 1;
}

/** Impact and Champion see the full dashboard; Community sees a summary (PP-09). */
export function hasFullDashboard(t: PartnerTier): boolean {
  return tierRank(t) >= 1;
}
