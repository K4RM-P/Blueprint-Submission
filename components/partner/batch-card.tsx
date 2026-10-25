import { ChevronRight } from "lucide-react";
import { ClayCard } from "@/components/clay";
import { BatchStatusChip } from "@/components/journey/status";
import { batchSteps } from "@/lib/batch-timeline";
import { batchQuantity, batchTitle, type PartnerBatch } from "@/lib/queries/partner";
import { longDate, shortDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

/** Openable clay row for a batch: what it is, where it is, and a quiet segmented progress bar (§9.4). */
export function BatchCard({ batch }: { batch: PartnerBatch }) {
  const steps = batchSteps(batch);
  const done = steps.filter((s) => s.done).length;
  const week = batch.scheduled_week ?? batch.preferred_week;
  return (
    <ClayCard as="article" href={`/partner/batches/${batch.id}`} aria-label={`Open batch: ${batchTitle(batch)}`} className="flex items-center gap-5 !py-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-[1.125rem] font-semibold leading-snug">{batchTitle(batch)}</h3>
          <BatchStatusChip status={batch.status} />
        </div>
        <p className="mt-1 text-small text-ink-2">
          {batchQuantity(batch)} devices · submitted {longDate(batch.created_at)}
          {batch.status === "submitted" || batch.status === "approved" || batch.status === "scheduled" ? ` · drop-off week of ${shortDate(week)}` : ""}
        </p>
        <div className="mt-3 flex max-w-md items-center gap-1" role="img" aria-label={`Step ${done} of ${steps.length}`}>
          {steps.map((s) => (
            <span key={s.key} className={cn("h-1.5 flex-1 rounded-full", s.done ? (s.key === "declined" ? "bg-danger" : "bg-loop") : "bg-line")} />
          ))}
        </div>
      </div>
      <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-3" />
    </ClayCard>
  );
}
