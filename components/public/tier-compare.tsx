"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ClayCard, Segmented } from "@/components/clay";
import { TIER_BENEFITS, TIER_PRICE_CENTS } from "@/lib/pricing";
import { labels, type PartnerTier } from "@/lib/domain";
import { cn } from "@/lib/utils";

const TINT: Record<PartnerTier, "porcelain" | "apricot" | "butter"> = { community: "porcelain", impact: "apricot", champion: "butter" };
const PITCH: Record<PartnerTier, string> = {
  community: "Retire laptops responsibly with proof every drive was wiped.",
  impact: "Show your team, clients and board exactly who your laptops help.",
  champion: "Put your people at the bench and sponsor laptops for families.",
};

/** Tier cards (Impact raised higher) + a gooey segmented "What's included" comparator (§9.3). */
export function TierCompare() {
  const [focus, setFocus] = useState<PartnerTier>("impact");
  const tiers: PartnerTier[] = ["community", "impact", "champion"];
  return (
    <div className="flex flex-col gap-8">
      <div className="grid items-end gap-5 md:grid-cols-3">
        {tiers.map((t) => (
          <ClayCard key={t} tint={TINT[t]} size="lg" className={cn("flex flex-col gap-3", t === "impact" && "md:-translate-y-6 md:py-10")}>
            <p className="eyebrow !text-ink-2">{labels.tier[t]}</p>
            <p className="font-display text-[2.5rem] leading-none tnum">
              {TIER_PRICE_CENTS[t] === 0 ? "Free" : `$${(TIER_PRICE_CENTS[t] / 100).toLocaleString("en-CA")}`}
              {TIER_PRICE_CENTS[t] > 0 ? <span className="ml-1 font-sans text-base font-medium tracking-normal text-ink-2">/ year</span> : null}
            </p>
            <p className="text-ink-2">{PITCH[t]}</p>
          </ClayCard>
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
        <p className="text-small text-ink-3">Prices are proposed and still to be confirmed by Free Geek Toronto. Memberships buy recognition and reporting — never priority access to devices or influence over prices.</p>
      </div>
    </div>
  );
}
