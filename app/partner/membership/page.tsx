import type { Metadata } from "next";
import { Check, CheckCircle2 } from "lucide-react";
import { ClayCard, EmptyState } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { UpgradeButton } from "@/components/partner/upgrade-button";
import { getPartnerContext } from "@/lib/queries/partner";
import { longDate } from "@/lib/dates";
import { formatCents, CHAMPION_SPONSORED_LAPTOPS } from "@/lib/ledger";
import { daysRemaining, isMembershipActive, purchasableTiers, type PaidTier } from "@/lib/membership";
import { TIER_BENEFITS, TIER_PRICE_CENTS } from "@/lib/pricing";
import { labels, type PartnerTier } from "@/lib/domain";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Membership" };

const TINT: Record<PartnerTier, "porcelain" | "apricot" | "butter"> = { community: "porcelain", impact: "apricot", champion: "butter" };

/** PP-12: current tier, benefits, upgrade or renew through checkout (PIF-04). */
export default async function MembershipPage({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const { paid } = await searchParams;
  const { supabase, org } = await getPartnerContext();
  const { data: payments } = await supabase.from("membership_payments").select("id, created_at, tier, amount_cents, provider, period_start, period_end").eq("organization_id", org.id).order("created_at", { ascending: false });

  const tier = org.tier as PartnerTier;
  const expires = org.membership_expires_at ? new Date(org.membership_expires_at) : null;
  const active = isMembershipActive(tier, expires);
  const days = daysRemaining(expires);
  const options = purchasableTiers(tier);
  // Paid tiers are optional (the free tier is the program), so no payment button is the page's primary.
  const justPaid = paid === "impact" || paid === "champion" ? (paid as PaidTier) : null;

  return (
    <>
      <PageHeader eyebrow="Membership" title={labels.tier[tier]} description="Optional. Your batches, certified data wipes and Device Passports are free on every tier. Paid memberships add reporting and recognition — never priority access to devices or a say in prices." />

      {justPaid ? (
        <div role="status" className="glass mb-8 flex items-center gap-3 rounded-full py-2 pl-2 pr-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-loop-deep">
            <CheckCircle2 className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="text-small sm:text-base">
            Payment received. {org.name} is now a <span className="font-semibold">{labels.tier[justPaid]}</span>
            {justPaid === "champion" ? ` — and ${CHAMPION_SPONSORED_LAPTOPS} sponsored laptops are credited to the Pay-It-Forward fund in your name.` : "."}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-12">
        <ClayCard tint={TINT[tier]} size="lg" className="flex flex-col gap-5 lg:col-span-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="eyebrow !text-ink-2">Your plan</p>
            <p className="text-small text-ink-2">
              {tier === "community"
                ? "Free, no expiry"
                : active
                  ? `Renews by ${longDate(org.membership_expires_at?.slice(0, 10))} · ${days} days left`
                  : `Lapsed on ${longDate(org.membership_expires_at?.slice(0, 10))}`}
            </p>
          </div>
          <p className="font-display text-[2.5rem] leading-none tnum">
            {TIER_PRICE_CENTS[tier] === 0 ? "Free" : formatCents(TIER_PRICE_CENTS[tier]).replace(".00", "")}
            {TIER_PRICE_CENTS[tier] > 0 ? <span className="ml-1 font-sans text-base font-medium tracking-normal text-ink-2">/ year</span> : null}
          </p>
          <ul className="flex flex-col gap-2.5">
            {TIER_BENEFITS[tier].map((b) => (
              <li key={b} className="flex gap-2.5">
                <Check className="mt-0.5 size-5 shrink-0 text-loop-deep" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {options.includes(tier as PaidTier) ? (
            <div className="mt-auto pt-2">
              <UpgradeButton tier={tier as PaidTier} label={active ? "Renew for another year" : "Renew membership"} variant="secondary" />
            </div>
          ) : null}
        </ClayCard>

        <div className="flex flex-col gap-6 lg:col-span-5">
          {options
            .filter((t) => t !== tier)
            .map((t) => (
              <section key={t} aria-labelledby={`up-${t}`} className="flat flex flex-col gap-4 p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id={`up-${t}`} className="text-title font-semibold">
                    {labels.tier[t]}
                  </h2>
                  <p className="font-display text-2xl tnum">
                    {formatCents(TIER_PRICE_CENTS[t]).replace(".00", "")}
                    <span className="ml-1 font-sans text-small font-medium text-ink-2">/ yr</span>
                  </p>
                </div>
                <ul className="flex flex-col gap-2 text-ink-2">
                  {TIER_BENEFITS[t]
                    .filter((b) => !b.startsWith("Everything in"))
                    .map((b) => (
                      <li key={b} className="flex gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-loop-deep" aria-hidden />
                        <span className="text-small">{b}</span>
                      </li>
                    ))}
                </ul>
                <UpgradeButton tier={t} label={`Upgrade to ${labels.tier[t].replace(" Partner", "")}`} variant="secondary" />
              </section>
            ))}
          {options.length === 1 && options[0] === tier ? (
            <p className="flat p-6 text-ink-2">You&apos;re on our top tier. Thank you for putting your people — and your laptops — to work for Toronto.</p>
          ) : null}
          <p className="text-small text-ink-3">Memberships are a business service, so they don&apos;t come with a tax receipt. Prices are placeholders until Free Geek Toronto confirms them.</p>
        </div>
      </div>

      <section aria-labelledby="history" className="mt-12">
        <h2 id="history" className="text-title font-semibold">
          Payment history
        </h2>
        {(payments ?? []).length === 0 ? (
          <EmptyState title="No payments yet." tone="apricot" className="py-6">
            Community membership is free. Upgrades appear here with their dates.
          </EmptyState>
        ) : (
          <div className="flat mt-4 overflow-x-auto !p-0">
            <table className="data-table">
              <caption className="sr-only">Membership payments</caption>
              <thead>
                <tr>
                  <th scope="col">Paid</th>
                  <th scope="col">Tier</th>
                  <th scope="col">Period</th>
                  <th scope="col" className="text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).map((p) => (
                  <tr key={p.id}>
                    <td className="text-small text-ink-2">{longDate(p.created_at)}</td>
                    <td>{labels.tier[p.tier]}</td>
                    <td className={cn("text-small text-ink-2")}>
                      {longDate(p.period_start)} → {longDate(p.period_end)}
                    </td>
                    <td className="text-right font-semibold tnum">{formatCents(p.amount_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
