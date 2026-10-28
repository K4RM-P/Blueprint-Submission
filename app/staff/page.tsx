import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, Play, Printer } from "lucide-react";
import { ClayButton, ClayCard, FlatCard, StatGroup } from "@/components/clay";
import { PassportQrImage } from "@/components/journey/passport-qr";
import { CapacityGlasses } from "@/components/liquid";
import { BarsChart } from "@/components/charts/lazy";
import { PipelineTrack } from "@/components/staff/pipeline-track";
import { PageHeader } from "@/components/shell/page-header";
import { requireRole } from "@/lib/auth";
import { getCalendar, getFactors, getSettings } from "@/lib/queries/common";
import { money, monthStart } from "@/lib/queries/staff";
import { toImpactRows } from "@/lib/queries/impact";
import { computeImpact } from "@/lib/impact";
import { DEVICE_STATUSES, labels } from "@/lib/domain";
import { daysAgo, longDate, shortDate } from "@/lib/dates";
import { scoreFromLines, scoreLabel } from "@/lib/batch-score";
import { batchCanIssueCertificate } from "@/lib/status-machine";
import { fundBalance } from "@/lib/ledger";
import { PROGRAM_TARGETS, programMetrics } from "@/lib/program-metrics";
import { SHOWCASE_PASSPORTS } from "@/lib/showcase-passports";

export const metadata: Metadata = { title: "Overview" };

const PIPELINE_SHORT: Record<string, string> = {
  received: "Received",
  testing: "Testing",
  wipe_pending_verification: "Wipe pending",
  wipe_verified: "Verified",
  refurbishing: "Refurb",
  ready: "Ready",
  listed: "Listed",
  sold: "Sold",
  recycled: "Recycled",
};

