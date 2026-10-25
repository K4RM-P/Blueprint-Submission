"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useMotionPrefs } from "@/lib/motion";

const MAX = 48;

/**
 * Impact that grows (Signature Moment 8): one small clay pebble per person your
 * laptops now help, popping in with a staggered spring the first time the tile is
 * seen. Past 48 the row ends with a "+N" pebble so it never becomes a wall.
 */
export function PeoplePebbles({ count }: { count: number }) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const { reduced } = useMotionPrefs();
  if (count <= 0) return null;
  const shown = Math.min(count, MAX);
  const extra = count - shown;
  const step = Math.min(0.045, 0.9 / shown);

  return (
    <ul ref={ref} className="flex flex-wrap gap-1.5" aria-hidden>
      {Array.from({ length: shown }, (_, i) => (
        <motion.li
          key={i}
          className="size-5 rounded-full bg-[#F4FBF7] shadow-[inset_1.5px_1.5px_3px_rgba(255,255,255,.95),inset_-2px_-2.5px_4px_rgba(19,138,97,.28),0_3px_6px_-2px_rgba(19,138,97,.35)]"
          initial={reduced ? false : { scale: 0, y: 6 }}
          animate={inView || reduced ? { scale: 1, y: 0 } : undefined}
          transition={reduced ? undefined : { type: "spring", stiffness: 320, damping: 16, delay: 0.15 + i * step }}
        >
          <span className="m-auto mt-[6px] block size-2 rounded-full bg-gradient-to-br from-loop-light to-loop" />
        </motion.li>
      ))}
      {extra > 0 ? (
        <motion.li
          className="grid h-5 place-items-center rounded-full bg-white/80 px-2 text-[0.6875rem] font-semibold text-loop-deep tnum"
          initial={reduced ? false : { opacity: 0 }}
          animate={inView || reduced ? { opacity: 1 } : undefined}
          transition={{ delay: 0.15 + shown * step }}
        >
          +{extra}
        </motion.li>
      ) : null}
    </ul>
  );
}
