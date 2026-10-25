import type { Metadata } from "next";
import Link from "next/link";
import { ClayCard, EmptyState, FlatCard } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { JourneyTimeline } from "@/components/journey/journey-timeline";
import { BatchStatusChip, DeviceStatusChip } from "@/components/journey/status";
import { BatchActions } from "@/components/partner/batch-actions";
import { CertificateCard } from "@/components/partner/certificate-card";
import { batchSteps } from "@/lib/batch-timeline";
import { batchTitle, getBatch, getPartnerContext } from "@/lib/queries/partner";
import { longDate, shortDate } from "@/lib/dates";
import { labels } from "@/lib/domain";
import { scoreLabel } from "@/lib/batch-score";
import { VERIFIED_OR_LATER } from "@/lib/status-machine";

export const metadata: Metadata = { title: "Batch" };

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getPartnerContext();
  const { batch, devices } = await getBatch(supabase, id);
  const cert = batch.certificates ?? null;
  const reused = devices.filter((d) => d.status === "sold").length;
  const recycled = devices.filter((d) => d.status === "recycled").length;
  const verified = devices.filter((d) => VERIFIED_OR_LATER.includes(d.status) || d.status === "recycled").length;
  const steps = batchSteps(batch).map((s) => ({ ...s, icon: null }));
  const week = batch.scheduled_week ?? batch.preferred_week;
  const hasSerials = devices.some((d) => d.serial_number);

  return (
    <>
      <p className="mb-4 text-small">
        <Link href="/partner/batches" className="font-medium text-loop-deep underline-offset-4 hover:underline">
          ← All batches
        </Link>
      </p>
      <PageHeader
        title={batchTitle(batch)}
        description={
          reused > 0 ? (
            <>
              <span className="font-semibold text-ink">{reused} of these devices are already helping people</span> — {recycled > 0 ? `${recycled} were recycled responsibly.` : "the rest are on the way."}
            </>
          ) : batch.status === "declined" ? (
            "This batch was declined. Here's why, and what to do next."
          ) : (
            `Submitted ${longDate(batch.created_at)}${["submitted", "approved", "scheduled"].includes(batch.status) ? ` · ${batch.scheduled_week ? "drop-off" : "preferred"} week of ${shortDate(week)}` : ""}`
          )
        }
        actions={<BatchStatusChip status={batch.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <ClayCard className="flex flex-col gap-6">
            <JourneyTimeline orientation="horizontal" steps={steps} label="Batch status timeline" />
            {batch.status === "declined" && batch.decline_reason ? (
              <p className="rounded-[var(--r-sm)] bg-white/70 p-4 text-ink">
                <span className="font-semibold">Reason: </span>
                {batch.decline_reason}
              </p>
            ) : null}
            {batch.status === "submitted" ? (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                <p className="text-small text-ink-2">Our team reviews new batches within 2 business days. You can edit until then.</p>
                <BatchActions id={batch.id} />
              </div>
            ) : null}
          </ClayCard>

          <section aria-labelledby="journeys">
            <h2 id="journeys" className="text-title font-semibold">
              Devices{devices.length > 0 ? ` (${devices.length})` : ""}
            </h2>
            <p className="mt-1 text-small text-ink-2">Open a passport to see that laptop&apos;s story and who it helps — never personal details.</p>
            <div className="flat mt-4 overflow-x-auto !p-0">
              {devices.length === 0 ? (
                <div className="px-6">
                  <EmptyState title="Devices appear here once they arrive." tone="sky">
                    When our team receives your batch, each device gets a unique passport code and starts its journey.
                  </EmptyState>
                </div>
              ) : (
                <table className="data-table">
                  <caption className="sr-only">Devices in this batch</caption>
                  <thead>
                    <tr>
                      <th scope="col">Passport</th>
                      <th scope="col">Device</th>
                      {hasSerials ? <th scope="col">Serial</th> : null}
                      <th scope="col">Status</th>
                      <th scope="col">Helping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((d) => (
                      <tr key={d.id}>
                        <td>
                          <Link href={`/p/${d.passport_code}`} className="whitespace-nowrap font-mono text-[0.875rem] text-loop-deep underline-offset-4 hover:underline">
                            {d.passport_code}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap">
                          {d.make} {d.model}
                        </td>
                        {hasSerials ? <td className="font-mono text-[0.8125rem] text-ink-2">{d.serial_number ?? "—"}</td> : null}
                        <td className="whitespace-nowrap">
                          <DeviceStatusChip status={d.status} />
                        </td>
                        <td className="whitespace-nowrap">{d.status === "sold" ? (d.recipient_category ? labels.recipient[d.recipient_category] : "A new owner") : d.status === "recycled" ? "Recycled for parts" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <CertificateCard cert={cert} verifiedCount={verified} total={devices.length} />
          <FlatCard>
            <h2 className="font-semibold">What you sent</h2>
            <ul className="mt-3 divide-y divide-line">
              {batch.batch_line_items.map((l) => (
                <li key={l.id} className="flex justify-between gap-4 py-2.5 text-small">
                  <span>
                    {l.make} {l.model}
                    <span className="block text-ink-2">
                      {labels.category[l.category]} · {l.approx_year ?? "year unknown"} · {labels.condition[l.condition]}
                    </span>
                  </span>
                  <span className="font-semibold tnum">× {l.quantity}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-small text-ink-2">
              Batch Value Score <span className="font-semibold text-ink tnum">{batch.value_score}</span> · {scoreLabel(batch.value_score)} ·{" "}
              {batch.logistics === "pickup" ? "Pickup" : "Drop-off"}
            </p>
            {batch.notes ? <p className="mt-3 text-small text-ink-2">Notes: {batch.notes}</p> : null}
          </FlatCard>
        </div>
      </div>
    </>
  );
}
