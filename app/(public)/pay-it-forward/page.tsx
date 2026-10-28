import type { Metadata } from "next";
import { env } from "@/lib/env";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { ClayCard, IconTile } from "@/components/clay";
import { ContributionForm } from "@/components/payments/contribution-form";
import { FundJar } from "@/components/payments/fund-jar";
import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/ledger";
import { labels, PIF_ELIGIBLE_RECIPIENTS } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Pay It Forward",
  description: "Chip in to lower the price of a refurbished computer for a Toronto student, newcomer, senior or family.",
};

type Summary = { raised_cents: number; balance_cents: number; devices_subsidized: number; contributions: number };

/** PIF-01: explains the fund and takes one-time contributions. */
export default async function PayItForwardPage({ searchParams }: { searchParams: Promise<{ thanks?: string; amount?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_fund_summary");
  const s = (data as Summary | null) ?? { raised_cents: 0, balance_cents: 0, devices_subsidized: 0, contributions: 0 };
  const thanks = Number(sp.thanks);
  const initial = Number(sp.amount);
  const who = PIF_ELIGIBLE_RECIPIENTS.map((r) => labels.recipient[r].toLowerCase());

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:py-24">
      {Number.isFinite(thanks) && thanks > 0 ? (
        <div role="status" className="glass mb-10 flex items-center gap-3 rounded-full py-2 pl-2 pr-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-loop-deep">
            <CheckCircle2 className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="text-small sm:text-base">
            Thank you — <span className="font-semibold">{formatCents(thanks)}</span> is now in the fund, waiting to make someone&apos;s computer more affordable.
          </p>
        </div>
      ) : null}

      <div className="grid items-start gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow">Pay-It-Forward fund</p>
          <h1 className="font-display mt-4 text-[2.75rem] leading-[0.98] sm:text-display-l">Help someone&apos;s first computer cost less.</h1>
          <p className="measure mt-6 text-body-l text-ink-2">
            Every dollar goes into one shared fund. When a {who.slice(0, -1).join(", ")} or {who.at(-1)} buys a refurbished computer, Free Geek Toronto staff can use it to lower the
            price at the till.
          </p>
          <ClayCard tint="apricot" size="lg" className="mt-10">
            <h2 className="text-title font-semibold">Chip in once</h2>
            <p className="mt-1 text-small text-ink-2">Pick an amount. You&apos;ll confirm on a secure checkout page.</p>
            <div className="mt-6">
              <ContributionForm initialCents={Number.isFinite(initial) && initial > 0 ? Math.round(initial) : undefined} />
            </div>
          </ClayCard>
        </div>

        <aside aria-label="The fund today" className="md:col-span-5 md:pt-8">
          <FundJar balanceCents={s.balance_cents} raisedCents={s.raised_cents} />
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--r-md)] border border-line bg-line text-center">
            <div className="bg-surface-flat p-4">
              <dt className="text-small text-ink-2">Raised so far</dt>
              <dd className="font-display mt-1 text-2xl tnum">{formatCents(s.raised_cents)}</dd>
            </div>
            <div className="bg-surface-flat p-4">
              <dt className="text-small text-ink-2">Computers made cheaper</dt>
              <dd className="font-display mt-1 text-2xl tnum">{s.devices_subsidized.toLocaleString("en-CA")}</dd>
            </div>
          </dl>
          {env.demoMode ? <p className="mt-3 text-[0.8125rem] text-ink-3">Fictional demo data.</p> : null}
        </aside>
      </div>

      <section aria-labelledby="how" className="mt-24 grid gap-10 md:grid-cols-12">
        <h2 id="how" className="font-display text-[2rem] leading-tight md:col-span-4">
          Where your contribution goes
        </h2>
        <ol className="flex flex-col divide-y divide-line md:col-span-8">
          {[
            ["It joins the fund.", "Contributions, store round-ups and Champion Partner sponsorships all go into one ledger that staff can see line by line."],
            ["Staff apply it at a sale.", "Only when the buyer is a digital-inclusion recipient — a student, newcomer, senior, low-income household or non-profit — and never more than the device's price."],
            ["The passport says so.", "That computer's Device Passport notes it was made more affordable by the fund. The buyer's identity is never shown."],
          ].map(([title, body], i) => (
            <li key={title} className="grid grid-cols-[3rem_1fr] gap-2 py-5 first:pt-0">
              <span className="font-mono text-small text-ink-3 tnum">0{i + 1}</span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-ink-2">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="guard" className="mt-20 grid gap-6 md:grid-cols-12">
        <div className="flat flex gap-4 p-7 md:col-span-7">
          <IconTile tint="mint">
            <ShieldCheck />
          </IconTile>
          <div>
            <h2 id="guard" className="text-title font-semibold">
              The fund only ever lowers prices
            </h2>
            <p className="mt-2 text-ink-2">
              It can&apos;t be spent on anything else, and the balance can never go below zero. Prices themselves are set by Free Geek Toronto and are never raised to fill the fund.
            </p>
          </div>
        </div>
        <div className="flat flex flex-col justify-between gap-4 p-7 md:col-span-5">
          <p className="text-ink-2">Shopping at Free Geek Toronto online? You can round up your order at checkout.</p>
          <Link href="/pay-it-forward/round-up" className="text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
            See the round-up at checkout
          </Link>
        </div>
      </section>
    </main>
  );
}
