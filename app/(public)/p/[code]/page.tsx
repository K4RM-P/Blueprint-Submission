import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, HandCoins, HardDrive, Leaf, Package, Recycle, ShieldCheck, Terminal, Wrench } from "lucide-react";
import { ClayButton, ClayCard, IconTile, StatPebble } from "@/components/clay";
import { LiquidBlob } from "@/components/liquid";
import { ClayLaptop } from "@/components/illustrations/clay-laptop";
import { JourneyTimeline } from "@/components/journey/journey-timeline";
import { MoneyBar } from "@/components/public/money-bar";
import { getPassport } from "@/lib/queries/passport";
import { deviceImpact } from "@/lib/impact";
import { longDate } from "@/lib/dates";
import { labels } from "@/lib/domain";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const p = await getPassport((await params).code);
  if (!p) return { title: "Passport not found", robots: { index: false } };
  return {
    title: `${p.make} ${p.model} · Device Passport`,
    description: `A refurbished ${p.make} ${p.model} from Free Geek Toronto — donated, data wiped and verified, refurbished by volunteers.`,
    openGraph: { title: `${p.make} ${p.model} — its second life`, type: "article" },
  };
}

/** DP-02…DP-06, DP-11, PIF-06: the device's public story. Mobile-first; prints flat. */
export default async function PassportPage({ params }: { params: Promise<{ code: string }> }) {
  const p = await getPassport((await params).code);
  if (!p) notFound();

  const donor = p.donor.type === "household" ? "a community member" : (p.donor.name ?? "a Toronto business");
  const volunteer = p.volunteer_first_name ?? "an FGT volunteer";
  const impact = deviceImpact({ category: p.category, outcome: "reused", uniform: p.uniform, refurbished: true, weightKg: p.weight_kg }, p.factor ? [{ category: p.factor.category, avgWeightKg: Number(p.factor.avg_weight_kg), co2eAvoidedKgPerReuse: Number(p.factor.co2e_avoided_kg_per_reuse) }] : []);
  const specs = [p.approx_year ? String(p.approx_year) : null, p.cpu, p.ram_gb ? `${p.ram_gb} GB RAM` : null, p.storage_gb ? `${p.storage_gb} GB storage` : null, labels.category[p.category]].filter(Boolean) as string[];
  const ready = Boolean(p.timeline.ready_at) || ["ready", "listed", "sold"].includes(p.status);

  const steps = [
    { key: "donated", label: `Donated by ${donor}`, date: longDate(p.timeline.donated_at), done: true, icon: <Package />, tint: "apricot" as const },
    { key: "wiped", label: "Data wiped & verified", date: p.timeline.wipe_verified_at ? longDate(p.timeline.wipe_verified_at) : null, done: Boolean(p.timeline.wipe_verified_at), icon: <ShieldCheck />, tint: "sky" as const, current: !p.timeline.wipe_verified_at },
    { key: "refurb", label: `Refurbished by ${volunteer}`, date: p.timeline.refurbished_at ? longDate(p.timeline.refurbished_at) : null, done: Boolean(p.timeline.refurbished_at) && Boolean(p.timeline.wipe_verified_at), icon: <Wrench />, tint: "butter" as const },
    {
      key: "ready",
      label: p.timeline.in_new_home ? "In its new home" : p.status === "recycled" ? "Recycled responsibly" : "Ready for its next owner",
      date: p.timeline.ready_at ? longDate(p.timeline.ready_at) : null,
      done: ready || p.status === "recycled",
      icon: p.status === "recycled" ? <Recycle /> : <CheckCircle2 />,
      tint: "mint" as const,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[880px] px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      {/* 1 · Passport cover */}
      <section className="relative" aria-labelledby="device-name">
        <LiquidBlob className="-right-24 -top-10 size-[380px]" tone="apricot" />
        <LiquidBlob className="-left-24 top-40 size-[300px]" tone="mint" duration={24} />
        <div data-tint="apricot" className="clay relative overflow-hidden !rounded-[var(--r-xl)] bg-gradient-to-br from-[#FFE0CB] via-[#FCEEE3] to-[#FBF9F5] p-6 sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-small tracking-[0.12em] text-ink-2">DEVICE PASSPORT</p>
              <p className="mt-1 font-mono text-lg tracking-wider text-ink">{p.code}</p>
            </div>
            <span className="chip bg-white/75 text-loop-deep">{p.status === "sold" ? "In a new home" : p.status === "recycled" ? "Recycled" : ready ? "Ready" : "Being refurbished"}</span>
          </div>
          <div className="mt-8 grid items-end gap-6 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <h1 id="device-name" className="font-display text-[2.75rem] leading-[0.98] sm:text-display-l">
                {p.make} {p.model}
              </h1>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Specs">
                {specs.map((s) => (
                  <li key={s} className="glass rounded-full px-3 py-1.5 text-small">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <ClayLaptop className="mx-auto max-w-[240px]" tint="porcelain" />
          </div>
          <p className="mt-6 border-t border-white/70 pt-4 text-small text-ink-2">
            Refurbished by <span className="font-semibold text-ink">Free Geek Toronto</span>, an independent non-profit.
          </p>
        </div>
      </section>

      {p.pif_subsidized ? (
        <p className="glass mt-6 flex items-center gap-3 rounded-[20px] p-4">
          <HandCoins className="size-5 shrink-0 text-ember-ink" aria-hidden />
          <span>
            This device was made more affordable by the <Link href="/pay-it-forward" className="font-semibold underline underline-offset-4">Pay-It-Forward fund</Link>.
          </span>
        </p>
      ) : null}

      {/* 2 · Its second life — stamps */}
      <section aria-labelledby="journey" className="mt-14">
        <h2 id="journey" className="font-display text-[2rem] leading-tight">
          Its second life
        </h2>
        <div className="flat mt-6 p-6 sm:p-8">
          <JourneyTimeline steps={steps} label="Device journey" />
        </div>
      </section>

      {/* 3 · Impact pebbles */}
      <section aria-labelledby="impact" className="mt-14">
        <h2 id="impact" className="font-display text-[2rem] leading-tight">
          What reusing it saves
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatPebble tint="mint" label="kept out of landfill" value={impact.kg} decimals={1} suffix="kg" />
          <StatPebble label="CO₂e avoided (est.)" value={impact.co2eKg} suffix="kg" />
          <div data-tint="butter" className="clay-glass hairline-top flex flex-col justify-between gap-3 p-6">
            <p className="eyebrow !text-ink-2">Software</p>
            <p className="flex items-center gap-2 text-lg font-semibold">
              <Terminal className="size-5 text-loop-deep" aria-hidden />
              {p.os_installed ? `Running ${p.is_open_source_os ? "open-source " : ""}${p.os_installed}` : "OS installed at refurbishment"}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[0.8125rem] text-ink-3">
          Estimates use placeholder factors {p.factor?.source_title === "TO VERIFY" ? "(TO VERIFY)" : `from ${p.factor?.source_title}`}. <Link href="/impact#methodology" className="underline">Methodology</Link>
        </p>
      </section>

      {/* 4 · Where your money goes */}
      <section aria-labelledby="money" className="mt-14">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="money" className="font-display text-[2rem] leading-tight">
            Where your money goes
          </h2>
          {!p.price_breakdown_confirmed ? <span className="chip bg-butter text-[#6b4e00]">Illustrative — to be confirmed by Free Geek Toronto</span> : null}
        </div>
        <div className="flat mt-6 p-6 sm:p-8">
          <MoneyBar slices={p.price_breakdown} />
        </div>
      </section>

      {/* 5 · Why isn't it free */}
      <section aria-labelledby="free" className="mt-14 grid gap-6 sm:grid-cols-[1fr_1.3fr]">
        <h2 id="free" className="font-display text-[2rem] leading-tight">
          Why isn&apos;t it free?
        </h2>
        <div className="flat p-6 text-ink-2">
          <p>
            Getting a computer ready for you takes real work: testing every part, wiping and verifying the drive so no one&apos;s data travels with it, and installing fresh software. Free
            Geek Toronto pays fair wages and trains people facing barriers to work, and keeps the lights on in its workshop.
          </p>
          <p className="mt-3">Prices stay as low as possible and are tied to ability to pay — and the Pay-It-Forward fund lowers them further for students, newcomers and families who need it.</p>
        </div>
      </section>

      {/* 6 · Network note */}
      <ClayCard tint="sky" className="mt-14 flex items-start gap-4">
        <IconTile tint="sky">
          <HardDrive />
        </IconTile>
        <p>
          Refurbished by <span className="font-semibold">Free Geek Toronto</span>, an independent non-profit. Free Geek locations operate independently — products, prices and services vary by
          city.
        </p>
      </ClayCard>

      {/* 7 · CTAs */}
      <div className="no-print mt-12 flex flex-wrap gap-4">
        <ClayButton href="/pay-it-forward" variant="primary" icon={<HandCoins />}>
          Pay it forward
        </ClayButton>
        <ClayButton href="/donate" variant="secondary" icon={<Leaf />}>
          Donate your old laptop
        </ClayButton>
      </div>
    </main>
  );
}
