import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Stamp } from "@/components/clay/stamp";
import { FlowLine } from "@/components/liquid/flow-line";
import type { Tint } from "@/components/clay/clay-card";

export interface JourneyStep {
  key: string;
  label: string;
  date?: string | null;
  done: boolean;
  icon: ReactNode;
  tint?: Tint;
  /** Highlight the step that is happening now. */
  current?: boolean;
  detail?: ReactNode;
}

/**
 * Signature journey timeline (PRD §15, UI §8): vertical FlowLine with stamp
 * nodes, or a compact horizontal track for cards and tables.
 */
export function JourneyTimeline({ steps, orientation = "vertical", label, scrollLinked = true, className }: { steps: JourneyStep[]; orientation?: "vertical" | "horizontal"; label: string; scrollLinked?: boolean; className?: string }) {
  const doneCount = steps.filter((s) => s.done).length;
  const progress = steps.length > 1 ? Math.max(0, doneCount - 1) / (steps.length - 1) : 1;

  if (orientation === "horizontal") {
    return (
      <ol aria-label={label} className={cn("flex w-full items-start", className)}>
        {steps.map((s, i) => (
          <li key={s.key} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {i > 0 ? (
              <span aria-hidden className="absolute right-[calc(50%+13px)] top-[13px] z-0 h-1 w-[calc(100%-26px)] -translate-y-1/2 rounded-full bg-[#e7e0d5]">
                <span className={cn("block h-full rounded-full bg-gradient-to-r from-loop to-loop-light", s.done ? "w-full" : "w-0")} />
              </span>
            ) : null}
            <span
              aria-hidden
              className={cn(
                "relative z-[1] grid size-[26px] place-items-center rounded-full",
                s.done ? "bg-loop text-white" : s.current ? "border-2 border-loop bg-surface" : "border-2 border-line bg-surface",
              )}
            >
              {s.done ? <Check className="size-3.5" strokeWidth={3} /> : null}
            </span>
            <span className={cn("mt-2 block px-0.5 text-[0.75rem] font-medium leading-tight", s.done || s.current ? "text-ink" : "text-ink-3")}>{s.label}</span>
            {s.date ? <span className="block text-[0.6875rem] text-ink-2 tnum">{s.date}</span> : null}
            <span className="sr-only">{s.done ? "done" : s.current ? "in progress" : "not yet"}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <FlowLine progress={progress} scrollLinked={scrollLinked} className={className}>
      <ol aria-label={label} className="flex flex-col gap-7">
        {steps.map((s) => (
          <li key={s.key} className="flex flex-col gap-1">
            <Stamp icon={s.icon} label={s.label} date={s.date ?? (s.done ? undefined : s.current ? "In progress" : "Not yet")} tint={s.tint} done={s.done} />
            {s.detail ? <div className="ml-[68px] text-small text-ink-2">{s.detail}</div> : null}
          </li>
        ))}
      </ol>
    </FlowLine>
  );
}
