"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import type { Tint } from "./clay-card";

interface StampProps {
  icon: ReactNode;
  label: string;
  date?: string;
  tint?: Tint;
  done?: boolean;
  size?: "sm" | "md";
  /** Animate pressing into the page when scrolled into view. */
  animateIn?: boolean;
  /** Resting tilt in degrees, like a hand-pressed ink stamp. Defaults to a small tilt derived from the label. */
  tilt?: number;
  className?: string;
}

/** Stable, small, alternating tilt (−4°…+4°) so a column of stamps never looks machine-placed. */
function tiltFor(label: string) {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) | 0;
  return ((Math.abs(h) % 7) - 3) * 1.3;
}

/** Round clay seal that presses onto the card (§8). */
export function Stamp({ icon, label, date, tint = "mint", done = true, size = "md", animateIn = true, tilt, className }: StampProps) {
  const { reduced } = useMotionPrefs();
  const rest = done ? (tilt ?? tiltFor(label)) : 0;
  const live = animateIn && !reduced && done;
  const dim = size === "sm" ? "size-11" : "size-14";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.span
        aria-hidden
        data-tint={done ? tint : "porcelain"}
        className={cn("relative grid shrink-0 place-items-center rounded-full [&_svg]:stroke-[1.75]", dim, done ? "clay-sm text-loop-deep" : "border-2 border-dashed border-line text-ink-3", size === "sm" ? "[&_svg]:size-5" : "[&_svg]:size-6")}
        style={live ? undefined : { rotate: rest }}
        initial={live ? { scale: 1.45, rotate: rest - 12, opacity: 0 } : false}
        whileInView={live ? { scale: [1.45, 0.9, 1], rotate: [rest - 12, rest + 1.5, rest], opacity: [0, 1, 1] } : undefined}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, times: [0, 0.62, 1], ease: [0.3, 0, 0.2, 1] }}
      >
        {/* inked inner ring: reads as a real stamp, not a generic icon disc */}
        {done ? <span aria-hidden className="pointer-events-none absolute inset-[5px] rounded-full border border-dashed border-current opacity-30" /> : null}
        {icon}
      </motion.span>
      <div className="min-w-0">
        <p className={cn("font-semibold leading-snug", done ? "text-ink" : "text-ink-2")}>{label}</p>
        {date ? <p className="text-small text-ink-2 tnum">{date}</p> : null}
      </div>
    </div>
  );
}
