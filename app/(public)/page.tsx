import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClayButton } from "@/components/clay";
import { PassportLookup } from "@/components/public/passport-lookup";
import { PartnerTile } from "@/components/public/partner-tile";
import { BatonRun } from "@/components/public/baton-run";
import { CountUp } from "@/components/landing/count-up";
import { Hero } from "@/components/landing/hero";
import { Pour } from "@/components/landing/pour";
import { Reveal } from "@/components/landing/reveal";
import { Rule, SectionHead } from "@/components/landing/section-head";
import { OutcomeBreakdown } from "@/components/landing/outcome-breakdown";
import { CertificatePreview } from "@/components/landing/certificate-preview";
import { StickyCta } from "@/components/landing/sticky-cta";
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
  // Lead with partners whose devices are already back in use; newcomers fill the rest.
  const ranked = [...(wall ?? [])].sort((a, b) => Number(b.devices_reused) - Number(a.devices_reused));
  // Five fills the featured 1 + 2×2 wall layout.
  const partners = ranked.slice(0, 5);

  const impactRow = [
    { value: t.kgDiverted, suffix: "kg", label: "of e-waste kept out of landfill" },
    { value: t.co2eAvoidedKg, suffix: "kg", label: "CO₂e avoided (est.)" },
    { value: t.volunteerHours, label: "volunteer hours on the bench" },
    { value: impact.activePartners, label: "Reuse Partners in the relay" },
  ];

  return (
    <main className="relative isolate">
      {/* Stripe-style guides framing the content column (decorative, desktop) */}
      <div aria-hidden className="page-guides -z-10 hidden lg:block" />

      {/* 1 · Hero: "Pass it on." */}
      <Hero
        devicesReused={t.devicesReused}
        totals={{ received: t.devicesReceived, verified: impact.stages.verified, reused: t.devicesReused, kgDiverted: t.kgDiverted }}
      />

      {/* Partner strip directly under the hero: who's already running */}
      {ranked.length ? (
        <section aria-label="Businesses in the relay" className="mt-16 md:mt-24">
          <Rule />
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-[auto_repeat(6,minmax(0,1fr))]">
            <p className="col-span-2 flex items-center px-4 py-5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3 sm:col-span-3 sm:px-6 lg:col-span-1 lg:pr-8">In the relay</p>
            {ranked.slice(0, 6).map((p) => (
              <p key={p.slug} className="flex min-h-[72px] items-center border-line/70 px-4 py-4 font-display text-[1.0625rem] leading-tight tracking-[-0.02em] text-ink-2 max-lg:border-t sm:px-6 lg:border-l lg:px-5">
                {p.name}
              </p>
            ))}
          </div>
          <Rule />
        </section>
      ) : null}

      <Pour className="mt-10" />

      {/* 2 · The Baton Run (pinned, scroll-linked) */}
      <BatonRun
        stations={[
          { hand: "A Toronto business", title: "Handed over", body: "Retired laptops arrive with drives intact. No shredding, no drawer.", stat: fmt(t.devicesReceived), statLabel: "devices received" },
          { hand: "Free Geek staff", title: "Wiped & verified", body: "Every drive is wiped, then a staff member checks the report.", stat: fmt(impact.stages.verified), statLabel: "wipes verified" },
          { hand: "A volunteer", title: "Rebuilt on the bench", body: "Tested, refurbished and set up with open-source software.", stat: fmt(impact.stages.refurbished), statLabel: "refurbished" },
          { hand: "Its next owner", title: "In someone's hands", body: "Sold at prices tied to ability to pay, to people who need one.", stat: fmt(t.devicesReused), statLabel: "people reached" },
        ]}
      />

      <Rule />

      {/* 3 · Live impact: a stat row on hairlines, then one liquid lane */}
      <section aria-labelledby="impact-title" className="mx-auto max-w-[1200px] px-4 py-28 sm:px-6 md:py-36">
        <Reveal>
          <SectionHead
            id="impact-title"
            label="Live impact"
            title="What the relay"
            muted="has moved so far."
            aside={
              <Link href="/impact#methodology" className="group inline-flex flex-wrap items-center gap-1.5 text-small font-semibold text-loop-deep">
                <span className="w-full font-normal text-ink-2">Counted from every recorded handoff.</span> How we calculate this <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
        </Reveal>
        <dl className="mt-16 grid grid-cols-2 gap-y-10 md:grid-cols-4">
          {impactRow.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className={i % 2 ? "border-l border-line pl-5 md:pl-6" : i ? "md:border-l md:border-line md:pl-6" : undefined}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <p className="font-display text-[3rem] font-semibold leading-none tracking-[-0.055em] sm:text-[4.5rem]">
                  <CountUp value={s.value} />
                  {s.suffix ? <span className="ml-1 font-sans text-[0.35em] font-medium tracking-normal text-ink-3">{s.suffix}</span> : null}
                </p>
                <p aria-hidden className="mt-3 max-w-[14rem] text-small text-ink-2">
                  {s.label}
                </p>
              </dd>
            </Reveal>
          ))}
        </dl>
        <Reveal delay={0.1} className="mt-14">
          <OutcomeBreakdown reused={t.devicesReused} inProgress={t.devicesInProgress} recycled={t.devicesRecycled} />
        </Reveal>
      </section>

      <Rule />

      {/* 4 · Three ways in, deliberately different sizes and weights */}
      <section aria-labelledby="who" className="mx-auto max-w-[1200px] px-4 py-28 sm:px-6 md:py-36">
        <Reveal>
          <SectionHead id="who" label="Who it helps" title="Everyone in the relay" muted="gets something back." />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-12">
          <Reveal className="md:col-span-7 md:row-span-2">
            <Tactile className="card-line relative flex h-full min-h-[460px] flex-col overflow-hidden rounded-[var(--r-lg)] p-7 pb-[19rem] sm:p-10 sm:pb-64">
              <span aria-hidden className="card-grid absolute inset-x-0 bottom-0 h-[55%]" />
              <p className="relative font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ember-ink">For businesses</p>
              <h3 className="font-display relative mt-4 max-w-md text-[2rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[2.75rem]">Your three-year-old laptops are someone&apos;s first computer.</h3>
              <p className="relative mt-4 max-w-[19rem] text-ink-2">Free to start. A data-wipe certificate for every batch, and a live dashboard of who your devices help.</p>
              <ClayButton href="/become-a-partner" variant="secondary" iconRight={<ArrowRight />} className="relative z-[1] mt-8 self-start">
                See how partnering works
              </ClayButton>
              <CertificatePreview className="pointer-events-none absolute -bottom-24 right-1/2 translate-x-1/2 rotate-[-3deg] sm:right-10 sm:translate-x-0" />
            </Tactile>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5">
            <Tactile className="card-line relative flex h-full flex-col gap-3 rounded-[var(--r-lg)] p-6 sm:p-7">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">For volunteers</p>
              <p className="font-display text-[3rem] font-semibold leading-none tracking-[-0.05em]">
                <CountUp value={t.volunteerHours} />
                <span className="ml-2 font-sans text-body font-medium tracking-normal text-ink-2">bench hours logged</span>
              </p>
              <p className="text-ink-2">Real IT experience on real machines, with a Skills Wallet that proves it.</p>
              <Link href="/about#volunteer" className="mt-auto text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
                How volunteering works
              </Link>
            </Tactile>
          </Reveal>
          <Reveal delay={0.18} className="md:col-span-5">
            <Tactile className="card-line relative flex h-full flex-col gap-3 rounded-[var(--r-lg)] p-6 sm:p-7">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-loop-deep">For buyers</p>
              <p className="text-title font-semibold tracking-[-0.02em]">Safe, tested computers at prices tied to what you can pay.</p>
              <p className="text-ink-2">Every one wiped, rebuilt and carrying a passport you can check.</p>
              <Link href="/about#pricing" className="mt-auto text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
                Why our computers aren&apos;t free
              </Link>
            </Tactile>
          </Reveal>
        </div>
      </section>

      {/* Passport lookup: the one dark moment on the page */}
      <section id="scan" aria-labelledby="scan-title" className="scroll-mt-28 px-4 sm:px-6">
        <Reveal className="mx-auto max-w-[1200px]">
          <div className="ink-panel relative isolate grid grid-cols-[minmax(0,1fr)] items-center gap-10 overflow-hidden rounded-[var(--r-xl)] p-7 text-white sm:p-10 md:grid-cols-12 md:p-16">
            <span aria-hidden className="ink-panel-grid absolute inset-0 -z-10" />
            <div className="md:col-span-6">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white/60">Device Passport</p>
              <h2 id="scan-title" className="font-display mt-4 text-[2.25rem] leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                Every refurbished computer <span className="text-white/55">carries its story.</span>
              </h2>
              <p className="mt-4 max-w-md text-white/75">Scan the QR sticker on the laptop or type its code. See who donated it, when its data was wiped, and what your money funds.</p>
            </div>
            <PassportLookup className="md:col-span-6 md:pl-6" tone="dark" />
          </div>
        </Reveal>
      </section>

      {/* 5 · Partner Wall preview: the furthest-run partner leads */}
      {partners.length ? (
        <section aria-labelledby="wall" className="mx-auto max-w-[1200px] px-4 py-28 sm:px-6 md:py-36">
          <Reveal>
            <SectionHead
              id="wall"
              label="Partner Wall"
              title="Toronto businesses"
              muted="already in the relay."
              aside={
                <Link href="/partners" className="group inline-flex items-center gap-1.5 text-small font-semibold text-loop-deep">
                  Full Partner Wall <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
          </Reveal>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <Rule />

      {/* 6 · Closing: one big line, one decision */}
      <section id="closing" aria-labelledby="closing-title" className="relative isolate overflow-hidden px-4 py-28 text-center sm:px-6 md:py-40">
        <span aria-hidden className="closing-glow absolute inset-x-0 bottom-0 -z-10 h-[70%]" />
        <Reveal className="mx-auto max-w-[900px]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">Your move</p>
          <h2 id="closing-title" className="font-display mt-5 text-[clamp(2.75rem,8vw,6rem)] font-bold leading-[0.95] tracking-[-0.055em]">
            Your old laptops <span className="text-ink-3">have a next owner.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-body-l text-ink-2">Book a pickup in minutes. Get a certificate for every wiped drive and a live dashboard of who your devices reach.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 min-[420px]:flex-row">
            <ClayButton href="/login?mode=signup" variant="primary" size="lg" iconRight={<ArrowRight />}>
              Become a Reuse Partner
            </ClayButton>
            <ClayButton href="/donate" variant="secondary" size="lg">
              Can I donate?
            </ClayButton>
          </div>
        </Reveal>
      </section>

      <Rule />

      {/* 7 · Honest note */}
      <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 md:py-28">
        <Reveal className="grid gap-4 md:grid-cols-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3 md:col-span-3 md:pt-2">Good to know</p>
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

      <StickyCta heroId="hero" endSelector="#closing" />
    </main>
  );
}
