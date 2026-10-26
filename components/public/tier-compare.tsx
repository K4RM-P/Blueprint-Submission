"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ClayCard, Segmented } from "@/components/clay";
import { TIER_BENEFITS, TIER_PRICE_CENTS } from "@/lib/pricing";
import { labels, type PartnerTier } from "@/lib/domain";

const PITCH: Record<PartnerTier, string> = {
  community: "Everything the core needs: certified data wipe, a certificate for every batch, a Device Passport for every laptop and your impact summary.",
  impact: "Optional: a live ESG dashboard, annual report and LinkedIn card for your team, clients and board.",
  champion: "Optional: everything in Impact, plus a team day at the bench and laptops sponsored for families.",
};

/**
 * The free Community tier leads (raised, full width on desktop); the paid tiers follow as
 * optional upgrades for more reporting and recognition. A gooey segmented "What's
 * included" comparator sits underneath (§9.3).
 */
export function TierCompare() {
  const [focus, setFocus] = useState<PartnerTier>("community");
  const tiers: PartnerTier[] = ["community", "impact", "champion"];
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-5 md:grid-cols-12">
        <ClayCard tint="mint" size="lg" className="flex flex-col gap-3 md:col-span-6 md:row-span-2 md:p-10">
          <p className="eyebrow !text-ink-2">{labels.tier.community} · where every partner starts</p>
          <p className="font-display text-[3.5rem] leading-none">Free</p>
          <p className="max-w-md text-body-l text-ink-2">{PITCH.community}</p>
          <ul className="mt-2 flex flex-col gap-2.5">
            {TIER_BENEFITS.community.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-mint text-loop-deep">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </ClayCard>
        {(["impact", "champion"] as const).map((t) => (
          <div key={t} className="flat flex flex-col gap-2 p-6 md:col-span-6">
            <p className="eyebrow !text-ink-2">Optional upgrade · {labels.tier[t]}</p>
            <p className="font-display text-[2rem] leading-none tnum">
              ${(TIER_PRICE_CENTS[t] / 100).toLocaleString("en-CA")}
              <span className="ml-1 font-sans text-base font-medium tracking-normal text-ink-2">/ year</span>
            </p>
            <p className="text-ink-2">{PITCH[t]}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-start gap-5">
        <p className="font-semibold">What&apos;s included</p>
        <Segmented label="Compare tiers" value={focus} onChange={setFocus} options={tiers.map((t) => ({ value: t, label: labels.tier[t].replace(" Partner", "") }))} />
        <ul className="grid w-full gap-x-8 gap-y-3 sm:grid-cols-2" aria-live="polite">
          {TIER_BENEFITS[focus].map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-mint text-loop-deep">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              </span>
              {b}
            </li>
          ))}
        </ul>
        <p className="text-small text-ink-3">Upgrade prices are proposed and still to be confirmed by Free Geek Toronto. Memberships buy recognition and reporting — never priority access to devices or influence over prices. Your batches stay free on every tier.</p>
      </div>
    </div>
  );
}
