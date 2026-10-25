"use client";

import { motion, type MotionValue } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

export type VesselShape = "vessel" | "glass" | "pill" | "jar" | "rect";

/** Clip paths in a 100×100 box. */
const shapes: Record<VesselShape, string> = {
  vessel: "M22 8 h56 a6 6 0 0 1 6 6 v4 c0 6 -4 8 -4 14 v46 a14 14 0 0 1 -14 14 h-32 a14 14 0 0 1 -14 -14 v-46 c0 -6 -4 -8 -4 -14 v-4 a6 6 0 0 1 6 -6 z",
  glass: "M14 4 h72 l-8 84 a8 8 0 0 1 -8 8 h-40 a8 8 0 0 1 -8 -8 z",
  jar: "M30 2 h40 a4 4 0 0 1 4 4 v6 a4 4 0 0 1 -2 3 c10 4 16 12 16 24 v45 a14 14 0 0 1 -14 14 h-48 a14 14 0 0 1 -14 -14 v-45 c0 -12 6 -20 16 -24 a4 4 0 0 1 -2 -3 v-6 a4 4 0 0 1 4 -4 z",
  pill: "M0 50 a50 50 0 0 1 50 -50 h0 a50 50 0 0 1 50 50 v0 a50 50 0 0 1 -50 50 h0 a50 50 0 0 1 -50 -50 z",
  rect: "M0 0 h100 v100 h-100 z",
};

/** Two periods of a sine-ish wave, 200 wide, so drifting by -50% loops seamlessly. */
function wavePath(amp: number, phase: number) {
  const w = 25;
  let d = `M0 ${amp + phase}`;
  for (let x = 0; x < 200; x += w * 2) {
    d += ` q ${w / 2} ${-amp * 2} ${w} 0 t ${w} 0`;
  }
  return `${d} V 140 H 0 Z`;
}

interface LiquidFillProps {
  /** 0..1 */
  value: number;
  shape?: VesselShape;
  color?: "loop" | "ember";
  className?: string;
  /** Draw the vessel outline. */
  outline?: boolean;
  /** Smaller amplitude for tiny glasses. */
  calm?: boolean;
  /** Slosh: rotate the liquid body (degrees) around the vessel's centre. */
  tilt?: MotionValue<number>;
}

/** SVG vessel whose liquid level springs to `value` with a drifting wave surface (§7.2.2). */
export function LiquidFill({ value, shape = "vessel", color = "loop", className, outline = true, calm, tilt }: LiquidFillProps) {
  const uid = useId().replace(/:/g, "");
  const { reduced, t } = useMotionPrefs();
  const level = Math.max(0, Math.min(1, value));
  const amp = calm ? 2 : 3.5;
  // Keep a sliver of liquid visible at 0 so empty still reads as a vessel.
  const y = 100 - level * 100 - (level >= 1 ? 6 : 0);
  const [c1, c2] = color === "ember" ? ["#C9501C", "#F58A57"] : ["#138A61", "#2FBF8A"];

  return (
    <svg viewBox="0 0 100 100" className={cn("block", className)} aria-hidden preserveAspectRatio="none">
      <defs>
        <clipPath id={`clip-${uid}`}>
          <path d={shapes[shape]} />
        </clipPath>
        <linearGradient id={`liq-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={c2} />
          <stop offset="1" stopColor={c1} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#clip-${uid})`}>
        <path d={shapes[shape]} fill="#F7F4EE" />
        <motion.g style={tilt ? { rotate: tilt, transformOrigin: "50px 60px", transformBox: "view-box" } : undefined}>
        <motion.g initial={false} animate={{ y }} transition={t("liquid")}>
          <g className={reduced ? undefined : "liquid-wave-slow"} style={{ transformBox: "fill-box" }}>
            <path d={wavePath(amp, 1)} fill={`url(#liq-${uid})`} opacity={0.5} transform="translate(-6 -3)" />
          </g>
          <g className={reduced ? undefined : "liquid-wave"} style={{ transformBox: "fill-box" }}>
            <path d={wavePath(amp, 0)} fill={`url(#liq-${uid})`} />
            {/* meniscus */}
            <path d={wavePath(amp, 0).split(" V")[0]} fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
          </g>
        </motion.g>
        </motion.g>
        {/* glass highlight, top-left light */}
        <path d={shapes[shape]} fill="none" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={6} transform="translate(2 2)" />
      </g>
      {outline ? <path d={shapes[shape]} fill="none" stroke="rgba(90,75,55,.22)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" /> : null}
    </svg>
  );
}
