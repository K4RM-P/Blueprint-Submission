import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, TriangleAlert } from "lucide-react";
import { ClayCard } from "@/components/clay";
import { MockPayButton } from "@/components/payments/mock-pay-button";
import { readMockCheckout } from "@/lib/payments/mock";
import { formatCents } from "@/lib/ledger";

export const metadata: Metadata = { title: "Test checkout", robots: { index: false } };

/**
 * PIF-05 mock provider: stands in for Stripe Checkout when no keys are set.
 * Nothing is charged. "Pay" posts the signed token to /api/payments/webhook.
 */
export default async function MockCheckoutPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const { token, error } = await searchParams;
  const session = token ? readMockCheckout(token) : null;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <ClayCard size="xl" className="flex flex-col gap-6">
        {session && !error ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">Test checkout</p>
              <span className="chip bg-butter text-ink">No real money</span>
            </div>
            <div>
              <h1 className="font-display text-[2rem] leading-tight">{formatCents(session.purpose.amountCents)}</h1>
              <p className="mt-1 text-ink-2">{session.description}</p>
            </div>
            <div className="well flex items-center gap-3 px-4 py-3 font-mono text-[0.9375rem] text-ink-2">
              <CreditCard className="size-5 shrink-0" aria-hidden />
              4242 4242 4242 4242 · 12/34 · test card
            </div>
            <MockPayButton token={token!} label={`Pay ${formatCents(session.purpose.amountCents)}`} />
            <Link href={session.cancelUrl} className="self-center text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
              Cancel and go back
            </Link>
          </>
        ) : (
          <>
            <TriangleAlert className="size-8 text-warning" aria-hidden />
            <h1 className="font-display text-[1.75rem] leading-tight">{error === "failed" ? "We couldn't record that payment." : "This checkout link has expired."}</h1>
            <p className="text-ink-2">Nothing was charged. Start again from the page you came from.</p>
            <Link href="/pay-it-forward" className="font-semibold text-loop-deep underline underline-offset-4">
              Back to Pay It Forward
            </Link>
          </>
        )}
      </ClayCard>
    </main>
  );
}
