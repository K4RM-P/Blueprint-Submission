import type { Metadata } from "next";
import { ArrowRight, PackagePlus } from "lucide-react";
import { ClayButton, ClayCard, EmptyState, FlatCard, StatPebble } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { BatchCard } from "@/components/partner/batch-card";
import { getPartnerContext, listBatches } from "@/lib/queries/partner";
import { getPartnerImpact } from "@/lib/queries/impact";
import { labels, type RecipientCategory } from "@/lib/domain";
import { hasFullDashboard } from "@/lib/pricing";
import { DevicesAreaChart } from "@/components/charts/area";
import { BarsChart } from "@/components/charts/bars";
import { lastMonths, monthlySeries } from "@/lib/impact";

export const metadata: Metadata = { title: "Dashboard" };

export default async function PartnerDashboard() {
  const { supabase, org, profile } = await getPartnerContext();
  const [batches, impact] = await Promise.all([listBatches(supabase, org.id), getPartnerImpact(supabase)]);
  const t = impact.totals;
  const people = t.devicesReused;
  const recipients = (Object.entries(t.recipients) as [RecipientCategory, number][]).filter(([k]) => k !== "undisclosed").sort((a, b) => b[1] - a[1]);
  const full = hasFullDashboard(org.tier);
  const firstName = profile.display_first_name ?? "there";

  return (
    <>
      <PageHeader
        eyebrow={org.name}
        title={`Hi ${firstName}.`}
        description={t.devicesReceived > 0 ? `Your ${t.devicesReceived} donated devices are moving through the loop.` : "Send your first batch and watch its journey here."}
        actions={
          <ClayButton href="/partner/batches/new" variant="primary" icon={<PackagePlus />}>
            New batch
          </ClayButton>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <ClayCard tint="mint" size="lg" className="flex flex-col justify-between gap-6 md:col-span-2 md:row-span-2">
          <div>
            <p className="eyebrow !text-loop-deep">Impact so far</p>
            <p className="font-display mt-3 text-[2.25rem] leading-[1.05] sm:text-[3rem]">
              Your laptops are now helping <span className="tnum">{people}</span> {people === 1 ? "person" : "people"}.
            </p>
          </div>
          {recipients.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Who your devices help">
              {recipients.map(([k, n]) => (
                <li key={k} data-tint="porcelain" className="clay-sm rounded-full px-4 py-2 text-small">
                  <span className="font-semibold tnum">{n}</span> {labels.recipient[k].toLowerCase()}
                  {n === 1 ? "" : "s"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-2">When your first device is sold, you&apos;ll see who it helps here — students, newcomers, seniors — never names.</p>
          )}
        </ClayCard>
        <StatPebble label="Devices received" value={t.devicesReceived} />
        <StatPebble label="Devices reused" value={t.devicesReused} />
        <StatPebble label="Recycled responsibly" value={t.devicesRecycled} />
        <StatPebble label="kg kept out of landfill" value={t.kgDiverted} decimals={1} suffix="kg" />
      </div>

      {full ? (
        <section aria-labelledby="esg" className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flat p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="esg" className="font-semibold">
                Devices over time
              </h2>
              <p className="text-small text-ink-2">
                <span className="font-semibold text-ink tnum">{t.co2eAvoidedKg.toLocaleString("en-CA")} kg</span> CO₂e avoided ·{" "}
                <span className="font-semibold text-ink tnum">{t.volunteerHours}</span> volunteer hours supported
              </p>
            </div>
            <div className="mt-4">
              <DevicesAreaChart
                label="Devices received and reused per month"
                data={monthlySeries(
                  impact.devices.map((d) => ({ receivedAt: d.received_at ?? d.created_at, soldAt: d.sold_at })),
                  lastMonths(new Date(), 6),
                )}
              />
            </div>
          </div>
          <div className="flat p-6">
            <h2 className="font-semibold">Reused vs. recycled</h2>
            <div className="mt-4">
              <BarsChart
                label="Device outcomes"
                height={200}
                data={[
                  { label: "Reused", value: t.devicesReused },
                  { label: "Recycled", value: t.devicesRecycled, highlight: false },
                  { label: "In progress", value: t.devicesInProgress, highlight: false },
                ]}
              />
            </div>
            <p className="mt-3 text-[0.8125rem] text-ink-3">
              Impact factors are placeholders marked TO VERIFY. See the{" "}
              <a href="/impact#methodology" className="underline">
                methodology
              </a>
              .
            </p>
          </div>
        </section>
      ) : null}

      {!full ? (
        <ClayCard tint="apricot" className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title font-semibold">See the full picture with Impact Partner</h2>
            <p className="mt-1 text-ink-2">Live ESG dashboard, a branded annual report and a LinkedIn card to share — $500 a year. Your batches stay free either way.</p>
          </div>
          <ClayButton href="/partner/membership" variant="secondary" iconRight={<ArrowRight />}>
            Compare memberships
          </ClayButton>
        </ClayCard>
      ) : null}

      <section className="mt-12" aria-labelledby="recent">
        <div className="flex items-end justify-between gap-4">
          <h2 id="recent" className="text-title font-semibold">
            Recent batches
          </h2>
          {batches.length > 3 ? (
            <ClayButton href="/partner/batches" variant="ghost" size="sm">
              All {batches.length} batches
            </ClayButton>
          ) : null}
        </div>
        {batches.length === 0 ? (
          <FlatCard className="mt-4">
            <EmptyState title="No batches yet." tone="apricot" action={<ClayButton href="/partner/batches/new" variant="secondary" size="sm">Start your first batch</ClayButton>}>
              Your first 5 laptops could reach a classroom next month.
            </EmptyState>
          </FlatCard>
        ) : (
          <ul className="mt-4 flex flex-col gap-5">
            {batches.slice(0, 3).map((b) => (
              <li key={b.id}>
                <BatchCard batch={b} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
