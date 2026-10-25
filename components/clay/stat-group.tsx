import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface StatItem {
  label: string;
  value: ReactNode;
  unit?: string;
  /** Optional small print under the label. */
  note?: string;
}

/** Quiet, flat group (use an even number of items) of supporting numbers (Health-style): big figure, plain-language label underneath. */
export function StatGroup({ items, className, label }: { items: StatItem[]; className?: string; label?: string }) {
  return (
    <dl aria-label={label} className={cn("flat grid grid-cols-2 gap-px overflow-hidden bg-line", className)}>
      {items.map((it) => (
        <div key={it.label} className="flex flex-col-reverse justify-end gap-1 bg-surface-flat p-5">
          <dt className="text-small text-ink-2">
            {it.label}
            {it.note ? <span className="mt-0.5 block text-[0.8125rem] text-ink-3">{it.note}</span> : null}
          </dt>
          <dd className="font-display tnum text-[2rem] leading-none text-ink">
            {it.value}
            {it.unit ? <span className="ml-1 font-sans text-base font-medium tracking-normal text-ink-2">{it.unit}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
