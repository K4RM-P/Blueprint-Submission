import "server-only";
import { z } from "zod";
import { PARTNER_TIERS } from "@/lib/domain";
import { verifyStripeSignature } from "./token";
import { PaymentConfigError, type CheckoutPurpose, type PaymentProvider } from "./provider";

/** Stripe in TEST MODE ONLY (KICKOFF Part A rule 6): refuse anything that isn't an sk_test_ key. */
export function stripeKey(): string {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) throw new PaymentConfigError("STRIPE_SECRET_KEY is not set. Use PAYMENT_PROVIDER=mock for the demo.");
  if (!key.startsWith("sk_test_")) throw new PaymentConfigError("GeekLoop only runs Stripe in test mode. Use an sk_test_ key.");
  return key;
}

const metadataSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("contribution"), source: z.enum(["pay_it_forward", "round_up"]) }),
  z.object({ kind: z.literal("membership"), organization_id: z.uuid(), tier: z.enum(PARTNER_TIERS).exclude(["community"]) }),
]);

const sessionSchema = z.object({
  id: z.string(),
  payment_status: z.string(),
  amount_total: z.number().int().nonnegative(),
  metadata: z.record(z.string(), z.string()),
});

function metadataFor(p: CheckoutPurpose): Record<string, string> {
  return p.kind === "contribution" ? { kind: p.kind, source: p.source } : { kind: p.kind, organization_id: p.organizationId, tier: p.tier };
}

/** Stripe Checkout via the REST API (no SDK needed for two calls). */
export const stripeProvider: PaymentProvider = {
  name: "stripe",
  async createCheckout(req) {
    const form = new URLSearchParams({
      mode: "payment",
      success_url: req.successUrl,
      cancel_url: req.cancelUrl,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": "cad",
      "line_items[0][price_data][unit_amount]": String(req.purpose.amountCents),
      "line_items[0][price_data][product_data][name]": req.description,
    });
    for (const [k, v] of Object.entries(metadataFor(req.purpose))) form.set(`metadata[${k}]`, v);
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${stripeKey()}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
    if (!res.ok || !json.url || !json.id) throw new Error(json.error?.message ?? "Stripe couldn't start checkout.");
    return { ref: json.id, url: json.url };
  },
  async handleWebhook(rawBody, headers) {
    stripeKey();
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    if (!secret) throw new PaymentConfigError("STRIPE_WEBHOOK_SECRET is not set.");
    if (!verifyStripeSignature(rawBody, headers.get("stripe-signature"), secret)) throw new PaymentConfigError("Invalid Stripe signature.");
    const event = JSON.parse(rawBody) as { type?: string; livemode?: boolean; data?: { object?: unknown } };
    if (event.livemode) throw new PaymentConfigError("Live-mode events are refused.");
    if (event.type !== "checkout.session.completed") return null;
    const session = sessionSchema.parse(event.data?.object);
    if (session.payment_status !== "paid") return null;
    const meta = metadataSchema.parse(session.metadata);
    const purpose: CheckoutPurpose =
      meta.kind === "contribution"
        ? { kind: "contribution", amountCents: session.amount_total, source: meta.source }
        : { kind: "membership", amountCents: session.amount_total, organizationId: meta.organization_id, tier: meta.tier };
    return { provider: "stripe", ref: session.id, purpose };
  },
};
