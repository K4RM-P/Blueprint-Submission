import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, PackagePlus, QrCode } from "lucide-react";
import { ClayButton, ClayCard, EmptyState, FlatCard, StatGroup } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { DemoDataNote } from "@/components/shell/demo-data-note";
import { BatchCard } from "@/components/partner/batch-card";
import { PeoplePebbles } from "@/components/partner/people-pebbles";
import { getPartnerContext, listBatches } from "@/lib/queries/partner";
import { getPartnerImpact } from "@/lib/queries/impact";
import { helpingLine, labels, recipientNoun, type DeviceStatus, type RecipientCategory } from "@/lib/domain";
import { hasFullDashboard } from "@/lib/pricing";
import { DevicesAreaChart } from "@/components/charts/area";
import { lastMonths, monthlySeries } from "@/lib/impact";
import { shortDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Dashboard" };

/** Device Passports shown on the dashboard: laptops already helping someone first. */
const PASSPORT_ORDER: DeviceStatus[] = ["sold", "listed", "ready", "refurbishing", "wipe_verified", "wipe_pending_verification", "testing", "received", "recycled"];

export default async function PartnerDashboard() {
  const { supabase, org, profile } = await getPartnerContext();
  const [batches, impact, views] = await Promise.all([
    listBatches(supabase, org.id),
    getPartnerImpact(supabase),
    // Aggregate count only (DP-06). Null until migration 20261027000001 is applied.
    supabase.rpc("partner_passport_views").then((r) => (r.error ? null : Number(r.data ?? 0))),
  ]);
  const t = impact.totals;
  const people = t.devicesReused;
  const recipients = (Object.entries(t.recipients) as [RecipientCategory, number][]).filter(([k]) => k !== "undisclosed").sort((a, b) => b[1] - a[1]);
  const full = hasFullDashboard(org.tier);
  const certificates = batches.filter((b) => b.certificates).length;
  // The partner's own laptops, each linking to its Device Passport.
  const laptops = [...impact.devices].sort((a, b) => PASSPORT_ORDER.indexOf(a.status) - PASSPORT_ORDER.indexOf(b.status));
  const batchOf = new Map(batches.map((b) => [b.id, b]));
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
      <DemoDataNote className="-mt-2 mb-5" />

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
            { label: "being refurbished now", value: t.devicesInProgress, note: t.devicesRecycled > 0 ? `${t.devicesRecycled} recycled responsibly` : undefined },
            { label: `data-wipe certificate${certificates === 1 ? "" : "s"} issued`, value: certificates },
            { label: "kept out of landfill", value: t.kgDiverted.toLocaleString("en-CA", { maximumFractionDigits: 1 }), unit: "kg" },
          ]}
        />
      </div>

      <section className="mt-10" aria-labelledby="recent">
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
      <section className="mt-10" aria-labelledby="laptops">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="laptops" className="text-title font-semibold">
              Your laptops
            </h2>
            <p className="mt-1 text-small text-ink-2">Every laptop you donated, with its Device Passport: its certified data wipe, its volunteer and who it helps now. Your proof of impact.</p>
          </div>
          {views !== null && laptops.length > 0 ? (
            <p className="inline-flex items-center gap-2 text-small text-ink-2">
              <Eye className="size-4 text-loop-deep" aria-hidden />
              Passports viewed <span className="font-semibold text-ink tnum">{views.toLocaleString("en-CA")}</span> time{views === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        {laptops.length === 0 ? (
          <FlatCard className="mt-4">
            <p className="text-ink-2">When Free Geek Toronto receives your first batch, each laptop gets a QR label and a Device Passport. They appear here.</p>
          </FlatCard>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {laptops.map((d) => {
              const b = d.batch_id ? batchOf.get(d.batch_id) : undefined;
              return (
                <li key={d.id} className="min-w-0">
                  <Link href={`/p/${d.passport_code}`} className="flat lift group flex h-full items-center gap-4 p-4">
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-mint text-loop-deep">
                      <QrCode className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {d.make} {d.model}
                      </span>
                      <span className="block text-[0.8125rem] text-ink">{d.status === "sold" ? helpingLine(d.recipient_category) : labels.deviceStatus[d.status]}</span>
                      <span className="block truncate font-mono text-[0.75rem] text-ink-2">
                        {d.passport_code}
                        {b ? ` · batch of ${shortDate(b.created_at)}` : ""}
                      </span>
                    </span>
                    <ArrowRight aria-hidden className="size-4 shrink-0 text-loop-deep transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {full ? (
        <section aria-labelledby="over-time" className="flat mt-10 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="over-time" className="font-semibold">
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
        <p className="mt-10 border-t border-line pt-5 text-small text-ink-2">
          Your batches, certificates and Device Passports are free on the Community tier. Want an annual report and a community impact story you can share with your team and clients? Those are optional extras.{" "}
          <Link href="/partner/membership" className="font-semibold text-loop-deep underline-offset-4 hover:underline">
            Compare optional memberships
          </Link>
        </p>
      ) : null}
    </>
  );
}
