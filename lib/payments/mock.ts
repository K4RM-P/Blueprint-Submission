import "server-only";
import { randomUUID } from "node:crypto";
import { env } from "@/lib/env";
import { signToken, verifyToken } from "./token";
import { PaymentConfigError, type CheckoutPurpose, type PaymentProvider } from "./provider";

/** Token lifetime for a mock checkout. */
const TTL_MS = 30 * 60_000;

interface MockPayload {
  ref: string;
  purpose: CheckoutPurpose;
  description: string;
  successUrl: string;
  cancelUrl: string;
  exp: number;
}

/** Server-only secret for signing mock tokens. Falls back to a key derived from the service-role key. */
function secret(): string {
  const s = process.env.PAYMENT_MOCK_SECRET || (process.env.SUPABASE_SERVICE_ROLE_KEY ? `mock-checkout:${process.env.SUPABASE_SERVICE_ROLE_KEY}` : "");
  if (!s) throw new PaymentConfigError("Mock payments need SUPABASE_SERVICE_ROLE_KEY (or PAYMENT_MOCK_SECRET) on the server.");
  return s;
}

/** Read a mock checkout token for the /checkout/mock page (no side effects). */
export function readMockCheckout(token: string): MockPayload | null {
  return verifyToken<MockPayload>(token, secret());
}

/**
 * Mock provider: no money moves. createCheckout signs the purchase into a token and
 * sends the browser to /checkout/mock; pressing "Pay" posts the token to the webhook,
 * which verifies the signature exactly like a real provider callback.
 */
export const mockProvider: PaymentProvider = {
  name: "mock",
  async createCheckout(req) {
    const ref = `mock_${randomUUID()}`;
    const token = signToken({ ref, purpose: req.purpose, description: req.description, successUrl: req.successUrl, cancelUrl: req.cancelUrl, exp: Date.now() + TTL_MS } satisfies MockPayload, secret());
    return { ref, url: `${env.siteUrl}/checkout/mock?token=${encodeURIComponent(token)}` };
  },
  async handleWebhook(rawBody) {
    const token = new URLSearchParams(rawBody).get("token");
    const payload = token ? readMockCheckout(token) : null;
    if (!payload) throw new PaymentConfigError("This test checkout link is invalid or has expired.");
    return { provider: "mock", ref: payload.ref, purpose: payload.purpose, successUrl: payload.successUrl };
  },
};
