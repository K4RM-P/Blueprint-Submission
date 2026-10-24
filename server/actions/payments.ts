"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { ActionError, fail, ok, runAction, type ActionResult } from "@/lib/action";
import { rateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments";
import { PaymentConfigError } from "@/lib/payments/provider";
import { CONTRIBUTION_MAX_CENTS, CONTRIBUTION_MIN_CENTS, formatCents, validateContribution } from "@/lib/ledger";
import { purchasableTiers } from "@/lib/membership";
import { TIER_PRICE_CENTS } from "@/lib/pricing";
import { labels, type PartnerTier } from "@/lib/domain";

async function checkout(...args: Parameters<ReturnType<typeof getPaymentProvider>["createCheckout"]>) {
  try {
    return await getPaymentProvider().createCheckout(...args);
  } catch (err) {
    if (err instanceof PaymentConfigError) throw new ActionError(err.message);
    throw err;
  }
}

const contributionSchema = z.object({
  amountCents: z.number().int().min(CONTRIBUTION_MIN_CENTS).max(CONTRIBUTION_MAX_CENTS),
  source: z.enum(["pay_it_forward", "round_up"]).default("pay_it_forward"),
});

/** PIF-01 / PIF-02: one-time contribution or store round-up. Public, rate-limited. */
export async function startContribution(input: unknown): Promise<ActionResult<null>> {
  return runAction(contributionSchema, input, async ({ amountCents, source }) => {
    const invalid = validateContribution(amountCents);
    if (invalid) return fail(invalid);
    if (!(await rateLimit("checkout", 8))) return fail("Too many checkouts in a minute. Please wait a moment.");
    const back = source === "round_up" ? "/pay-it-forward/round-up" : "/pay-it-forward";
    const session = await checkout({
      purpose: { kind: "contribution", amountCents, source },
      description: source === "round_up" ? "Store round-up for the Pay-It-Forward fund" : "Pay-It-Forward contribution",
      successUrl: `${env.siteUrl}${back}?thanks=${amountCents}`,
      cancelUrl: `${env.siteUrl}${back}`,
    });
    redirect(session.url);
  });
}

/** PP-12 / PIF-04: upgrade or renew a membership through checkout. */
export async function startMembershipCheckout(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ tier: z.enum(["impact", "champion"]) }), input, async ({ tier }) => {
    const s = await assertRole("partner");
    if (!s.profile.organization_id) return fail("Finish your organization profile first.");
    const { data: org } = await s.supabase.from("organizations").select("id, name, tier").eq("id", s.profile.organization_id).single();
    if (!org) return fail("We couldn't find your organization.");
    if (!purchasableTiers(org.tier as PartnerTier).includes(tier)) return fail("To move to a lower tier, contact Free Geek Toronto staff.");
    const session = await checkout({
      purpose: { kind: "membership", amountCents: TIER_PRICE_CENTS[tier], organizationId: org.id, tier },
      description: `${labels.tier[tier]} membership · ${org.name} · 1 year`,
      successUrl: `${env.siteUrl}/partner/membership?paid=${tier}`,
      cancelUrl: `${env.siteUrl}/partner/membership`,
    });
    redirect(session.url);
  });
}

const manualSchema = z.object({
  type: z.enum(["contribution", "sponsorship"]),
  amountCents: z.number().int().min(100, "At least $1.").max(10_000_000),
  organizationId: z.uuid().nullable(),
  note: z.string().trim().min(3, "Say where this money came from.").max(300),
});

/** PIF-03: staff record money received outside checkout (cheque, cash, event). */
export async function addManualFundEntry(input: unknown): Promise<ActionResult<null>> {
  return runAction(manualSchema, input, async ({ type, amountCents, organizationId, note }) => {
    const s = await assertRole("staff");
    if (type === "sponsorship" && !organizationId) return fail("Choose the partner who sponsored this.", { organizationId: "Choose a partner." });
    const { error } = await s.supabase.from("fund_transactions").insert({ type, amount_cents: amountCents, organization_id: organizationId, provider: "manual", note });
    if (error) throw error;
    revalidatePath("/staff", "layout");
    return ok(null, `${formatCents(amountCents)} added to the fund.`);
  });
}
