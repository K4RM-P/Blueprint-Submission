"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Stamp } from "@/components/clay";
import type { Tint } from "@/components/clay/clay-card";
import { cn } from "@/lib/utils";
import { useStoryMotion } from "./story-context";

export interface SequenceStamp {
  key: string;
  label: string;
  date?: string;
  icon: ReactNode;
  done: boolean;
  tint?: Tint;
}

/**
 * Stamps pressing onto the page one after another, joined by a liquid line that
 * fills down to the last completed step. Pending steps stay as dashed outlines.
 */
export function StampSequence({ stamps, className, start = 0.45, gap = 0.28 }: { stamps: SequenceStamp[]; className?: string; start?: number; gap?: number }) {
  const { reduced } = useStoryMotion();
  const doneCount = stamps.filter((s) => s.done).length;
  const fill = stamps.length > 1 ? Math.max(0, doneCount - 1) / (stamps.length - 1) : 0;
  return (
    <ol className={cn("relative flex flex-col gap-[2.2cqh]", className)}>
      <span aria-hidden className="absolute bottom-[22px] left-[21px] top-[22px] w-[3px] rounded-full bg-[rgba(23,32,28,.1)]">
        <motion.span
          className="absolute inset-x-0 top-0 h-full origin-top rounded-full bg-gradient-to-b from-loop-light to-loop"
          initial={reduced ? false : { scaleY: 0 }}
          animate={{ scaleY: fill }}
          transition={reduced ? { duration: 0.15 } : { duration: Math.max(0.3, doneCount * gap), delay: start, ease: [0.4, 0, 0.2, 1] }}
        />
      </span>
      {stamps.map((s, i) => (
        <motion.li
          key={s.key}
          className="relative"
          initial={reduced || !s.done ? { opacity: s.done ? 1 : 0 } : { opacity: 0, scale: 1.35, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={reduced ? { duration: 0.15 } : s.done ? { type: "spring", stiffness: 520, damping: 22, delay: start + i * gap } : { duration: 0.4, delay: start + doneCount * gap }}
        >
          <Stamp icon={s.icon} label={s.label} date={s.date} done={s.done} tint={s.tint ?? "butter"} size="sm" animateIn={false} />
        </motion.li>
      ))}
    </ol>
  );
}
