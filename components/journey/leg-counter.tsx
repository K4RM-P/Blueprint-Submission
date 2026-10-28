"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

export interface Leg {
  label: string;
  done: boolean;
}

/**
 * Leg counter (Signature Moment 5): a small sticky pill above the journey that reads
 * "Leg 3 of 3 · Now with its next owner" and fills like a relay track as you scroll
 * through the stamps. Completed legs settle liquid-green; legs still to come stay
 * dashed. It only sticks while the journey section is on screen.
 */
export function LegCounter({ legs, status, current: currentLeg, children }: { legs: Leg[]; status: string; current?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 70%"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 1.2 });
  const doneCount = legs.filter((l) => l.done).length;
  // The story's leg (lib/passport-story) wins when given, so the passport and its story never disagree.
  const current = currentLeg ?? Math.min(legs.length, Math.max(1, doneCount));

  return (
    <div ref={ref} className="relative">
      <div className="no-print sticky top-[84px] z-20 -mt-2 mb-6 flex justify-center sm:justify-start">
        <div className="glass flex items-center gap-3 rounded-full py-2 pl-3 pr-4" role="status">
          <div className="flex gap-1" aria-hidden>
            {legs.map((l, i) => (
              <LegSegment key={l.label} index={i} count={legs.length} done={l.done} progress={p} reduced={reduced} />
            ))}
          </div>
          <p className="text-small text-ink">
            <span className="font-semibold tnum">
              Leg {current} of {legs.length}
            </span>
            <span className="text-ink-2"> · {status}</span>
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function LegSegment({ index, count, done, progress, reduced }: { index: number; count: number; done: boolean; progress: MotionValue<number>; reduced: boolean }) {
  const fill = useTransform(progress, (v) => (reduced ? 1 : Math.max(0, Math.min(1, v * count - index))));
  return (
    <span className={cn("relative h-2 w-7 overflow-hidden rounded-full", done ? "bg-[#E1D9CC]" : "border border-dashed border-[#CFC5B6]")}>
      {done ? <motion.span className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-loop-light to-loop" style={{ scaleX: fill }} /> : null}
    </span>
  );
}
