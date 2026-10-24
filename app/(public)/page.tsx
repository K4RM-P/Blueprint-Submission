import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, HeartHandshake, Laptop, Wrench } from "lucide-react";
import { ClayButton, ClayCard, IconTile, StatPebble } from "@/components/clay";
import { LiquidBlob } from "@/components/liquid";
import { ClayLaptop } from "@/components/illustrations/clay-laptop";
import { PassportLookup } from "@/components/public/passport-lookup";
import { PartnerTile } from "@/components/public/partner-tile";
import { TheLoop } from "@/components/public/the-loop";
import { createClient } from "@/lib/supabase/server";
import { getPublicImpact } from "@/lib/queries/impact";
import { logoUrl } from "@/lib/queries/common";
import type { PartnerTier } from "@/lib/domain";

export const metadata: Metadata = {
  title: { absolute: "Relay · Old laptops. New loops." },
  description: "Free Geek Toronto turns business laptops into affordable computers for students, newcomers and families — and shows every step.",
};

const fmt = (n: number) => n.toLocaleString("en-CA");

export default async function Landing() {
  const supabase = await createClient();
  const [impact, { data: wall }] = await Promise.all([getPublicImpact(supabase), supabase.rpc("partner_wall")]);
  const t = impact.totals;
  const partners = (wall ?? []).slice(0, 6);

  return (
    <main>
      {/* 1 · Hero */}
      <section className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-12 md:pb-28 md:pt-20">
        <div className="md:col-span-7">
          <p className="eyebrow">Free Geek Toronto × Relay</p>
          <h1 className="font-display mt-5 text-[3.25rem] leading-[0.92] sm:text-[4.5rem] lg:text-display-xl">
            Old laptops.
            <br />
            <span className="text-loop-deep">New loops.</span>
          </h1>
          <p className="measure mt-7 text-body-l text-ink-2">
            We turn your business&apos;s retired laptops into affordable computers for Toronto students, newcomers and families — and show you every step.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ClayButton href="/login?mode=signup" variant="primary" size="lg">
              Become a Reuse Partner
            </ClayButton>
            <ClayButton href="#scan" variant="secondary" size="lg">
              Scan a Passport
            </ClayButton>
          </div>
        </div>
        <div className="relative md:col-span-5">
          <LiquidBlob className="-left-16 -top-16 size-[420px]" tone="mint" />
          <LiquidBlob className="-bottom-20 -right-10 size-[360px]" tone="apricot" duration={24} />
          <ClayLaptop className="relative mx-auto max-w-[460px] drop-shadow-sm" />
          <div className="glass relative mx-auto -mt-4 flex w-fit items-center gap-3 rounded-full py-2 pl-2 pr-5">
            <span className="grid size-10 place-items-center rounded-full bg-mint text-loop-deep">
              <Laptop className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-small">
              <span className="font-display text-xl tnum">{fmt(t.devicesReused)}</span> <span className="text-ink-2">devices back in use</span>
            </p>
          </div>
        </div>
      </section>

      {/* 2 · The loop (pinned, scroll-driven) */}
      <TheLoop
        stations={[
          { title: "Donated", body: "Businesses send retired laptops — drives intact, no shredding.", stat: fmt(t.devicesReceived), statLabel: "devices received" },
          { title: "Wiped & verified", body: "Every drive is wiped, then checked by a staff member.", stat: fmt(impact.stages.verified), statLabel: "wipes verified" },
          { title: "Refurbished by volunteers", body: "Tested, rebuilt with open-source software, quality-checked.", stat: fmt(impact.stages.refurbished), statLabel: "refurbished" },
          { title: "In someone's hands", body: "Sold at prices tied to ability to pay, to people who need them.", stat: fmt(t.devicesReused), statLabel: "people reached" },
        ]}
      />

      {/* 3 · Live impact (asymmetric bento) */}
      <section aria-labelledby="impact-title" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="impact-title" className="font-display text-[2.25rem] leading-tight sm:text-display-m">
            Live impact
          </h2>
          <Link href="/impact#methodology" className="text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
            How we calculate this
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-4 md:grid-rows-2">
          <StatPebble className="md:col-span-2 md:row-span-2" size="lg" tint="mint" label="kg of e-waste kept out of landfill" value={t.kgDiverted} decimals={0} suffix="kg" caption="Reused or responsibly recycled devices." />
          <StatPebble label="Devices back in use" value={t.devicesReused} />
          <StatPebble label="kg CO₂e avoided (est.)" value={t.co2eAvoidedKg} />
          <StatPebble label="Volunteer hours" value={t.volunteerHours} />
          <StatPebble label="Reuse Partners" value={impact.activePartners} />
        </div>
      </section>

      {/* 4 · For each audience — deliberately different sizes */}
      <section aria-labelledby="who" className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6 md:pb-32">
        <h2 id="who" className="sr-only">
          Ways to take part
        </h2>
        <div className="grid gap-5 md:grid-cols-12">
          <ClayCard tint="apricot" size="xl" className="flex flex-col gap-6 md:col-span-7 md:row-span-2">
            <IconTile tint="apricot" size={52}>
              <Building2 />
            </IconTile>
            <div>
              <p className="eyebrow">For businesses</p>
              <h3 className="font-display mt-2 text-[2rem] leading-tight">Your 3-year-old laptops are someone&apos;s first computer.</h3>
              <p className="mt-3 max-w-md text-ink-2">Free to start. A data-wipe certificate for every batch. A live dashboard of who your devices help.</p>
            </div>
            <ClayButton href="/become-a-partner" variant="secondary" iconRight={<ArrowRight />} className="mt-auto self-start">
              See how partnering works
            </ClayButton>
          </ClayCard>
          <ClayCard tint="butter" className="flex flex-col gap-3 md:col-span-5">
            <div className="flex items-center gap-3">
              <IconTile tint="butter">
                <Wrench />
              </IconTile>
              <p className="eyebrow">For volunteers</p>
            </div>
            <p className="text-lg font-semibold">Build real IT experience — and a verifiable record of it.</p>
            <Link href="/about#volunteer" className="text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
              How volunteering works
            </Link>
          </ClayCard>
          <ClayCard tint="mint" className="flex flex-col gap-3 md:col-span-5">
            <div className="flex items-center gap-3">
              <IconTile tint="mint">
                <HeartHandshake />
              </IconTile>
              <p className="eyebrow">For buyers</p>
            </div>
            <p className="text-lg font-semibold">Safe, tested computers at prices tied to ability to pay.</p>
            <Link href="/about#pricing" className="text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
              Why our computers aren&apos;t free
            </Link>
          </ClayCard>
        </div>
      </section>

      {/* Passport lookup */}
      <section id="scan" aria-labelledby="scan-title" className="scroll-mt-28 border-y border-line/80 py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 sm:px-6 md:grid-cols-2">
          <div>
            <p className="eyebrow">Device Passport</p>
            <h2 id="scan-title" className="font-display mt-3 text-[2.25rem] leading-tight">
              Every refurbished computer carries its story.
            </h2>
            <p className="mt-3 max-w-md text-ink-2">Scan the QR sticker on the laptop, or type its code — who donated it, when its data was wiped, and what your money funds.</p>
          </div>
          <PassportLookup />
        </div>
      </section>

      {/* 5 · Partner Wall preview */}
      {partners.length ? (
        <section aria-labelledby="wall" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 md:py-32">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="wall" className="font-display text-[2.25rem] leading-tight sm:text-display-m">
              Toronto businesses in the loop
            </h2>
            <Link href="/partners" className="text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
              Full Partner Wall
            </Link>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <li key={p.slug}>
                <PartnerTile name={p.name} logoUrl={logoUrl(p.logo_path)} tier={p.tier as PartnerTier} reused={Number(p.devices_reused)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* 6 · Honest note */}
      <section className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6">
        <p className="glass rounded-[var(--r-lg)] p-6 text-ink-2 sm:p-8">
          <span className="font-semibold text-ink">Free Geek Toronto is an independent non-profit.</span> Free Geek locations in other cities run separately, so products and prices differ.
          Our computers aren&apos;t free because refurbishing, data security and fair wages cost money — <Link href="/about#pricing" className="font-semibold text-loop-deep underline underline-offset-4">here&apos;s exactly how pricing works</Link>.
        </p>
      </section>
    </main>
  );
}
