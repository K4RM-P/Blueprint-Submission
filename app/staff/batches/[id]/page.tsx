import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClayCard, FlatCard } from "@/components/clay";
import { JourneyTimeline } from "@/components/journey/journey-timeline";
import { BatchStatusChip } from "@/components/journey/status";
import { PageHeader } from "@/components/shell/page-header";
import { BatchOps } from "@/components/staff/batch-ops";
import { SerialGrid } from "@/components/staff/serial-grid";
import { CertificatePanel } from "@/components/staff/certificate-panel";
import { requireRole } from "@/lib/auth";
import { getCalendar, getSettings } from "@/lib/queries/common";
import { batchSteps } from "@/lib/batch-timeline";
import { labels } from "@/lib/domain";
import { daysAgo, longDate, shortDate } from "@/lib/dates";
import { scoreLabel } from "@/lib/batch-score";
import { batchCanIssueCertificate } from "@/lib/status-machine";

export const metadata: Metadata = { title: "Batch" };

export default async function StaffBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireRole("staff");
  const { data: batch } = await supabase
    .from("donation_batches")
    .select("*, organizations(id, name, tier, contact_email), batch_line_items(*), certificates(certificate_number, issued_at, device_count, pdf_path)")
    .eq("id", id)
    .maybeSingle();
  if (!batch) notFound();
  const settings = await getSettings(supabase);
  const [calendar, { data: devices }] = await Promise.all([
    getCalendar(supabase, settings.weeklyCapacity, 8, daysAgo(7)),
    supabase.from("devices").select("id, passport_code, make, model, status, serial_number, cpu, ram_gb, storage_gb").eq("batch_id", id).order("passport_code"),
  ]);
  const qty = batch.batch_line_items.reduce((s, l) => s + l.quantity, 0);
  const list = devices ?? [];
  const canIssue = !batch.certificates && batchCanIssueCertificate(list.map((d) => d.status));
  const pendingWipes = list.filter((d) => d.status === "wipe_pending_verification").length;

  const notes = batch.notes ? (
    <FlatCard>
      <h2 className="font-semibold">Partner notes</h2>
      <p className="mt-2 text-ink-2">{batch.notes}</p>
    </FlatCard>
  ) : null;

  return (
    <>
      <p className="mb-4 text-small">
        <Link href="/staff/batches" className="font-medium text-loop-deep underline-offset-4 hover:underline">
          ← Batch queue
        </Link>
      </p>
      <PageHeader
        eyebrow={batch.organizations ? labels.tier[batch.organizations.tier] : undefined}
        title={batch.organizations?.name ?? "Batch"}
        description={`${qty} devices · score ${batch.value_score} (${scoreLabel(batch.value_score)}) · submitted ${longDate(batch.created_at)} · ${batch.logistics === "pickup" ? `pickup at ${batch.pickup_address}` : "drop-off"}, ${batch.scheduled_week ? "scheduled" : "preferred"} week of ${shortDate(batch.scheduled_week ?? batch.preferred_week)}`}
        actions={<BatchStatusChip status={batch.status} />}
      />
      <ClayCard material="glass" className="flex flex-col gap-6">
        <JourneyTimeline orientation="horizontal" steps={batchSteps(batch).map((s) => ({ ...s, icon: null }))} label="Batch status" />
        <BatchOps id={batch.id} status={batch.status} preferredWeek={batch.preferred_week} quantity={qty} calendar={calendar} />
        {batch.schedule_override_note ? <p className="text-small text-ink-2">Capacity override note: {batch.schedule_override_note}</p> : null}
        {batch.decline_reason ? <p className="text-small text-ink-2">Decline reason: {batch.decline_reason}</p> : null}
      </ClayCard>

      <div className={list.length > 0 ? "mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]" : "mt-6 max-w-3xl"}>
        <div className="min-w-0">
          {list.length > 0 ? (
            <SerialGrid devices={list} />
          ) : (
            <FlatCard>
              <h2 className="font-semibold">What the partner is sending</h2>
              <ul className="mt-3 divide-y divide-line">
                {batch.batch_line_items.map((l) => (
                  <li key={l.id} className="flex justify-between gap-4 py-2.5">
                    <span>
                      {l.make} {l.model}
                      <span className="block text-small text-ink-2">
                        {labels.category[l.category]} · {l.approx_year ?? "year unknown"} · {labels.condition[l.condition]}
                      </span>
                    </span>
                    <span className="font-semibold tnum">× {l.quantity}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-small text-ink-2">Each device gets its passport code when you receive the batch.</p>
              {batch.notes ? (
                <div className="mt-5 border-t border-line pt-4">
                  <h3 className="text-small font-semibold">Partner notes</h3>
                  <p className="mt-1 text-ink-2">{batch.notes}</p>
                </div>
              ) : null}
            </FlatCard>
          )}
        </div>
        {list.length > 0 ? (
          <div className="flex min-w-0 flex-col gap-6">
            <CertificatePanel batchId={batch.id} certificate={batch.certificates} canIssue={canIssue} pendingWipes={pendingWipes} total={list.length} />
            {notes}
          </div>
        ) : null}
      </div>
    </>
  );
}
