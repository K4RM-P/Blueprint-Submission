import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, HandCoins, HeartHandshake, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import { ClayButton } from "@/components/clay";
import { PassportLookup } from "@/components/public/passport-lookup";
import { FeaturedPassport } from "@/components/public/featured-passport";
import { PartnerTile } from "@/components/public/partner-tile";
import { BatonRun } from "@/components/public/baton-run";
import { CountUp } from "@/components/landing/count-up";
import { Hero } from "@/components/landing/hero";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { Pour } from "@/components/landing/pour";
import { Reveal } from "@/components/landing/reveal";
import { Rule, SectionHead } from "@/components/landing/section-head";
import { OutcomeBreakdown } from "@/components/landing/outcome-breakdown";
import { CertificatePreview } from "@/components/landing/certificate-preview";
import { StickyCta } from "@/components/landing/sticky-cta";
import { Tactile } from "@/components/landing/tactile";
import { createPublicClient } from "@/lib/supabase/public";
import { env } from "@/lib/env";
import { getPublicImpact } from "@/lib/queries/impact";
import { logoUrl } from "@/lib/queries/common";
import type { PartnerTier } from "@/lib/domain";
import { SHOWCASE_PASSPORTS } from "@/lib/showcase-passports";

export const metadata: Metadata = {
  title: { absolute: "Relay · Pass it on." },
  description:
    "Toronto businesses: retire your laptops with Free Geek Toronto for free. Every drive gets a certified data wipe, and each laptop's Device Passport shows who it helps.",
};

const fmt = (n: number) => n.toLocaleString("en-CA");

/** Why a business picks Relay over a trade-in, a reseller or paid IT disposal. */
const REASONS = [
  { icon: <HandCoins />, title: "Free.", body: "No disposal fee and no contract. The Community tier costs nothing, for good." },
  { icon: <ShieldCheck />, title: "Certified data wipe.", body: "Staff verify every wipe. You get a numbered certificate with a public verification link." },
  { icon: <CalendarCheck />, title: "Zero hassle.", body: "One two-minute form. Pick a week the bench has room for, then drop off at 180 Sudbury Street." },
  { icon: <MapPin />, title: "A real local story.", body: "Each laptop's Device Passport and your impact dashboard show who it helps in Toronto." },
];

/** The supply problem in three numbers, all from the case packet. */
const WHY = [
  { value: "0", label: "corporate partners or sponsors today" },
  { value: "77%", label: "of Free Geek Toronto's 2025 revenue came from sales" },
  { value: "63%", label: "of Canadians bought refurbished, open-box or traded-in tech last year" },
];

// Public numbers only: cached and refreshed every minute (ISR), so visitors never wait on the database.
export const revalidate = 60;

