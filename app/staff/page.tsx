import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, Play, Printer } from "lucide-react";
import { ClayButton, ClayCard, FlatCard, StatGroup } from "@/components/clay";
import { PassportQrImage } from "@/components/journey/passport-qr";
import { CapacityGlasses } from "@/components/liquid";
import { BarsChart } from "@/components/charts/bars";
import { PipelineTrack } from "@/components/staff/pipeline-track";
import { PageHeader } from "@/components/shell/page-header";
import { requireRole } from "@/lib/auth";
import { getCalendar, getFactors, getSettings } from "@/lib/queries/common";
import { money, monthStart } from "@/lib/queries/staff";
import { toImpactRows } from "@/lib/queries/impact";
import { computeImpact } from "@/lib/impact";
import { DEVICE_STATUSES, labels } from "@/lib/domain";
import { daysAgo, longDate, shortDate } from "@/lib/dates";
import { scoreLabel } from "@/lib/batch-score";
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
  const [calendar, factors, devicesRes, pendingRes, membershipsRes, fundRes, orgsRes, activeVolRes, checkerRes] = await Promise.all([
    getCalendar(supabase, settings.weeklyCapacity, 4),
    getFactors(supabase),
    supabase.from("devices").select("status, category, weight_kg, recipient_category, refurbished_at, sold_at, price_cents, batch_line_items(quantity)"),
    supabase.from("donation_batches").select("id, created_at, value_score, preferred_week, organizations(name, tier), batch_line_items(quantity, make, model)").eq("status", "submitted").order("value_score", { ascending: false }),
    supabase.from("membership_payments").select("amount_cents").gte("created_at", since),
    supabase.from("fund_transactions").select("amount_cents, type, created_at"),
    supabase.from("organizations").select("id, donation_batches(status)"),
    supabase.from("device_events").select("actor_id, profiles!inner(role)").gte("created_at", sixtyDays).eq("profiles.role", "volunteer"),
    supabase.from("checker_logs").select("outcome"),
  ]);
  // The demo passport with a full three-leg story (seeded, fixed code).
  const showcase = SHOWCASE_PASSPORTS[0];
  // DP-06: anonymous story analytics (counts only).
  const { data: engagementRaw } = await supabase.rpc("passport_story_summary");
  const engagement = (engagementRaw as { starts: number; completions: number; shares: number; drops: { slide: string; count: number }[] } | null) ?? { starts: 0, completions: 0, shares: 0, drops: [] };
  const topDrop = engagement.drops[0];
  const devices = devicesRes.data ?? [];
  const pending = pendingRes.data ?? [];
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
  const pipeline = DEVICE_STATUSES.map((s) => ({ label: PIPELINE_SHORT[s], value: devices.filter((d) => d.status === s).length, muted: s === "recycled" }));
  const checker = checkerRes.data ?? [];
  const checkerOutcomes = (
    [
      ["accepted", "Accepted"],
      ["recycling_only", "Recycling only"],
      ["not_accepted", "Not accepted"],
      ["partner_redirect", "To partner program"],
    ] as const
  ).map(([k, label]) => ({ label, value: checker.filter((c) => c.outcome === k).length, highlight: k === "accepted" || k === "partner_redirect" }));

  const kpis = [
    { label: "devices sold this month", value: soldThisMonth.length },
    { label: "revenue this month", note: `Sales ${money(salesCents)} · memberships ${money(membershipCents)} · fund ${money(pifCents)}`, value: `$${Math.round((salesCents + membershipCents + pifCents) / 100).toLocaleString("en-CA")}` },
    { label: "active partners", value: activePartners },
    { label: "volunteers active in the last 60 days", value: activeVolunteers },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description={
          pending.length > 0
            ? `${pending.length} batch${pending.length === 1 ? " needs" : "es need"} your review. ${impact.devicesInProgress} devices are being refurbished.`
            : `No batches waiting. ${impact.devicesInProgress} devices are being refurbished.`
        }
        actions={
          pending.length > 0 ? (
            <ClayButton href="/staff/batches?status=submitted" variant="primary" icon={<ClipboardCheck />}>
              Review {pending.length} batch{pending.length === 1 ? "" : "es"}
            </ClayButton>
          ) : null
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="pending" className="flat overflow-hidden !p-0">
          <div className="flex items-center justify-between px-6 pt-5">
            <h2 id="pending" className="font-semibold">
              Waiting for approval
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
        <ClayCard material="glass" className="flex flex-col gap-5">
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

      <section aria-labelledby="month" className="mt-6">
        <h2 id="month" className="sr-only">
          This month
        </h2>
        <StatGroup label="This month" items={kpis} className="sm:grid-cols-4" />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
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
          {checker.length > 0 ? (
            <div className="border-t border-line pt-4">
              <p className="text-small text-ink-2">
                “Can I donate this?” checker · <span className="font-semibold text-ink">{checker.length}</span> answers
              </p>
              <BarsChart label="Checker outcomes" unit="answers" height={180} data={checkerOutcomes} />
            </div>
          ) : null}
          <p className="text-[0.8125rem] text-ink-3">{labels.deviceStatus.sold} = reused. Factors are estimates marked TO VERIFY.</p>
        </FlatCard>

        <section aria-labelledby="passport-qr" className="flat flex flex-col gap-5 p-6">
          <div className="flex items-start gap-5">
            <PassportQrImage code={showcase.code} size={96} className="shrink-0 border border-line" />
            <div className="min-w-0">
              <h2 id="passport-qr" className="font-semibold">
                Device passports
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
      </div>
    </>
  );
}
