import "server-only";
import { mockProvider } from "./mock";
import { stripeProvider } from "./stripe";
import type { PaymentProvider } from "./provider";

/** PAYMENT_PROVIDER=stripe uses Stripe test mode; anything else (default) uses the mock. */
export function getPaymentProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === "stripe" ? stripeProvider : mockProvider;
}
