import { NextResponse, type NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { fulfillPayment } from "@/lib/payments/fulfill";
import { PaymentConfigError } from "@/lib/payments/provider";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Payment webhook (PIF-03, PIF-04, PIF-05). Stripe posts signed JSON events; the mock
 * checkout posts its HMAC-signed token from /checkout/mock. Both are verified by the
 * provider before anything is written, and fulfillment is idempotent on provider_ref.
 */
export async function POST(request: NextRequest) {
  const provider = getPaymentProvider();
  const raw = await request.text();
  if (raw.length > 64_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });

  try {
    const payment = await provider.handleWebhook(raw, request.headers);
    if (!payment) return NextResponse.json({ received: true, ignored: true });
    await fulfillPayment(payment);
    if (provider.name === "mock") {
      const target = new URL(payment.successUrl ?? "/", env.siteUrl);
      // Only ever redirect back into our own site.
      if (target.origin !== new URL(env.siteUrl).origin) return NextResponse.redirect(new URL("/", env.siteUrl), 303);
      return NextResponse.redirect(target, 303);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    const bad = err instanceof PaymentConfigError || (err instanceof Error && err.name === "ZodError");
    console.error("[payments/webhook]", err instanceof Error ? err.message : err);
    if (provider.name === "mock") {
      const url = new URL("/checkout/mock", env.siteUrl);
      url.searchParams.set("error", bad ? "invalid" : "failed");
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.json({ error: bad ? "Invalid event" : "Webhook failed" }, { status: bad ? 400 : 500 });
  }
}
