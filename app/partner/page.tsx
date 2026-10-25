import type { Metadata } from "next";
import { ArrowRight, PackagePlus } from "lucide-react";
import { ClayButton, ClayCard, EmptyState, FlatCard, StatGroup } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { BatchCard } from "@/components/partner/batch-card";
import { PeoplePebbles } from "@/components/partner/people-pebbles";
import { getPartnerContext, listBatches } from "@/lib/queries/partner";
import { getPartnerImpact } from "@/lib/queries/impact";
import { recipientNoun, type RecipientCategory } from "@/lib/domain";
import { hasFullDashboard } from "@/lib/pricing";
import { DevicesAreaChart } from "@/components/charts/area";
import { lastMonths, monthlySeries } from "@/lib/impact";

export const metadata: Metadata = { title: "Dashboard" };

export default async function PartnerDashboard() {
  const { supabase, org, profile } = await getPartnerContext();
  const [batches, impact] = await Promise.all([listBatches(supabase, org.id), getPartnerImpact(supabase)]);
  const t = impact.totals;
  const people = t.devicesReused;
  const recipients = (Object.entries(t.recipients) as [RecipientCategory, number][]).filter(([k]) => k !== "undisclosed").sort((a, b) => b[1] - a[1]);
  const full = hasFullDashboard(org.tier);
  const firstName = profile.display_first_name;

  return (
    <>
      <PageHeader
        title="Your donations"
        description={`${firstName ? `Hi ${firstName}. ` : ""}${t.devicesReceived > 0 ? `Here is where ${org.name}'s ${t.devicesReceived} devices are now.` : "Send your first batch and follow it here."}`}
        actions={
          <ClayButton href="/partner/batches/new" variant="primary" icon={<PackagePlus />}>
            Donate a batch
          </ClayButton>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <ClayCard tint="mint" size="lg" className="flex flex-col justify-between gap-6">
          <div>
            <p className="font-display text-[2.25rem] leading-[1.05] sm:text-[3rem]">
              Your laptops are helping <span className="tnum">{people}</span> {people === 1 ? "person" : "people"}.
            </p>
            <div className="mt-5">
              <PeoplePebbles count={people} />
            </div>
          </div>
          {recipients.length > 0 ? (
            <p className="text-ink-2" aria-label="Who your devices help">
              {recipients.map(([k, n], i) => (
                <span key={k}>
                  {i > 0 ? " · " : ""}
                  <span className="font-semibold text-ink tnum">{n}</span> {recipientNoun(k, n)}
                </span>
              ))}
            </p>
          ) : (
            <p className="text-ink-2">When your first device is sold, you&apos;ll see who it helps here — students, newcomers, seniors — never names.</p>
          )}
        </ClayCard>
        <StatGroup
          label="Your impact in numbers"
          items={[
            { label: "devices donated", value: t.devicesReceived },
            { label: "being refurbished now", value: t.devicesInProgress },
            { label: "recycled responsibly", value: t.devicesRecycled },
            { label: "kept out of landfill", value: t.kgDiverted.toLocaleString("en-CA", { maximumFractionDigits: 1 }), unit: "kg" },
          ]}
        />
      </div>

      {full ? (
        <section aria-labelledby="esg" className="flat mt-5 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="esg" className="font-semibold">
              Devices over time
            </h2>
            <p className="text-small text-ink-2">
              <span className="font-semibold text-ink tnum">{t.co2eAvoidedKg.toLocaleString("en-CA")} kg</span> CO₂e avoided ·{" "}
              <span className="font-semibold text-ink tnum">{t.volunteerHours}</span> volunteer hours
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
          <p className="mt-3 text-[0.8125rem] text-ink-3">
            Impact factors are estimates marked TO VERIFY.{" "}
            <a href="/impact#methodology" className="underline">
              How we calculate this
            </a>
          </p>
        </section>
      ) : null}

      {!full ? (
        <FlatCard className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title font-semibold">See the full picture with Impact Partner</h2>
            <p className="mt-1 text-ink-2">Live ESG dashboard, a branded annual report and a LinkedIn card to share — $500 a year. Your batches stay free either way.</p>
          </div>
          <ClayButton href="/partner/membership" variant="secondary" iconRight={<ArrowRight />}>
            Compare memberships
          </ClayButton>
        </FlatCard>
      ) : null}

      <section className="mt-12" aria-labelledby="recent">
        <div className="flex items-end justify-between gap-4">
          <h2 id="recent" className="text-title font-semibold">
            Your batches
          </h2>
          {batches.length > 3 ? (
            <ClayButton href="/partner/batches" variant="ghost" size="sm">
              See all {batches.length}
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
          <ul className="mt-4 flex flex-col gap-3">
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
