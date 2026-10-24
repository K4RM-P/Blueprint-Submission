"use client";

import { motion } from "motion/react";
import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import { LiquidFill } from "./liquid-fill";

export interface GlassWeek {
  week: string;
  label: string;
  sublabel?: string;
  load: number;
  capacity: number;
  status: "open" | "limited" | "full";
}

interface CapacityGlassesProps {
  weeks: GlassWeek[];
  value?: string | null;
  onSelect?: (week: string) => void;
  /** Allow choosing full weeks (staff override). */
  allowFull?: boolean;
  label: string;
  className?: string;
}

const statusText = { open: "Open", limited: "Limited", full: "Full" } as const;

/** One small clay glass per week, filled to that week's load; full weeks get a lid (§8). */
export function CapacityGlasses({ weeks, value, onSelect, allowFull, label, className }: CapacityGlassesProps) {
  const { t } = useMotionPrefs();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const interactive = Boolean(onSelect);

  const selectable = (w: GlassWeek) => allowFull || w.status !== "full";

  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    let n = i;
    for (let k = 0; k < weeks.length; k++) {
      n = (n + dir + weeks.length) % weeks.length;
      if (selectable(weeks[n])) break;
    }
    onSelect?.(weeks[n].week);
    refs.current[n]?.focus();
  };

  const firstSelectable = weeks.findIndex(selectable);

  return (
    <div role={interactive ? "radiogroup" : "list"} aria-label={label} className={cn("grid grid-cols-4 gap-3 sm:grid-cols-8", className)}>
      {weeks.map((w, i) => {
        const selected = value === w.week;
        const disabled = !selectable(w);
        const pct = w.capacity > 0 ? w.load / w.capacity : 1;
        const inner = (
          <>
            <div className="relative mx-auto h-16 w-12">
              {w.status === "full" ? <span aria-hidden className="absolute -top-1.5 left-1/2 z-[1] h-2 w-11 -translate-x-1/2 rounded-full bg-[#d8cfc2]" /> : null}
              <LiquidFill value={Math.min(pct, 1)} shape="glass" calm className="size-full" />
            </div>
            <span className="mt-2 block text-small font-semibold text-ink tnum">{w.label}</span>
            <span className={cn("block text-[0.8125rem] font-medium", w.status === "full" ? "text-danger-ink" : w.status === "limited" ? "text-[#8a6100]" : "text-loop-deep")}>
              {statusText[w.status]}
            </span>
            {w.sublabel ? <span className="block text-[0.75rem] text-ink-2 tnum">{w.sublabel}</span> : null}
          </>
        );
        if (!interactive) {
          return (
            <div key={w.week} role="listitem" className="text-center" aria-label={`${w.label}: ${statusText[w.status]}, ${w.load} of ${w.capacity} devices`}>
              {inner}
            </div>
          );
        }
        return (
          <motion.button
            key={w.week}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={disabled || undefined}
            aria-label={`Week of ${w.label}: ${statusText[w.status]}, ${w.load} of ${w.capacity} devices booked`}
            tabIndex={selected || (!value && i === firstSelectable) ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => !disabled && onSelect?.(w.week)}
            data-tint={selected ? "mint" : "porcelain"}
            animate={{ scale: selected ? 0.97 : 1 }}
            transition={t("press")}
            className={cn(
              "clay-sm rounded-[20px] px-1 py-3 text-center",
              selected && "clay-sunk ring-2 ring-loop",
              disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5",
            )}
          >
            {inner}
          </motion.button>
        );
      })}
    </div>
  );
}
