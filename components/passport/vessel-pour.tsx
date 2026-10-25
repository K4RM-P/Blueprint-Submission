"use client";

import { motion } from "motion/react";
import type { BreakdownSlice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useStoryMotion } from "./story-context";

/**
 * "Where your money goes" as a pour: one liquid stream runs down from the
 * source and fills each labelled clay trough to its percentage as it passes.
 * Percentages are printed, so the level is never the only signal (§11).
 */
export function VesselPour({ slices, className, start = 0.5 }: { slices: BreakdownSlice[]; className?: string; start?: number }) {
  const { reduced } = useStoryMotion();
  const step = 0.24;
  return (
    <div className={cn("relative pl-6", className)}>
      {/* the source stream */}
      <span aria-hidden className="absolute bottom-3 left-[7px] top-1 w-[6px] overflow-hidden rounded-full bg-[rgba(23,32,28,.08)]">
        <motion.span
          className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-loop-light to-loop"
          initial={reduced ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={reduced ? { duration: 0.15 } : { duration: slices.length * step + 0.2, delay: start, ease: [0.45, 0, 0.25, 1] }}
        />
      </span>
      <ul className="flex flex-col gap-[1.8cqh]">
        {slices.map((s, i) => (
          <li key={s.label} className="relative">
            {/* spout from the stream into this trough */}
            <motion.span
              aria-hidden
              className="absolute -left-[17px] top-[calc(100%-13px)] h-[5px] w-[17px] origin-left rounded-full bg-loop"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={reduced ? { duration: 0.15 } : { duration: 0.18, delay: start + (i + 0.6) * step }}
            />
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[0.9375rem] font-semibold leading-tight text-ink">{s.label}</span>
              <span className="font-mono text-[0.875rem] text-ink tnum">{s.percent}%</span>
            </div>
            <div data-tint="porcelain" className="well relative mt-1.5 h-[18px] overflow-hidden !rounded-full">
              <motion.div
                className="absolute inset-y-0 left-0 origin-left rounded-full bg-gradient-to-b from-loop-light to-loop"
                style={{ width: `${s.percent}%` }}
                initial={reduced ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 90, damping: 20, mass: 1.2, delay: start + (i + 0.7) * step }}
              >
                <span className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/50" />
              </motion.div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
