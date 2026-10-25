"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

export interface PipelineStage {
  label: string;
  value: number;
  /** Off the main line (e.g. recycled): drawn in a quieter tone. */
  muted?: boolean;
}

/**
 * Pipeline flow bar (Signature Moment 13): the whole pipeline as one clay well,
 * each stage a liquid segment sized by its device count. It pours in left-to-right
 * once; when a bulk action moves devices on, the segments re-flow with the liquid
 * spring. Counts are always printed underneath (never colour alone).
 */
export function PipelineTrack({ stages, label }: { stages: PipelineStage[]; label: string }) {
  const { reduced, t } = useMotionPrefs();
  const total = stages.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <figure aria-label={label}>
      <div className="well h-11 overflow-hidden rounded-full p-1.5" aria-hidden>
        <motion.div
          className="flex h-full origin-left gap-[3px] overflow-hidden rounded-full"
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={t("liquid")}
        >
          {stages.map((s, i) =>
            s.value > 0 ? (
              <motion.div
                key={s.label}
                layout={!reduced}
                transition={t("liquid")}
                className="relative h-full min-w-[10px] first:rounded-l-full last:rounded-r-full"
                style={{
                  flexGrow: s.value,
                  flexBasis: 0,
                  // deeper green the further down the line a device has travelled
                  background: s.muted ? "#C9C1B4" : `color-mix(in srgb, #0B5E42 ${Math.round((i / Math.max(1, stages.length - 2)) * 70)}%, #5BD3A4)`,
                }}
              >
                <span className="absolute inset-x-1.5 top-1 h-1 rounded-full bg-white/35" />
              </motion.div>
            ) : null,
          )}
        </motion.div>
      </div>
      <ol className="mt-5 grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-5">
        {stages.map((s) => (
          <li key={s.label} className="min-w-0">
            <p className={cn("font-display text-[1.5rem] leading-none tnum", s.value === 0 ? "text-ink-3" : "text-ink")}>{s.value}</p>
            <p className="mt-1 truncate text-[0.8125rem] text-ink-2">{s.label}</p>
          </li>
        ))}
      </ol>
      <figcaption className="sr-only">
        {stages.map((s) => `${s.label}: ${s.value} of ${total}`).join("; ")}
      </figcaption>
    </figure>
  );
}
