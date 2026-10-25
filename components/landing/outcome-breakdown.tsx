"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useMotionPrefs } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface Outcome {
  label: string;
  value: number;
  /** Tailwind background for the bar segment and legend swatch. */
  swatch: string;
}

/**
 * Where every donated device is now: one stacked bar split into reused, on the
 * bench and recycled, with a hairline legend of counts and shares underneath.
 * Segments draw in left to right the first time it scrolls into view.
 */
export function OutcomeBreakdown({ reused, inProgress, recycled }: { reused: number; inProgress: number; recycled: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { reduced, t } = useMotionPrefs();
  const total = reused + inProgress + recycled;
  const outcomes: Outcome[] = [
    { label: "Back in use", value: reused, swatch: "bg-loop" },
    { label: "On the bench", value: inProgress, swatch: "bg-[#9fd6bd]" },
    { label: "Recycled responsibly", value: recycled, swatch: "bg-[#cfc6b8]" },
  ];
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div ref={ref} className="rounded-[var(--r-md)] border border-line bg-surface-flat">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5 sm:px-7 sm:pt-6">
        <p className="text-small font-semibold">Where every donated device is now</p>
        <p className="font-mono text-[0.75rem] text-ink-3">
          n = <span className="tnum">{total.toLocaleString("en-CA")}</span>
        </p>
      </div>
      <div aria-hidden className="mx-5 mt-5 flex h-3 gap-[3px] sm:mx-7">
        {outcomes.map((o, i) =>
          o.value ? (
            <motion.span
              key={o.label}
              className={cn("h-full origin-left rounded-[3px]", o.swatch)}
              style={{ flexGrow: o.value, flexBasis: 0 }}
              initial={{ scaleX: reduced ? 1 : 0 }}
              animate={{ scaleX: inView || reduced ? 1 : 0 }}
              transition={{ ...t("liquid"), delay: reduced ? 0 : 0.15 + i * 0.12 }}
            />
          ) : null,
        )}
      </div>
      <dl className="mt-6 grid grid-cols-3 border-t border-line">
        {outcomes.map((o, i) => (
          <div key={o.label} className={cn("px-5 py-4 sm:px-7 sm:py-5", i && "border-l border-line")}>
            <dt className="flex items-center gap-2 text-[0.75rem] text-ink-2 sm:text-small">
              <span aria-hidden className={cn("size-2 shrink-0 rounded-[2px]", o.swatch)} />
              {o.label}
            </dt>
            <dd className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-[1.5rem] font-semibold leading-none tracking-[-0.04em] tnum sm:text-[2rem]">{o.value.toLocaleString("en-CA")}</span>
              <span className="font-mono text-[0.75rem] text-ink-3 tnum">{pct(o.value)}%</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
