import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { BatchStatusChip } from "@/components/journey/status";
import { FilterBar } from "@/components/staff/filter-bar";
import { requireRole } from "@/lib/auth";
import { BATCH_STATUSES, PARTNER_TIERS, labels } from "@/lib/domain";
import { scoreFromLines, scoreLabel } from "@/lib/batch-score";
import { getSettings } from "@/lib/queries/common";
import { daysAgo, shortDate } from "@/lib/dates";
import { upcomingWeeks } from "@/lib/capacity";

export const metadata: Metadata = { title: "Batch queue" };

export default async function StaffBatches({ searchParams }: { searchParams: Promise<{ status?: string; tier?: string; week?: string; org?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireRole("staff");
  let q = supabase
    .from("donation_batches")
    .select("id, status, value_score, preferred_week, scheduled_week, logistics, created_at, organizations!inner(name, tier), batch_line_items(quantity, make, model, category, approx_year)")
    .order("value_score", { ascending: false })
    .order("created_at", { ascending: true });
  // Default view is the work still open; "all" includes completed and declined batches.
  const status = sp.status ?? "active";
  if (status === "active") q = q.not("status", "in", "(completed,declined)");
  else if ((BATCH_STATUSES as readonly string[]).includes(status)) q = q.eq("status", status as (typeof BATCH_STATUSES)[number]);
  if (sp.tier && (PARTNER_TIERS as readonly string[]).includes(sp.tier)) q = q.eq("organizations.tier", sp.tier as (typeof PARTNER_TIERS)[number]);
  if (sp.week && /^\d{4}-\d{2}-\d{2}$/.test(sp.week)) q = q.or(`scheduled_week.eq.${sp.week},and(scheduled_week.is.null,preferred_week.eq.${sp.week})`);
  const org = sp.org && /^[0-9a-f-]{36}$/i.test(sp.org) ? sp.org : null;
  if (org) q = q.eq("organization_id", org);
  const [{ data }, settings] = await Promise.all([q, getSettings(supabase)]);
  // Rank by the score recomputed from the line items, never the stored value alone.
  const batches = (data ?? [])
    .map((b) => ({ ...b, value_score: scoreFromLines(b.batch_line_items, settings) }))
    .sort((a, z) => z.value_score - a.value_score || a.created_at.localeCompare(z.created_at));
  const weeks = upcomingWeeks(daysAgo(14), 10);

  return (
    <>
      <PageHeader eyebrow="Staff Console" title="Batch queue" description="Sorted by Batch Value Score: uniform batches of newer laptops, the quickest to refurbish and sell, come first." />
      <FilterBar
        action="/staff/batches"
        filters={[
          { name: "status", label: "Status", value: status, options: [{ value: "active", label: "Open batches" }, { value: "all", label: "All statuses" }, ...BATCH_STATUSES.map((s) => ({ value: s, label: labels.batchStatus[s] }))] },
          { name: "tier", label: "Partner tier", value: sp.tier ?? "", options: [{ value: "", label: "All tiers" }, ...PARTNER_TIERS.map((t) => ({ value: t, label: labels.tier[t] }))] },
          { name: "week", label: "Week", value: sp.week ?? "", options: [{ value: "", label: "Any week" }, ...weeks.map((w) => ({ value: w, label: `Week of ${shortDate(w)}` }))] },
        ]}
      >
        {org ? <input type="hidden" name="org" value={org} /> : null}
      </FilterBar>
      {org && batches[0] ? (
        <p className="-mt-2 mb-4 text-small text-ink-2">
          Showing batches from <span className="font-semibold text-ink">{batches[0].organizations.name}</span> ·{" "}
          <Link href="/staff/batches" className="text-loop-deep underline underline-offset-4">
            All partners
          </Link>
        </p>
      ) : null}
      <div className="flat overflow-x-auto !p-0">
        {batches.length === 0 ? (
          <div className="px-6">
            <EmptyState title="No batches match these filters." tone="sky" />
          </div>
        ) : (
          <table className="data-table">
            <caption className="sr-only">Donation batches</caption>
            <thead>
              <tr>
                <th scope="col" className="text-right">Score</th>
                <th scope="col">Partner</th>
                <th scope="col">Devices</th>
                <th scope="col">Week</th>
                <th scope="col">Logistics</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const qty = b.batch_line_items.reduce((s, l) => s + l.quantity, 0);
                const top = [...b.batch_line_items].sort((a, z) => z.quantity - a.quantity)[0];
                return (
                  <tr key={b.id} className="relative cursor-pointer">
                    <td className="text-right">
                      <span className="font-display text-xl">{b.value_score}</span>
                      <span className="block text-[0.75rem] text-ink-2">{scoreLabel(b.value_score)}</span>
                    </td>
                    <td>
                      <Link href={`/staff/batches/${b.id}`} className="font-semibold underline-offset-4 after:absolute after:inset-0 hover:underline">
                        {b.organizations.name}
                      </Link>
                      <span className="block text-[0.8125rem] text-ink-2">{labels.tier[b.organizations.tier]}</span>
                    </td>
                    <td>
                      {qty}
                      <span className="block text-[0.8125rem] text-ink-2">{top ? `${top.make} ${top.model}${b.batch_line_items.length > 1 ? " + more" : ""}` : ""}</span>
                    </td>
                    <td>{shortDate(b.scheduled_week ?? b.preferred_week)}{b.scheduled_week ? "" : " (pref.)"}</td>
                    <td>{b.logistics === "pickup" ? "Pickup" : "Drop-off"}</td>
                    <td>
                      <BatchStatusChip status={b.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
