import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { RoundUpWidget } from "@/components/payments/round-up-widget";
import { formatCents } from "@/lib/ledger";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Round up at checkout (demo)", robots: { index: false } };

/** A sample order from FGT's online store — fictional, for demonstrating the widget. */
const ORDER = {
  number: "FGT-WEB-10482",
  items: [
    { name: "Refurbished Dell Latitude 5420 · 16 GB · Linux Mint", cents: 21_900 },
    { name: "USB-C charger (refurbished)", cents: 1_499 },
  ],
};

/** PIF-02: mock store order-confirmation page showing the embeddable round-up widget. */
export default async function RoundUpDemo({ searchParams }: { searchParams: Promise<{ thanks?: string }> }) {
  const { thanks } = await searchParams;
  const total = ORDER.items.reduce((s, i) => s + i.cents, 0);
  const snippet = `<a href="${env.siteUrl}/pay-it-forward?amount=ROUND_UP_CENTS">Round up for digital inclusion</a>`;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:py-20">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="min-w-0 md:col-span-7">
          <p className="eyebrow">Demo · sample store checkout</p>
          <h1 className="font-display mt-3 text-[2.25rem] leading-tight sm:text-display-m">Round up at the store&apos;s checkout.</h1>
          <p className="measure mt-4 text-body-l text-ink-2">
            This is how the widget would look on Free Geek Toronto&apos;s own online store, right after someone buys. The order below is made up; the round-up is real (in test mode).
          </p>

          {/* The mock store's confirmation page: deliberately plain and flat, like a third-party store */}
          <section aria-labelledby="order" className="flat mt-10 overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line bg-canvas/50 px-6 py-4">
              <CheckCircle2 className="size-5 text-success" aria-hidden />
              <h2 id="order" className="font-semibold">
                Thanks! Order {ORDER.number} is confirmed.
              </h2>
            </div>
            <ul className="divide-y divide-line px-6">
              {ORDER.items.map((i) => (
                <li key={i.name} className="flex items-start justify-between gap-4 py-4">
                  <span className="flex gap-3">
                    <Package className="mt-0.5 size-5 shrink-0 text-ink-3" aria-hidden />
                    {i.name}
                  </span>
                  <span className="tnum">{formatCents(i.cents)}</span>
                </li>
              ))}
              <li className="flex justify-between py-4 font-semibold">
                <span>Total paid</span>
                <span className="tnum">{formatCents(total)}</span>
              </li>
            </ul>
            <div className="border-t border-line p-4 sm:p-6">
              {thanks ? (
                <p role="status" className="flex items-center gap-2 font-medium text-loop-deep">
                  <CheckCircle2 className="size-5" aria-hidden /> You rounded up {formatCents(Number(thanks) || 0)}. Thank you.
                </p>
              ) : (
                <RoundUpWidget orderTotalCents={total} />
              )}
            </div>
          </section>
        </div>

        <aside className="min-w-0 md:col-span-5 md:pt-24">
          <h2 className="text-title font-semibold">For Free Geek Toronto&apos;s store</h2>
          <p className="mt-2 text-ink-2">No plugin needed. Any store platform can show a link on its confirmation page, with the round-up amount filled in:</p>
          <pre className="mt-4 overflow-x-auto rounded-[var(--r-sm)] bg-ink p-4 font-mono text-[0.8125rem] leading-relaxed text-white">
            <code>{snippet}</code>
          </pre>
          <p className="mt-4 text-small text-ink-3">Round-ups land in the same ledger as every other contribution and show up on the staff fund page.</p>
          <Link href="/pay-it-forward" className="mt-6 inline-block text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
            About the Pay-It-Forward fund
          </Link>
        </aside>
      </div>
    </main>
  );
}
