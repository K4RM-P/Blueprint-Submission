/**
 * Payment provider abstraction (PIF-05). Two implementations:
 *  - `mock`   (default, no keys): an HMAC-signed checkout token completed on /checkout/mock.
 *  - `stripe` (test mode only):   Stripe Checkout Sessions + signed webhooks.
 * Selected by PAYMENT_PROVIDER. Fulfillment (writing the ledger) lives in ./fulfill.ts.
 */
import type { PartnerTier } from "@/lib/domain";

export type ProviderName = "mock" | "stripe";

export type CheckoutPurpose =
  | { kind: "contribution"; amountCents: number; source: "pay_it_forward" | "round_up" }
  | { kind: "membership"; amountCents: number; organizationId: string; tier: Exclude<PartnerTier, "community"> };

export interface CheckoutRequest {
  purpose: CheckoutPurpose;
  /** Shown on the checkout page / Stripe line item. */
  description: string;
  /** Absolute URLs. */
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  url: string;
  ref: string;
}

/** A verified, completed payment ready to be written to the ledger. */
export interface CompletedPayment {
  provider: ProviderName;
  ref: string;
  purpose: CheckoutPurpose;
  /** Where to send the browser after a mock payment (Stripe redirects on its own). */
  successUrl?: string;
}

export interface PaymentProvider {
  name: ProviderName;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Verify a webhook delivery. Returns null for events we ignore; throws on a bad signature. */
  handleWebhook(rawBody: string, headers: Headers): Promise<CompletedPayment | null>;
}

export class PaymentConfigError extends Error {}
