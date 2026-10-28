import type { Metadata } from "next";
import { StatPebble } from "@/components/clay";
import { createPublicClient } from "@/lib/supabase/public";
import { getPublicImpact } from "@/lib/queries/impact";
import { getSettings } from "@/lib/queries/common";
import { labels, recipientNoun, type RecipientCategory } from "@/lib/domain";
import { longDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Impact & methodology", description: "Live impact numbers from Free Geek Toronto, and exactly how they're calculated." };

/** DP-09 + CI-04: aggregate stats and the methodology with citations. */
// Public numbers only: cached and refreshed every minute (ISR), so visitors never wait on the database.
export const revalidate = 60;

export default async function ImpactPage() {
  const supabase = createPublicClient();
  const [impact, settings] = await Promise.all([getPublicImpact(supabase), getSettings(supabase)]);
  const t = impact.totals;
  const recipients = (Object.entries(t.recipients) as [RecipientCategory, number][]).filter(([k]) => k !== "undisclosed").sort((a, b) => b[1] - a[1]);
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:py-24">
      <p className="eyebrow">Impact</p>
      <h1 className="font-display mt-3 max-w-3xl text-[2.75rem] leading-[0.98] sm:text-display-l">Counted numbers, honest math.</h1>
      <p className="measure mt-5 text-body-l text-ink-2">These update live from every handoff recorded in Relay (fictional demo data in this demo). Every formula and factor is below.</p>

      <div className="mt-12 grid gap-5 md:grid-cols-4">
        <StatPebble className="md:col-span-2 md:row-span-2" size="lg" tint="mint" label="Devices back in use" value={t.devicesReused} caption={`${t.devicesReceived} received · ${t.devicesRecycled} recycled responsibly`} />
        <StatPebble label="kg kept out of landfill" value={t.kgDiverted} suffix="kg" />
        <StatPebble label="kg CO₂e avoided (est.)" value={t.co2eAvoidedKg} />
        <StatPebble label="Volunteer hours" value={t.volunteerHours} />
        <StatPebble label="Passport views" value={impact.passportViews} />
      </div>

      {recipients.length ? (
        <section aria-labelledby="who" className="mt-16">
          <h2 id="who" className="text-title font-semibold">
            Who the devices reached
          </h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {recipients.map(([k, n]) => (
              <li key={k} className="glass rounded-full px-4 py-2">
                <span className="font-semibold tnum">{n}</span> {recipientNoun(k, n)}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-small text-ink-3">Categories only — Relay never records who bought a device.</p>
        </section>
      ) : null}

      <section id="methodology" aria-labelledby="m" className="mt-20 scroll-mt-28">
        <h2 id="m" className="font-display text-[2.25rem] leading-tight">
          Methodology
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="flat p-6 text-ink-2">
            <ul className="flex flex-col gap-4">
              <li>
                <span className="font-semibold text-ink">kg diverted</span> = the weight of every device reused or responsibly recycled (measured weight, or the category average below).
              </li>
              <li>
                <span className="font-semibold text-ink">CO₂e avoided</span> = the per-category factor below, for <em>reused</em> devices only — reuse avoids manufacturing a new one.
              </li>
              <li>
                <span className="font-semibold text-ink">Volunteer hours</span> = refurbished devices × {settings.refurbMinutes.uniform} minutes (uniform batches) or {settings.refurbMinutes.mixed} minutes (mixed
                donations).
              </li>
              <li>
                <span className="font-semibold text-ink">Reused</span> means sold to a new owner. Devices still being refurbished aren&apos;t counted yet.
              </li>
            </ul>
          </div>
          {/* focusable so keyboard users can scroll it on a phone (axe scrollable-region-focusable) */}
          <div className="flat overflow-x-auto !p-0" tabIndex={0} role="region" aria-label="Impact factors table (scrolls sideways on small screens)">
            <table className="data-table min-w-[560px]">
              <caption className="px-5 pt-4 text-left text-small text-ink-2">Impact factors — placeholders marked TO VERIFY must be replaced with cited sources.</caption>
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col" className="text-right">Avg. kg</th>
                  <th scope="col" className="text-right">kg CO₂e / reuse</th>
                  <th scope="col">Source</th>
                </tr>
              </thead>
              <tbody>
                {impact.factors.map((f) => (
                  <tr key={f.category}>
                    <td className="font-medium">{labels.category[f.category]}</td>
                    <td className="text-right">{f.avgWeightKg}</td>
                    <td className="text-right">{f.co2eAvoidedKgPerReuse}</td>
                    <td>
                      {f.sourceUrl ? (
                        <a href={f.sourceUrl} className="underline" rel="noreferrer" target="_blank">
                          {f.sourceTitle}
                        </a>
                      ) : (
                        <span className={f.sourceTitle === "TO VERIFY" ? "chip bg-butter text-[#6b4e00]" : undefined}>{f.sourceTitle}</span>
                      )}
                      {f.lastReviewed ? <span className="block text-[0.75rem] text-ink-3">Reviewed {longDate(f.lastReviewed)}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
