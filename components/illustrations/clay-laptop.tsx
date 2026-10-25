"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useId, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

/** Chunky clay laptop drawn in SVG, light from top-left; pointer light on desktop (§6.4, §7.3). */
export function ClayLaptop({
  className,
  pointerLight = true,
  tint = "apricot",
  opening = false,
}: {
  className?: string;
  pointerLight?: boolean;
  tint?: "apricot" | "mint" | "porcelain";
  /** Landing hero only: the lid lifts open on load and a baton runs the on-screen relay lane once (CSS, reduced-motion safe). */
  opening?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const { reduced, lowPower } = useMotionPrefs();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 170, damping: 24 });
  const sy = useSpring(my, { stiffness: 170, damping: 24 });
  const live = pointerLight && !reduced && !lowPower;

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!live || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 20);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 20);
  };

  const body = { apricot: ["#FFE9DA", "#F7C8A6", "#E2915F"], mint: ["#E6F7EE", "#BDE6D1", "#6FBF98"], porcelain: ["#FFFFFF", "#EDE6DB", "#C9BBA7"] }[tint];

  return (
    <svg
      viewBox="0 0 400 300"
      className={cn("block h-auto w-full", className)}
      role="img"
      aria-label="A refurbished laptop, drawn as a soft clay object"
      onPointerMove={onMove}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <defs>
        <radialGradient id={`lid-${id}`} cx="30%" cy="22%" r="90%">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="0.6" stopColor={body[1]} />
          <stop offset="1" stopColor={body[2]} />
        </radialGradient>
        <radialGradient id={`base-${id}`} cx="28%" cy="10%" r="95%">
          <stop offset="0" stopColor={body[0]} />
          <stop offset="0.7" stopColor={body[1]} />
          <stop offset="1" stopColor={body[2]} />
        </radialGradient>
        <linearGradient id={`screen-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#21302A" />
          <stop offset="1" stopColor="#17201C" />
        </linearGradient>
        <linearGradient id={`liq-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2FBF8A" />
          <stop offset="1" stopColor="#138A61" />
        </linearGradient>
        <filter id={`drop-${id}`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#B0602E" floodOpacity="0.22" />
        </filter>
        <radialGradient id={`light-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="270" rx="150" ry="14" fill="#B0602E" opacity="0.12" />
      <g filter={`url(#drop-${id})`}>
        {/* lid + screen: a tiny relay lane with three stations and a baton at the finish */}
        <g className={opening ? "laptop-lid" : undefined}>
          <rect x="70" y="28" width="260" height="178" rx="30" fill={`url(#lid-${id})`} />
          <rect x="88" y="45" width="224" height="144" rx="18" fill={`url(#screen-${id})`} />
          <rect x="116" y="112" width="168" height="12" rx="6" fill="#2B3B34" />
          <rect className={opening ? "laptop-lane-fill" : undefined} x="116" y="112" width="168" height="12" rx="6" fill={`url(#liq-${id})`} />
          {[124, 200, 276].map((cx, i) => (
            <circle key={cx} className={opening ? `laptop-node laptop-node-${i}` : undefined} cx={cx} cy="118" r="9" fill="#2FBF8A" stroke="#17201C" strokeWidth="4" />
          ))}
          <g className={opening ? "laptop-baton" : undefined}>
            <rect x="244" y="98" width="46" height="20" rx="10" fill="#F6F1E9" />
            <rect x="254" y="103" width="26" height="10" rx="5" fill={`url(#liq-${id})`} />
            <rect x="249" y="100.5" width="16" height="2.5" rx="1.25" fill="#fff" />
          </g>
          <rect x="96" y="52" width="80" height="10" rx="5" fill="#ffffff" opacity="0.08" />
        </g>
        {/* base */}
        <path d="M44 214 h312 a14 14 0 0 1 13 19 l-6 14 a22 22 0 0 1 -20 13 h-286 a22 22 0 0 1 -20 -13 l-6 -14 a14 14 0 0 1 13 -19 z" fill={`url(#base-${id})`} />
        <rect x="170" y="220" width="60" height="9" rx="4.5" fill={body[2]} opacity="0.45" />
        <path d="M60 218 h280" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
      </g>
      {live ? (
        <motion.circle cx="140" cy="80" r="70" fill={`url(#light-${id})`} style={{ x: sx, y: sy }} pointerEvents="none" />
      ) : (
        <circle cx="140" cy="80" r="70" fill={`url(#light-${id})`} pointerEvents="none" />
      )}
    </svg>
  );
}
