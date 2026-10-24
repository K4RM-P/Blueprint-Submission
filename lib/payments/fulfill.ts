import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { CHAMPION_SPONSORSHIP_CENTS, CHAMPION_SPONSORED_LAPTOPS } from "@/lib/ledger";
import { isoDay, membershipPeriod } from "@/lib/membership";
import { TIER_PRICE_CENTS } from "@/lib/pricing";
import type { PartnerTier } from "@/lib/domain";
import type { CompletedPayment } from "./provider";

const isDuplicate = (e: { code?: string } | null) => e?.code === "23505";

/**
 * Write a verified payment to the ledger (PIF-03, PIF-04). Uses the service role — the
 * only user-independent write path in the app (PRD §12) — and is idempotent on
 * provider_ref, so a retried webhook never double-counts.
 */
export async function fulfillPayment(p: CompletedPayment): Promise<"recorded" | "duplicate"> {
  const db = createAdminClient();

  if (p.purpose.kind === "contribution") {
    const { error } = await db.from("fund_transactions").insert({
      type: "contribution",
      amount_cents: p.purpose.amountCents,
      provider: p.provider,
      provider_ref: p.ref,
      note: p.purpose.source === "round_up" ? "Store checkout round-up" : "Pay-It-Forward contribution",
    });
    if (isDuplicate(error)) return "duplicate";
    if (error) throw error;
    return "recorded";
  }

  const { organizationId, tier, amountCents } = p.purpose;
  if (amountCents !== TIER_PRICE_CENTS[tier]) throw new Error(`Unexpected amount for ${tier} membership.`);
  const { data: org, error: orgErr } = await db.from("organizations").select("id, name, tier, membership_started_at, membership_expires_at").eq("id", organizationId).single();
  if (orgErr || !org) throw orgErr ?? new Error("Organization not found.");

  const period = membershipPeriod(new Date(), { tier: org.tier as PartnerTier, expiresAt: org.membership_expires_at ? new Date(org.membership_expires_at) : null }, tier);
  const { error: payErr } = await db.from("membership_payments").insert({
    organization_id: org.id,
    tier,
    amount_cents: amountCents,
    provider: p.provider,
    provider_ref: p.ref,
    period_start: isoDay(period.start),
    period_end: isoDay(period.end),
  });
  if (isDuplicate(payErr)) return "duplicate";
  if (payErr) throw payErr;

  const keepStart = org.tier === tier && org.membership_started_at && org.membership_expires_at && new Date(org.membership_expires_at) > new Date();
  const { error: updErr } = await db
    .from("organizations")
    .update({
      tier,
      membership_started_at: keepStart ? org.membership_started_at : period.start.toISOString(),
      membership_expires_at: period.end.toISOString(),
    })
    .eq("id", org.id);
  if (updErr) throw updErr;

  if (tier === "champion") {
    const { error } = await db.from("fund_transactions").insert({
      type: "sponsorship",
      amount_cents: CHAMPION_SPONSORSHIP_CENTS,
      organization_id: org.id,
      provider: p.provider,
      provider_ref: `${p.ref}:sponsorship`,
      note: `Champion Partner: ${CHAMPION_SPONSORED_LAPTOPS} sponsored laptops`,
    });
    if (error && !isDuplicate(error)) throw error;
  }
  return "recorded";
}
