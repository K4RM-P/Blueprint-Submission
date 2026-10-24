import { ClayCard } from "@/components/clay";
import { JourneyTimeline } from "@/components/journey/journey-timeline";
import { BatchStatusChip } from "@/components/journey/status";
import { batchSteps } from "@/lib/batch-timeline";
import { batchQuantity, batchTitle, type PartnerBatch } from "@/lib/queries/partner";
import { scoreLabel } from "@/lib/batch-score";
import { longDate, shortDate } from "@/lib/dates";

/** Openable clay card for a batch with a compact horizontal timeline (§9.4). */
export function BatchCard({ batch }: { batch: PartnerBatch }) {
  const steps = batchSteps(batch).map((s) => ({ ...s, icon: null }));
  const week = batch.scheduled_week ?? batch.preferred_week;
  return (
    <ClayCard as="article" href={`/partner/batches/${batch.id}`} aria-label={`Open batch: ${batchTitle(batch)}`} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-title font-semibold leading-snug">{batchTitle(batch)}</h3>
          <p className="mt-1 text-small text-ink-2">
            Submitted {longDate(batch.created_at)} · {batchQuantity(batch)} devices · {batch.status === "scheduled" || batch.scheduled_week ? "Scheduled" : "Preferred"} week of {shortDate(week)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip bg-white/70 tnum text-ink-2">
            Score {batch.value_score} · {scoreLabel(batch.value_score)}
          </span>
          <BatchStatusChip status={batch.status} />
        </div>
      </div>
      <JourneyTimeline orientation="horizontal" steps={steps} label="Batch progress" />
    </ClayCard>
  );
}