export default async function Landing() {
  const supabase = createPublicClient();
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

      {/* 1 · Hero: the Reuse Partner promise, aimed at the business retiring laptops */}
      <Hero
        devicesReused={t.devicesReused}
        backdrop={
          <>
            <FloatingPathsBackground position={1} className="absolute inset-0" />
            <FloatingPathsBackground position={-1} className="absolute inset-0" />
          </>
        }
        shot={<DashboardPreview />}
      />

      {/* Reuse Partner strip directly under the hero: who's already running */}
      {ranked.length ? (
        <section aria-label="Reuse Partners in the relay" className="mt-16 md:mt-24">
          <Rule />
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-[auto_repeat(6,minmax(0,1fr))]">
            <p className="col-span-2 flex items-center px-4 py-5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3 sm:col-span-3 sm:px-6 lg:col-span-1 lg:pr-8">{env.demoMode ? "Demo Reuse Partners" : "Reuse Partners"}</p>
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

      {/* 1b · Why Relay exists: the supply problem, in the case's own numbers */}
      <section aria-labelledby="why-title" className="mx-auto max-w-[1200px] px-4 pb-8 pt-16 sm:px-6 md:pb-12 md:pt-24">
        <Reveal>
          <SectionHead
            id="why-title"
            label="Why Relay exists"
            title="Good business laptops rarely reach Free Geek Toronto."
            muted="Relay changes that."
            aside={
              <p className="text-ink-2">
                Trade-in and buyback programs catch most of them first. Free Geek Toronto has no corporate partners yet, and selling refurbished computers is most of how it pays for
                its mission. A steady supply of uniform business laptops is the one change that helps most: they are the fastest to refurbish and the easiest to sell, without raising
                prices.
              </p>
            }
          />
        </Reveal>
        <Reveal>
          <ul className="mt-12 grid grid-cols-1 border-y border-line sm:grid-cols-3">
            {WHY.map((w, i) => (
              <li key={w.label} className={i ? "border-line py-6 max-sm:border-t sm:border-l sm:pl-6" : "py-6 sm:pr-6"}>
                <p className="font-display text-[2.75rem] font-semibold leading-none tracking-[-0.05em] tnum">{w.value}</p>
                <p className="mt-2 text-small text-ink-2">{w.label}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.8125rem] text-ink-3">Source: Free Geek Toronto case, FUSE Blueprint 2026 (Best Buy Canada / Angus Reid 2026 survey for the 63%).</p>
        </Reveal>
      </section>

      {/* 2 · The relay (pinned, scroll-linked): business → certified wipe → bench → passport → impact back */}
      <BatonRun
        stations={[
          { hand: "A Toronto business", title: "Handed over", body: "An office retires its laptops, drives left in. One short form, one drop-off week.", stat: fmt(t.devicesReceived), statLabel: "devices received" },
          { hand: "Free Geek staff", title: "Certified data wipe", body: "Every drive is wiped, then a staff member verifies the report.", stat: fmt(impact.stages.verified), statLabel: "wipes verified" },
          { hand: "A volunteer", title: "Rebuilt on the bench", body: "Tested, refurbished and set up with open-source software.", stat: fmt(impact.stages.refurbished), statLabel: "refurbished" },
          { hand: "Its QR label", title: "Device Passport", body: "Scan the sticker: who gave it, when it was wiped, who rebuilt it.", stat: fmt(impact.passportViews), statLabel: "passport views" },
          { hand: "Back to the business", title: "Impact, reported back", body: "Sold at prices tied to ability to pay. The business sees who it helps.", stat: fmt(t.devicesReused), statLabel: "in new homes" },
        ]}
      />

      {/* 3 · Device Passport showcase: the one dark moment on the page */}
      <section id="passport" aria-labelledby="passport-title" className="scroll-mt-28 px-4 pt-8 sm:px-6 md:pt-12">
        <Reveal className="mx-auto max-w-[1200px]">
          <div className="ink-panel relative isolate grid grid-cols-[minmax(0,1fr)] items-center gap-10 overflow-hidden rounded-[var(--r-xl)] p-6 text-white sm:p-10 md:grid-cols-12 md:p-16">
            <span aria-hidden className="ink-panel-grid absolute inset-0 -z-10" />
            <div className="md:col-span-6">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-white/60">Device Passport</p>
              <h2 id="passport-title" className="font-display mt-4 text-[2.25rem] leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                Every laptop carries its story. <span className="text-white/55">Scan it.</span>
              </h2>
              <p className="mt-4 max-w-md text-white/75">
                Each refurbished laptop gets a QR label. Its Device Passport shows the business that donated it, its certified data wipe, the volunteer who rebuilt it and who it helps now.
              </p>
              <p className="mt-8 text-small font-semibold text-white/85">Have a code? Enter it.</p>
              <PassportLookup className="mt-3" tone="dark" />
              <p className="mt-6 text-small text-white/60">
                More stories:{" "}
                {SHOWCASE_PASSPORTS.slice(1).map((sp, i) => (
                  <span key={sp.code}>
                    {i ? " · " : ""}
                    <Link href={`/p/${sp.code}`} className="font-medium text-white/85 underline decoration-white/30 underline-offset-4 hover:decoration-white">
                      {sp.label}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
            <div className="md:col-span-6 md:pl-4">
              <FeaturedPassport />
            </div>
          </div>
        </Reveal>
      </section>

      {/* 4 · What partners get: why a business picks this over trade-in or recycling */}
      <section id="partners" aria-labelledby="partners-title" className="mx-auto max-w-[1200px] px-4 py-28 sm:px-6 md:py-36">
        <Reveal>
          <SectionHead
            id="partners-title"
            label="For businesses"
            title="Free, certified, local."
            muted="Better than a trade-in."
            aside={<p className="text-ink-2">A trade-in, a reseller or paid IT disposal takes your laptops and the story ends. With Relay it keeps going, here in Toronto, and you can see it.</p>}
          />
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <ul className="border-t border-line">
              {REASONS.map((r) => (
                <li key={r.title} className="flex gap-4 border-b border-line py-6">
                  <span aria-hidden className="mt-0.5 text-loop-deep [&_svg]:size-6 [&_svg]:stroke-[1.75]">
                    {r.icon}
                  </span>
                  <div>
                    <h3 className="text-title font-semibold tracking-[-0.02em]">{r.title}</h3>
                    <p className="mt-1 text-ink-2">{r.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-6">
            <Tactile className="card-line relative flex h-full min-h-[460px] flex-col overflow-hidden rounded-[var(--r-lg)] p-7 pb-[19rem] sm:p-10 sm:pb-64">
              <span aria-hidden className="card-grid absolute inset-x-0 bottom-0 h-[55%]" />
              <p className="relative font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ember-ink">What every Reuse Partner gets</p>
              <h3 className="font-display relative mt-4 max-w-md text-[2rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[2.5rem]">A certificate for every batch. A dashboard of who it helps.</h3>
              <ul className="relative mt-5 flex flex-col gap-2 text-ink-2">
                <li className="flex gap-2.5">
                  <BadgeCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-loop-deep" /> Numbered certificate of data sanitization, listing every device
                </li>
                <li className="flex gap-2.5">
                  <PackageCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-loop-deep" /> Every device tracked from drop-off to its next owner
                </li>
                <li className="flex gap-2.5">
                  <HeartHandshake aria-hidden className="mt-0.5 size-5 shrink-0 text-loop-deep" /> An impact dashboard and a Device Passport for each laptop
                </li>
              </ul>
              <ClayButton href="/become-a-partner" variant="secondary" iconRight={<ArrowRight />} className="relative z-[1] mt-8 self-start">
                See how the Reuse Partnership works
              </ClayButton>
              <CertificatePreview className="pointer-events-none absolute -bottom-24 right-1/2 translate-x-1/2 rotate-[-3deg] sm:right-10 sm:translate-x-0" />
            </Tactile>
          </Reveal>
        </div>
      </section>

      {/* Partner Wall preview: the furthest-run partner leads */}
      {partners.length ? (
        <section aria-labelledby="wall" className="mx-auto max-w-[1200px] px-4 pb-28 sm:px-6 md:pb-36">
          <Reveal>
            <SectionHead
              id="wall"
              label="Partner Wall"
              title="Toronto businesses"
              muted="already in the relay."
              aside={
                <div className="flex flex-col items-start gap-2">
                  {env.demoMode ? <p className="text-small text-ink-2">Fictional demo partners, so you can see how the wall works.</p> : null}
                  <Link href="/partners" className="group inline-flex items-center gap-1.5 text-small font-semibold text-loop-deep">
                    Full Partner Wall <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
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

      {/* 5 · Live impact: a stat row on hairlines, then one liquid lane */}
      <section aria-labelledby="impact-title" className="mx-auto max-w-[1200px] px-4 py-28 sm:px-6 md:py-36">
        <Reveal>
          <SectionHead
            id="impact-title"
            label="Live impact"
            title="What the relay"
            muted="has moved so far."
            aside={
              <Link href="/impact#methodology" className="group inline-flex flex-wrap items-center gap-1.5 text-small font-semibold text-loop-deep">
                <span className="w-full font-normal text-ink-2">Counted from every recorded handoff (fictional demo data here).</span> How we calculate this <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
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

      {/* 6 · Volunteers: the people who make the extra volume possible */}
      <section aria-labelledby="volunteers" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 md:py-32">
        <Reveal className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">The people who make it possible</p>
            <h2 id="volunteers" className="font-display mt-4 text-[2.25rem] font-semibold leading-[1] tracking-[-0.05em] sm:text-[3rem]">
              Volunteers rebuild every laptop. <span className="text-ink-3">Their work is on its passport.</span>
            </h2>
            <p className="mt-5 max-w-xl text-ink-2">
              Free Geek Toronto volunteers test, wipe and refurbish each partner laptop. Their Skills Wallet turns that bench time into real IT experience employers can check.
            </p>
            <Link href="/about#volunteer" className="mt-6 inline-flex items-center gap-1.5 text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
              How volunteering works <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
          <div className="md:col-span-5 md:border-l md:border-line md:pl-8">
            <p className="font-display text-[3.5rem] font-semibold leading-none tracking-[-0.05em]">
              <CountUp value={t.volunteerHours} />
            </p>
            <p className="mt-2 text-ink-2">bench hours logged by volunteers</p>
          </div>
        </Reveal>
      </section>

      {/* 7 · More ways to help: the quieter, also-included features */}
      <section aria-labelledby="more" className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6 md:pb-32">
        <Reveal>
          <h2 id="more" className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
            More ways to help
          </h2>
          <ul className="mt-5 grid border-t border-line sm:grid-cols-3">
            {[
              { href: "/pay-it-forward", title: "Pay it forward", body: "Chip in so a student or newcomer pays less for their computer." },
              { href: "/donate", title: "Can I donate this?", body: "One laptop at home? Check in a minute whether Free Geek Toronto can take it." },
              { href: "/about#pricing", title: "Buying a computer?", body: "Why refurbished computers aren't free, and how prices stay fair." },
            ].map((m, i) => (
              <li key={m.href} className={i ? "border-line max-sm:border-t sm:border-l" : undefined}>
                <Link href={m.href} className={`group flex h-full flex-col gap-1.5 py-6 ${i ? "sm:px-6" : "sm:pr-6"}`}>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    {m.title} <ArrowRight aria-hidden className="size-4 text-loop-deep transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="text-small text-ink-2">{m.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <Rule />

      {/* 8 · Closing: one big line, one decision */}
      <section id="closing" aria-labelledby="closing-title" className="relative isolate overflow-hidden px-4 py-28 text-center sm:px-6 md:py-40">
        <span aria-hidden className="closing-glow absolute inset-x-0 bottom-0 -z-10 h-[70%]" />
        <Reveal className="mx-auto max-w-[900px]">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-3">Your move</p>
          <h2 id="closing-title" className="font-display mt-5 text-[clamp(2.75rem,8vw,6rem)] font-bold leading-[0.95] tracking-[-0.055em]">
            Your old laptops <span className="text-ink-3">have a next owner.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-body-l text-ink-2">Free for your business. A certified data wipe for every drive, and a Device Passport for every laptop.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 min-[420px]:flex-row">
            <ClayButton href="/login?mode=signup" variant="primary" size="lg" iconRight={<ArrowRight />}>
              Create a free partner account
            </ClayButton>
            <ClayButton href="#passport" variant="secondary" size="lg">
              See a Device Passport
            </ClayButton>
          </div>
        </Reveal>
      </section>

      <Rule />

      {/* 9 · Honest note */}
      <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 md:py-28">
        <Reveal className="grid gap-4 md:grid-cols-12">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3 md:col-span-3 md:pt-2">Good to know</p>
          <p className="text-body-l text-ink-2 md:col-span-8">
            <span className="font-semibold text-ink">Free Geek Toronto is an independent non-profit.</span> Free Geek locations in other cities run separately, so products and prices differ. Relay
            introduces the Reuse Partnership as a new way for businesses to work with Free Geek Toronto. Our computers aren&apos;t free because refurbishing, data security and fair wages cost
            money.{" "}
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
