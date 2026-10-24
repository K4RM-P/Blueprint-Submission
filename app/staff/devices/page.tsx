import type { Metadata } from "next";
import { Download, Search } from "lucide-react";
import { ClayButton, EmptyState } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { FilterBar } from "@/components/staff/filter-bar";
import { DeviceTable } from "@/components/staff/device-table";
import { HouseholdIntake } from "@/components/staff/household-intake";
import { requireRole } from "@/lib/auth";
import { listVolunteers } from "@/lib/queries/staff";
import { DEVICE_CATEGORIES, DEVICE_STATUSES, labels } from "@/lib/domain";

export const metadata: Metadata = { title: "Devices" };

export default async function StaffDevices({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; batch?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireRole("staff");
  let q = supabase
    .from("devices")
    .select("id, passport_code, make, model, category, status, source, updated_at, assigned_volunteer_id, donation_batches(organizations(name))")
    .order("updated_at", { ascending: false })
    .limit(300);
  if (sp.status && (DEVICE_STATUSES as readonly string[]).includes(sp.status)) q = q.eq("status", sp.status as (typeof DEVICE_STATUSES)[number]);
  if (sp.category && (DEVICE_CATEGORIES as readonly string[]).includes(sp.category)) q = q.eq("category", sp.category as (typeof DEVICE_CATEGORIES)[number]);
  if (sp.batch && /^[0-9a-f-]{36}$/.test(sp.batch)) q = q.eq("batch_id", sp.batch);
  const term = (sp.q ?? "").trim().replace(/[,()%*]/g, "").slice(0, 60);
  if (term) q = q.or(`passport_code.ilike.%${term}%,model.ilike.%${term}%,make.ilike.%${term}%,serial_number.ilike.%${term}%`);
  const [{ data }, volunteers] = await Promise.all([q, listVolunteers(supabase)]);
  const vName = new Map(volunteers.map((v) => [v.id, v.full_name]));
  const rows = (data ?? []).map((d) => ({
    id: d.id,
    passport_code: d.passport_code,
    make: d.make,
    model: d.model,
    category: d.category,
    status: d.status,
    source: d.source,
    updated_at: d.updated_at,
    partner: d.donation_batches?.organizations?.name ?? null,
    volunteer: d.assigned_volunteer_id ? (vName.get(d.assigned_volunteer_id) ?? "Volunteer") : null,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Staff Console"
        title="Devices"
        description="Search, filter, and act on many devices at once. Press / to search, v to verify selected wipes."
        actions={
          <>
            <HouseholdIntake />
            <ClayButton href="/api/export/devices" variant="ghost" icon={<Download />} prefetch={false}>
              CSV
            </ClayButton>
          </>
        }
      />
      <FilterBar
        action="/staff/devices"
        filters={[
          { name: "status", label: "Status", value: sp.status ?? "", options: [{ value: "", label: "All statuses" }, ...DEVICE_STATUSES.map((s) => ({ value: s, label: labels.deviceStatus[s] }))] },
          { name: "category", label: "Category", value: sp.category ?? "", options: [{ value: "", label: "All categories" }, ...DEVICE_CATEGORIES.map((c) => ({ value: c, label: labels.category[c] }))] },
        ]}
      >
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-small font-medium text-ink-2">
          Search
          <span className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <input id="device-search" name="q" defaultValue={sp.q ?? ""} placeholder="Passport, model or serial" className="field-input !min-h-11 pl-10" />
          </span>
        </label>
        {sp.batch ? <input type="hidden" name="batch" value={sp.batch} /> : null}
      </FilterBar>
      {rows.length === 0 ? <EmptyState title="No devices match." tone="sky">Try another status or clear the search.</EmptyState> : <DeviceTable rows={rows} volunteers={volunteers} />}
      <p className="mt-3 text-small text-ink-3">Showing up to 300 most recently updated devices.</p>
    </>
  );
}