export default async function StaffOverview() {
  const { supabase } = await requireRole("staff");
  const since = monthStart();
  const sixtyDays = daysAgo(60).toISOString();
  const settings = await getSettings(supabase);
  const [calendar, factors, devicesRes, pendingRes, membershipsRes, fundRes, orgsRes, activeVolRes, checkerRes, certBatchesRes] = await Promise.all([
    getCalendar(supabase, settings.weeklyCapacity, 4),
    getFactors(supabase),
    supabase.from("devices").select("status, source, batch_id, category, weight_kg, recipient_category, created_at, refurbished_at, sold_at, price_cents, passport_views, batch_line_items(quantity)"),
    supabase.from("donation_batches").select("id, created_at, value_score, preferred_week, organizations(name, tier), batch_line_items(quantity, make, model, category, approx_year)").eq("status", "submitted"),
    supabase.from("membership_payments").select("amount_cents").gte("created_at", since),
    supabase.from("fund_transactions").select("amount_cents, type, created_at"),
    supabase.from("organizations").select("id, donation_batches(status)"),
    supabase.from("device_events").select("actor_id, profiles!inner(role)").gte("created_at", sixtyDays).eq("profiles.role", "volunteer"),
    supabase.from("checker_logs").select("outcome"),
    // Received partner batches without a certificate yet: candidates for "certificates to issue".
    supabase.from("donation_batches").select("id, organizations(name), certificates(id)").in("status", ["received", "in_refurbishment", "completed"]),
  ]);
  // The demo passport with a full three-leg story (seeded, fixed code).
  const showcase = SHOWCASE_PASSPORTS[0];
  // DP-06: anonymous story analytics (counts only).
  const { data: engagementRaw } = await supabase.rpc("passport_story_summary");
  const engagement = (engagementRaw as { starts: number; completions: number; shares: number; drops: { slide: string; count: number }[] } | null) ?? { starts: 0, completions: 0, shares: 0, drops: [] };
  const topDrop = engagement.drops[0];
  const devices = devicesRes.data ?? [];
  // Ranked by the score recomputed from line items (see lib/batch-score scoreFromLines).
  const pending = (pendingRes.data ?? [])
    .map((b) => ({ ...b, value_score: scoreFromLines(b.batch_line_items, settings) }))
    .sort((a, z) => z.value_score - a.value_score || a.created_at.localeCompare(z.created_at));
  const impact = computeImpact(
    toImpactRows(devices.map((d) => ({ ...d, line_quantity: d.batch_line_items?.quantity ?? null }))),
    factors,
    settings.refurbMinutes,
  );
  const soldThisMonth = devices.filter((d) => d.status === "sold" && d.sold_at && d.sold_at >= since);
  const salesCents = soldThisMonth.reduce((s, d) => s + (d.price_cents ?? 0), 0);
  const membershipCents = (membershipsRes.data ?? []).reduce((s, m) => s + m.amount_cents, 0);
  const pifCents = (fundRes.data ?? []).filter((f) => f.amount_cents > 0 && f.created_at >= since).reduce((s, f) => s + f.amount_cents, 0);
  const activePartners = (orgsRes.data ?? []).filter((o) => o.donation_batches.some((b) => b.status !== "declined")).length;
  const activeVolunteers = new Set((activeVolRes.data ?? []).map((e) => e.actor_id)).size;
  const stageCount = (statuses: string[]) => devices.filter((d) => statuses.includes(d.status)).length;
  const pipeline = DEVICE_STATUSES.map((s) => ({ label: PIPELINE_SHORT[s], value: devices.filter((d) => d.status === s).length, muted: s === "recycled" }));
  const checker = checkerRes.data ?? [];
  // OPS-07/OPS-08: wipes waiting on staff, and batches whose devices are all verified (or recycled) but have no certificate yet.
  const wipesPending = devices.filter((d) => d.status === "wipe_pending_verification").length;
  const certsToIssue = (certBatchesRes.data ?? []).filter((b) => {
    if (b.certificates) return false;
    const statuses = devices.filter((d) => d.batch_id === b.id).map((d) => d.status);
    return statuses.length > 0 && batchCanIssueCertificate(statuses);
  });
  const nextOpen = calendar.find((w) => w.status !== "full");
  const householdInProgress = devices.filter((d) => d.source === "household" && !["sold", "recycled"].includes(d.status)).length;
  const fundBalanceCents = fundBalance((fundRes.data ?? []).map((f) => ({ type: f.type, amountCents: f.amount_cents })));
  const checkerOutcomes = (
    [
      ["accepted", "Accepted"],
      ["recycling_only", "Recycling only"],
      ["not_accepted", "Not accepted"],
      ["partner_redirect", "To Reuse Partnership"],
    ] as const
  ).map(([k, label]) => ({ label, value: checker.filter((c) => c.outcome === k).length, highlight: k === "accepted" || k === "partner_redirect" }));

  // PRD §3.3: is the Reuse Partnership working? Last 90 days against the year-one targets.
  const program = programMetrics(
    devices.map((d) => ({ source: d.source, category: d.category, receivedAt: d.created_at, readyAt: d.refurbished_at, soldAt: d.sold_at, priceCents: d.price_cents, passportViews: d.passport_views })),
    (orgsRes.data ?? []).flatMap((o) => o.donation_batches.map((b) => ({ organizationId: o.id, status: b.status }))),
    new Date(),
  );
  const days = (n: number | null) => (n == null ? "—" : `${n.toFixed(1)} days`);
  const programRows = [
    {
      value: program.partnerLaptopsPerMonth.toLocaleString("en-CA"),
      label: "partner laptops received a month",
      note: `Target ${PROGRAM_TARGETS.partnerLaptopsPerMonth} (250 a year)${program.partnerShare != null ? ` · ${Math.round(program.partnerShare * 100)}% of all intake` : ""}`,
    },
    {
      value: program.partnerSpeedup == null ? "—" : `${Math.round(program.partnerSpeedup * 100)}% faster`,
      label: "partner laptops reach Ready vs household devices",
      note: `Median intake to Ready: ${days(program.medianDaysToReady.partner)} vs ${days(program.medianDaysToReady.household)} · target ${Math.round(PROGRAM_TARGETS.partnerSpeedup * 100)}% faster`,
    },
    {
      value: `${program.repeatPartners.repeat} of ${program.repeatPartners.total}`,
      label: "partners came back with a second batch",
      note: `Target ${Math.round(PROGRAM_TARGETS.repeatPartnerShare * 100)}% renew`,
    },
    {
      value: money(program.partnerSales.cents),
      label: `from ${program.partnerSales.count} partner laptops sold`,
      note: "Prices set by Free Geek Toronto, never raised by Relay",
    },
    {
      value: program.passportViewsPerSold == null ? "—" : program.passportViewsPerSold.toFixed(1),
      label: "passport views per sold device",
      note: `Target ${PROGRAM_TARGETS.passportViewsPerSold}`,
    },
  ];

  const kpis = [
    { label: "devices sold this month", value: soldThisMonth.length },
    // Pay-It-Forward money is restricted to discounts, so it's shown beside revenue, not inside it.
    { label: "revenue this month", note: `Sales ${money(salesCents)} · memberships ${money(membershipCents)} · plus ${money(pifCents)} into the Pay-It-Forward fund`, value: `$${Math.round((salesCents + membershipCents) / 100).toLocaleString("en-CA")}` },
    { label: "active partners", value: activePartners },
    { label: "volunteers active in the last 60 days", value: activeVolunteers },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description={`Partner pipeline: ${pending.length > 0 ? `${pending.length} batch${pending.length === 1 ? "" : "es"} to review` : "no batches waiting"} · ${wipesPending} wipe${wipesPending === 1 ? "" : "s"} to verify · ${certsToIssue.length} certificate${certsToIssue.length === 1 ? "" : "s"} to issue. ${stageCount(["received"])} waiting to start, ${stageCount(["testing", "wipe_pending_verification", "wipe_verified", "refurbishing"])} on the bench, ${stageCount(["ready", "listed"])} ready to sell.`}
        actions={
          pending.length > 0 ? (
            <ClayButton href="/staff/batches?status=submitted" variant="primary" icon={<ClipboardCheck />}>
              Review {pending.length} batch{pending.length === 1 ? "" : "es"}
            </ClayButton>
          ) : null
        }
      />

      {/* The partner pipeline at a glance: each tile is the next job and links straight to it */}
      <section aria-labelledby="pipeline-now" className="mb-6">
        <h2 id="pipeline-now" className="sr-only">
          Partner pipeline
        </h2>
        <ul className="flat grid grid-cols-2 gap-px overflow-hidden bg-line !p-0 lg:grid-cols-4">
          {[
            { href: "/staff/batches?status=submitted", value: pending.length, label: "partner batches to review", note: pending[0] ? `Top: ${pending[0].organizations?.name ?? "a partner"} · score ${pending[0].value_score}` : "Best Batch Value Score first" },
            { href: "#capacity", value: nextOpen ? shortDate(nextOpen.week) : "—", label: "next open bench week", note: nextOpen ? `${nextOpen.capacity - nextOpen.load} of ${nextOpen.capacity} spots free` : "Every week is full" },
            { href: "/staff/devices?status=wipe_pending_verification", value: wipesPending, label: "wipes awaiting verification", note: "Only staff can verify a wipe" },
            {
              href: certsToIssue.length === 1 ? `/staff/batches/${certsToIssue[0].id}` : "/staff/batches?status=in_refurbishment",
              value: certsToIssue.length,
              label: "certificates to issue",
              note: certsToIssue.length
                ? `${certsToIssue.slice(0, 2).map((b) => b.organizations?.name ?? "A partner").join(", ")}${certsToIssue.length > 2 ? ` +${certsToIssue.length - 2} more` : ""}`
                : "Every verified batch has one",
            },
          ].map((tile) => (
            <li key={tile.label} className="bg-surface-flat">
              <Link href={tile.href} className="group flex h-full flex-col-reverse justify-end gap-1 p-5 hover:bg-canvas">
                <span className="text-small text-ink-2">
                  <span className="inline-flex items-center gap-1 font-medium text-ink">
                    {tile.label} <ArrowRight aria-hidden className="size-3.5 text-loop-deep transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-0.5 block text-[0.8125rem] text-ink-3">{tile.note}</span>
                </span>
                <span className="font-display tnum text-[2rem] leading-none text-ink">{tile.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="pending" className="flat overflow-hidden !p-0">
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 id="pending" className="font-semibold">
              Incoming partner batches
            </h2>
            <Link href="/staff/batches?status=submitted" className="text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
              Open queue
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="px-6 py-8 text-ink-2">Nothing waiting. New batches land here, best score first.</p>
          ) : (
            <table className="data-table mt-3">
              <thead>
                <tr>
                  <th scope="col">Partner</th>
                  <th scope="col">Devices</th>
                  <th scope="col">Week</th>
                  <th scope="col" className="text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <Link href={`/staff/batches/${b.id}`} className="font-medium text-ink underline-offset-4 hover:underline">
                        {b.organizations?.name}
                      </Link>
                      <span className="block text-[0.8125rem] text-ink-2">{longDate(b.created_at)}</span>
                    </td>
                    <td>{b.batch_line_items.reduce((s, l) => s + l.quantity, 0)}</td>
                    <td>{shortDate(b.preferred_week)}</td>
                    <td className="text-right font-semibold">
                      {b.value_score} <span className="font-normal text-ink-2">{scoreLabel(b.value_score)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <ClayCard material="glass" id="capacity" className="flex scroll-mt-24 flex-col gap-5">
          <div>
            <h2 className="font-semibold">Bench capacity · next 4 weeks</h2>
            <p className="text-small text-ink-2">{settings.weeklyCapacity} devices a week. Approved and scheduled batches fill the glass.</p>
          </div>
          <CapacityGlasses label="Capacity for the next four weeks" weeks={calendar.map((w) => ({ ...w, sublabel: `${w.load}/${w.capacity}` }))} className="!grid-cols-4" />
        </ClayCard>
      </div>

      <section aria-labelledby="pipeline" className="flat mt-6 p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="pipeline" className="font-semibold">
            Where every device is
          </h2>
          <Link href="/staff/devices" className="text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
            All {devices.length} devices
          </Link>
        </div>
        <div className="mt-4">
          <PipelineTrack stages={pipeline} label="Devices by pipeline status" />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section aria-labelledby="passport-qr" className="flat flex flex-col gap-5 p-6">
          <div className="flex items-start gap-5">
            <PassportQrImage code={showcase.code} size={96} className="shrink-0 border border-line" />
            <div className="min-w-0">
              <h2 id="passport-qr" className="font-semibold">
                Device Passports
              </h2>
              <p className="mt-1 text-small text-ink-2">
                Each device gets a QR label at intake. Scanning it shows where the laptop came from, how its data was wiped and who it helps now. Try{" "}
                <span className="font-mono text-ink">{showcase.code}</span>.
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-line pt-4">
            {[
              ["stories opened", engagement.starts.toLocaleString("en-CA")],
              ["watched to the end", engagement.completions.toLocaleString("en-CA")],
              ["shared", engagement.shares.toLocaleString("en-CA")],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col-reverse justify-end gap-1">
                <dt className="text-small text-ink-2">{k}</dt>
                <dd className="font-display text-[1.5rem] leading-none tnum">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="-mt-2 text-[0.8125rem] text-ink-3">
            Anonymous counts only.{topDrop ? ` Most viewers stop at the “${topDrop.slide.replace("_", " ")}” slide.` : ""}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <ClayButton href="/staff/labels" size="sm" icon={<Printer />}>
              Print QR labels
            </ClayButton>
            <ClayButton href={`/p/${showcase.code}`} variant="ghost" size="sm" icon={<Play />}>
              Watch a story
            </ClayButton>
          </div>
        </section>

        <FlatCard className="flex flex-col gap-4">
          <h2 className="font-semibold">Impact to date</h2>
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["devices reused", impact.devicesReused.toLocaleString("en-CA")],
              ["kg kept out of landfill", impact.kgDiverted.toLocaleString("en-CA")],
              ["kg CO₂e avoided", impact.co2eAvoidedKg.toLocaleString("en-CA")],
              ["volunteer hours", impact.volunteerHours.toLocaleString("en-CA")],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col-reverse justify-end gap-1">
                <dt className="text-small text-ink-2">{k}</dt>
                <dd className="font-display text-[1.75rem] leading-none tnum">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[0.8125rem] text-ink-3">{labels.deviceStatus.sold} = reused. Factors are estimates marked TO VERIFY.</p>
        </FlatCard>
      </div>

      {/* PRD §3.3 success metrics: the numbers that show whether the one change is working */}
      <section aria-labelledby="program" className="mt-12">
        <h2 id="program" className="text-title font-semibold">
          Is the Reuse Partnership working?
        </h2>
        <p className="mt-1 text-small text-ink-2">
          Last {program.windowDays} days of demo data. Targets are year-one assumptions to confirm with Free Geek Toronto.
        </p>
        <ul className="flat mt-4 grid grid-cols-1 gap-px overflow-hidden bg-line !p-0 sm:grid-cols-2 xl:grid-cols-5">
          {programRows.map((r) => (
            <li key={r.label} className="flex flex-col gap-1 bg-surface-flat p-5">
              <span className="font-display tnum text-[1.75rem] leading-none text-ink">{r.value}</span>
              <span className="mt-1 text-small font-medium text-ink">{r.label}</span>
              <span className="text-[0.8125rem] text-ink-3">{r.note}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Also running: quieter numbers that support the pipeline */}
      <section aria-labelledby="month" className="mt-12">
        <h2 id="month" className="text-title font-semibold">
          This month
        </h2>
        <StatGroup label="This month" items={kpis} className="mt-4 sm:grid-cols-4" />
      </section>

      <section aria-labelledby="also" className="mt-12">
        <h2 id="also" className="text-title font-semibold">
          Also running
        </h2>
        <p className="mt-1 text-small text-ink-2">Household donations, the Pay-It-Forward fund and the “Can I donate this?” checker.</p>
        <div className="mt-4 grid gap-6 xl:grid-cols-2">
          <FlatCard className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-4">
              <div className="flex flex-col-reverse justify-end gap-1">
                <dt className="text-small text-ink-2">household devices in progress</dt>
                <dd className="font-display text-[1.5rem] leading-none tnum">{householdInProgress}</dd>
              </div>
              <div className="flex flex-col-reverse justify-end gap-1">
                <dt className="text-small text-ink-2">Pay-It-Forward fund balance</dt>
                <dd className="font-display text-[1.5rem] leading-none tnum">{money(fundBalanceCents)}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-small font-semibold">
              <Link href="/staff/devices" className="text-loop-deep underline-offset-4 hover:underline">
                Household intake
              </Link>
              <Link href="/staff/fund" className="text-loop-deep underline-offset-4 hover:underline">
                Fund ledger
              </Link>
            </div>
          </FlatCard>
          {checker.length > 0 ? (
            <FlatCard className="flex flex-col gap-2">
              <p className="text-small text-ink-2">
                “Can I donate this?” checker · <span className="font-semibold text-ink">{checker.length}</span> answers
              </p>
              <BarsChart label="Checker outcomes" unit="answers" height={180} data={checkerOutcomes} />
            </FlatCard>
          ) : null}
        </div>
      </section>
    </>
  );
}
