import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClayButton, StatPebble } from "@/components/clay";
import { ClayLaptop } from "@/components/illustrations/clay-laptop";
import { PassportLookup } from "@/components/public/passport-lookup";
import { PartnerTile } from "@/components/public/partner-tile";
import { BatonRun } from "@/components/public/baton-run";
import { Hero } from "@/components/landing/hero";
import { Reveal } from "@/components/landing/reveal";
import { ShareBar } from "@/components/landing/share-bar";
import { Tactile } from "@/components/landing/tactile";
import { createClient } from "@/lib/supabase/server";
import { getPublicImpact } from "@/lib/queries/impact";
import { logoUrl } from "@/lib/queries/common";
import type { PartnerTier } from "@/lib/domain";

export const metadata: Metadata = {
  title: { absolute: "Relay · Pass it on." },
  description: "Free Geek Toronto turns business laptops into affordable computers for students, newcomers and families — and shows every step.",
};

const fmt = (n: number) => n.toLocaleString("en-CA");

export default async function Landing() {
  const supabase = await createClient();
  const [impact, { data: wall }] = await Promise.all([getPublicImpact(supabase), supabase.rpc("partner_wall")]);
  const t = impact.totals;
  // Lead with partners whose devices are already back in use; newcomers fill the rest. Five fills the featured 1 + 2×2 layout.
  const partners = [...(wall ?? [])].sort((a, b) => Number(b.devices_reused) - Number(a.devices_reused)).slice(0, 5);

  return (
    <main>
      {/* 1 · Hero: "Pass it on." */}
      <Hero devicesReused={t.devicesReused} />

      {/* 2 · The Baton Run (pinned, scroll-linked) */}
      <BatonRun
        stations={[
          { hand: "A Toronto business", title: "Handed over", body: "Retired laptops arrive with drives intact. No shredding, no drawer.", stat: fmt(t.devicesReceived), statLabel: "devices received" },
          { hand: "Free Geek staff", title: "Wiped & verified", body: "Every drive is wiped, then a staff member checks the report.", stat: fmt(impact.stages.verified), statLabel: "wipes verified" },
          { hand: "A volunteer", title: "Rebuilt on the bench", body: "Tested, refurbished and set up with open-source software.", stat: fmt(impact.stages.refurbished), statLabel: "refurbished" },
          { hand: "Its next owner", title: "In someone's hands", body: "Sold at prices tied to ability to pay, to people who need one.", stat: fmt(t.devicesReused), statLabel: "people reached" },
        ]}
      />

      {/* 3 · Live impact: the numbers the relay has moved so far */}
      <section aria-labelledby="impact-title" className="mx-auto max-w-[1200px] px-4 pb-28 pt-10 sm:px-6 md:pb-40 md:pt-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-6">
          <div className="md:sticky md:top-32 md:col-span-4 md:self-start md:pr-6">
            <Reveal>
              <p className="eyebrow">Live impact</p>
              <h2 id="impact-title" className="font-display mt-3 text-[2.5rem] leading-[1.02] sm:text-display-m">
                What the relay has moved so far.
              </h2>
              <p className="mt-4 text-ink-2">Counted from every recorded handoff, so these numbers change when a laptop does.</p>
              <Link href="/impact#methodology" className="mt-5 inline-block text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
                How we calculate this
              </Link>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-8 md:grid-cols-3 md:gap-5">
            <Reveal className="col-span-2 md:row-span-2">
              <StatPebble className="h-full min-h-[240px] md:min-h-[340px]" size="lg" tint="mint" label="kg of e-waste kept out of landfill" value={t.kgDiverted} decimals={0} suffix="kg" caption="Reused or responsibly recycled devices." />
            </Reveal>
            <Reveal delay={0.08} className="col-span-2 md:col-span-1">
              <StatPebble className="h-full" label="kg CO₂e avoided (est.)" value={t.co2eAvoidedKg} />
            </Reveal>
            <Reveal delay={0.16}>
              <StatPebble className="h-full" label="Volunteer hours" value={t.volunteerHours} />
            </Reveal>
            <Reveal delay={0.2}>
              <StatPebble className="h-full" label="Reuse Partners" value={impact.activePartners} />
            </Reveal>
            <Reveal delay={0.12} className="col-span-2">
              <div className="clay-glass hairline-top flex h-full flex-col justify-between gap-5 p-6">
                <p className="eyebrow !text-ink-2">Donated devices already back in use</p>
                <p className="font-display text-[2.25rem] leading-none tnum sm:text-[2.75rem]">
                  {fmt(t.devicesReused)}
                  <span className="ml-2 font-sans text-body font-medium tracking-normal text-ink-2">of {fmt(t.devicesReceived)} received</span>
                </p>
                <ShareBar value={t.devicesReceived ? t.devicesReused / t.devicesReceived : 0} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4 · Three ways in, deliberately different sizes and weights */}
      <section aria-labelledby="who" className="mx-auto max-w-[1200px] px-4 pb-28 sm:px-6 md:pb-40">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Take a leg</p>
          <h2 id="who" className="font-display mt-3 text-[2.5rem] leading-[1.02] sm:text-display-m">
            Everyone in the relay gets something back.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-12">
          <Reveal className="md:col-span-7 md:row-span-2">
            <Tactile data-tint="apricot" className="clay relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[var(--r-xl)] p-7 pb-56 sm:p-10 sm:pb-10">
              <p className="eyebrow !text-ink-2">For businesses</p>
              <h3 className="font-display mt-3 max-w-md text-[2rem] leading-[1.05] sm:text-[2.5rem]">Your three-year-old laptops are someone&apos;s first computer.</h3>
              <p className="mt-4 max-w-sm text-ink-2">Free to start. A data-wipe certificate for every batch, and a live dashboard of who your devices help.</p>
              <ClayButton href="/become-a-partner" variant="secondary" iconRight={<ArrowRight />} className="relative z-[1] mt-8 self-start">
                See how partnering works
              </ClayButton>
              <ClayLaptop className="pointer-events-none absolute -bottom-10 -right-10 w-[78%] max-w-[360px] sm:w-[62%] opacity-95 sm:-right-8" tint="porcelain" />
            </Tactile>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5">
            <Tactile data-tint="porcelain" className="clay relative flex h-full flex-col gap-3 p-6 sm:p-7">
              <p className="eyebrow">For volunteers</p>
              <p className="font-display text-[3rem] leading-none tnum">
                {fmt(t.volunteerHours)}
                <span className="ml-2 font-sans text-body font-medium tracking-normal text-ink-2">bench hours logged</span>
              </p>
              <p className="text-ink-2">Real IT experience on real machines, with a Skills Wallet that proves it.</p>
              <Link href="/about#volunteer" className="mt-auto text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
                How volunteering works
              </Link>
            </Tactile>
          </Reveal>
          <Reveal delay={0.18} className="md:col-span-5">
            <Tactile data-tint="mint" className="clay relative flex h-full flex-col gap-3 p-6 sm:p-7">
              <p className="eyebrow !text-loop-deep">For buyers</p>
              <p className="text-title font-semibold">Safe, tested computers at prices tied to what you can pay.</p>
              <p className="text-ink-2">Every one wiped, rebuilt and carrying a passport you can check.</p>
              <Link href="/about#pricing" className="mt-auto text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
                Why our computers aren&apos;t free
              </Link>
            </Tactile>
          </Reveal>
        </div>
      </section>

      {/* Passport lookup: one quiet panel, no hard rules */}
      <section id="scan" aria-labelledby="scan-title" className="scroll-mt-28 px-4 sm:px-6">
        <Reveal className="mx-auto max-w-[1200px]">
          <div className="well grid items-center gap-8 rounded-[var(--r-xl)] p-7 sm:p-10 md:grid-cols-12 md:p-14">
            <div className="md:col-span-6">
              <p className="eyebrow">Device Passport</p>
              <h2 id="scan-title" className="font-display mt-3 text-[2.25rem] leading-[1.05] sm:text-[2.75rem]">
                Every refurbished computer carries its story.
              </h2>
              <p className="mt-3 max-w-md text-ink-2">Scan the QR sticker on the laptop or type its code. See who donated it, when its data was wiped, and what your money funds.</p>
            </div>
            <PassportLookup className="md:col-span-6 md:pl-6" />
          </div>
        </Reveal>
      </section>

      {/* 5 · Partner Wall preview: the furthest-run partner leads */}
      {partners.length ? (
        <section aria-labelledby="wall" className="mx-auto max-w-[1200px] px-4 py-28 sm:px-6 md:py-40">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Partner Wall</p>
              <h2 id="wall" className="font-display mt-3 text-[2.5rem] leading-[1.02] sm:text-display-m">
                Toronto businesses in the relay
              </h2>
            </div>
            <Link href="/partners" className="text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
              Full Partner Wall
            </Link>
          </Reveal>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p, i) => (
              <li key={p.slug} className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : undefined}>
                <Reveal delay={Math.min(i, 5) * 0.07} className="h-full">
                  <Tactile className="h-full rounded-[var(--r-lg)]">
                    <PartnerTile name={p.name} logoUrl={logoUrl(p.logo_path)} tier={p.tier as PartnerTier} reused={Number(p.devices_reused)} featured={i === 0 && Number(p.devices_reused) > 0} />
                  </Tactile>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 6 · Honest note */}
      <section className="mx-auto max-w-[1200px] px-4 pb-28 sm:px-6 md:pb-36">
        <Reveal className="grid gap-4 md:grid-cols-12">
          <p className="eyebrow md:col-span-3 md:pt-1.5">Good to know</p>
          <p className="text-body-l text-ink-2 md:col-span-8">
            <span className="font-semibold text-ink">Free Geek Toronto is an independent non-profit.</span> Free Geek locations in other cities run separately, so products and prices differ. Our computers
            aren&apos;t free because refurbishing, data security and fair wages cost money.{" "}
            <Link href="/about#pricing" className="font-semibold text-loop-deep underline underline-offset-4">
              Here&apos;s exactly how pricing works
            </Link>
            .
          </p>
        </Reveal>
      </section>
    </main>
  );
}
