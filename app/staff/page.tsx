import type { Metadata } from "next";
import Link from "next/link";
import { ClayCard, FlatCard, StatPebble } from "@/components/clay";
import { CapacityGlasses } from "@/components/liquid";
import { BarsChart } from "@/components/charts/bars";
import { PageHeader } from "@/components/shell/page-header";
import { requireRole } from "@/lib/auth";
import { getCalendar, getFactors, getSettings } from "@/lib/queries/common";
import { money, monthStart } from "@/lib/queries/staff";
import { toImpactRows } from "@/lib/queries/impact";
import { computeImpact } from "@/lib/impact";
import { DEVICE_STATUSES, labels } from "@/lib/domain";
import { daysAgo, longDate, shortDate } from "@/lib/dates";
import { scoreLabel } from "@/lib/batch-score";

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
  const pipeline = DEVICE_STATUSES.map((s) => ({ label: PIPELINE_SHORT[s], value: devices.filter((d) => d.status === s).length, highlight: s !== "recycled" }));
  const checker = checkerRes.data ?? [];
  const accepted = checker.filter((c) => c.outcome === "accepted").length;
  const redirected = checker.length - accepted;

  return (
    <>
      <PageHeader eyebrow="Staff Console" title="Overview" description={`${pending.length} batch${pending.length === 1 ? "" : "es"} waiting for review · ${impact.devicesInProgress} devices in the pipeline.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatPebble label="Pending approvals" value={pending.length} tint="apricot" />
        <StatPebble label="Sold this month" value={soldThisMonth.length} tint="mint" />
        <StatPebble label="Revenue this month" value={Math.round((salesCents + membershipCents + pifCents) / 100)} prefix="$" caption={`Sales ${money(salesCents)} · memberships ${money(membershipCents)} · PIF ${money(pifCents)}`} />
        <StatPebble label="Active partners" value={activePartners} caption={`${activeVolunteers} volunteers active in the last 60 days`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <FlatCard>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-semibold">Devices by pipeline status</h2>
            <span className="text-small text-ink-2 tnum">{devices.length} total</span>
          </div>
          <div className="mt-4">
            <BarsChart data={pipeline} label="Devices by pipeline status" />
          </div>
        </FlatCard>
        <ClayCard material="glass" className="flex flex-col gap-5">
          <div>
            <h2 className="font-semibold">Bench capacity · next 4 weeks</h2>
            <p className="text-small text-ink-2">{settings.weeklyCapacity} devices per week. Approved and scheduled batches count toward load.</p>
          </div>
          <CapacityGlasses label="Capacity for the next four weeks" weeks={calendar.map((w) => ({ ...w, sublabel: `${w.load}/${w.capacity}` }))} className="!grid-cols-4" />
        </ClayCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
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
        <FlatCard className="flex flex-col gap-4">
          <h2 className="font-semibold">Impact to date</h2>
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["Devices reused", impact.devicesReused.toLocaleString("en-CA")],
              ["kg diverted", impact.kgDiverted.toLocaleString("en-CA")],
              ["kg CO₂e avoided", impact.co2eAvoidedKg.toLocaleString("en-CA")],
              ["Volunteer hours", impact.volunteerHours.toLocaleString("en-CA")],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-small text-ink-2">{k}</dt>
                <dd className="font-display text-[1.75rem] tnum">{v}</dd>
              </div>
            ))}
          </dl>
          {checker.length > 0 ? (
            <p className="border-t border-line pt-4 text-small text-ink-2">
              “Can I donate this?” checker: <span className="font-semibold text-ink">{accepted}</span> accepted, <span className="font-semibold text-ink">{redirected}</span> redirected to
              recycling or the partner program.
            </p>
          ) : null}
          <p className="text-[0.8125rem] text-ink-3">{labels.deviceStatus.sold} = reused. Factors are placeholders marked TO VERIFY.</p>
        </FlatCard>
      </div>
    </>
  );
}
