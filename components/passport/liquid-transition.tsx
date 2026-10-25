"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { springs } from "@/lib/motion";
import type { StoryTint } from "@/lib/passport-story";

const TINT_HEX: Record<StoryTint, string> = { porcelain: "#F4F0E9", apricot: "#FFE0CB", sky: "#DCEAFE", butter: "#FFF1BF", mint: "#D7F1E4", forest: "#0A3D2B" };

/** A wide, soft wave band, 200 units across so it reads as liquid, not a zigzag. */
const WAVE = "M0 22 C 25 6, 50 6, 75 20 S 125 36, 150 20 S 190 8, 200 16 V 44 H 0 Z";

/**
 * The story's one transition: the next slide's tint rises like liquid from the
 * bottom edge (top edge when going back), riding a wave with a bright meniscus,
 * while the previous slide sinks back. Clip + transform only. Reduced motion:
 * a 150ms crossfade.
 */
export function LiquidTransition({ children, dir, tint, reduced }: { children: ReactNode; dir: 1 | -1 | 0; tint: StoryTint; reduced: boolean }) {
  const p = useMotionValue(dir === 0 || reduced ? 1 : 0);
  useEffect(() => {
    if (dir === 0 || reduced) return;
    const a = animate(p, 1, { ...springs.soft, stiffness: 120, damping: 22 });
    return () => a.stop();
  }, [p, dir, reduced]);

  const forward = dir >= 0;
  const clip = useTransform(p, (v) => {
    const hidden = `${((1 - v) * 104).toFixed(2)}%`;
    return forward ? `inset(${hidden} 0 0 0)` : `inset(0 0 ${hidden} 0)`;
  });
  const waveY = useTransform(p, (v) => `${(1 - v) * 104}cqh`);
  const waveYBack = useTransform(p, (v) => `${-(1 - v) * 104}cqh`);
  const waveOpacity = useTransform(p, [0, 0.85, 1], [1, 1, 0]);

  if (reduced) {
    return (
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.15 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{ zIndex: 2 }}
      exit={{ scale: 0.94, opacity: 0.4, zIndex: 1, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }}
    >
      <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
        {children}
      </motion.div>
      {dir !== 0 ? (
        <motion.svg
          aria-hidden
          viewBox="0 0 200 44"
          preserveAspectRatio="none"
          className="story-wave"
          style={forward ? { top: -30, y: waveY, opacity: waveOpacity } : { bottom: -30, y: waveYBack, opacity: waveOpacity, scaleY: -1 }}
        >
          <path d={WAVE} fill={TINT_HEX[tint]} />
          <path d={WAVE.split(" V")[0]} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
        </motion.svg>
      ) : null}
    </motion.div>
  );
}
