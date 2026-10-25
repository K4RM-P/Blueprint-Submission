"use client";

import { useEffect, useId, useRef } from "react";
import type { MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

const BALLS = [
  { cx: 520, cy: 230, r: 150, fill: "#CDEEDD", anim: "meta-a", dur: 23 },
  { cx: 690, cy: 380, r: 110, fill: "#CDEEDD", anim: "meta-b", dur: 19 },
  { cx: 380, cy: 420, r: 95, fill: "#FFE0CB", anim: "meta-c", dur: 26 },
  { cx: 760, cy: 160, r: 70, fill: "#FFE0CB", anim: "meta-b", dur: 31 },
];

/**
 * Fluid backdrop (§7.2): a few mint/apricot metaballs that drift, merge and split,
 * with one ball pulled gently toward the pointer. One SVG layer, one filter,
 * transform-only motion. The parent decides when it runs: desktop, not low-power,
 * not reduced motion. `still` renders the same shapes without animation.
 */
export function Metaballs({ className, pullX, pullY, still }: { className?: string; pullX?: MotionValue<number>; pullY?: MotionValue<number>; still?: boolean }) {
  const id = useId().replace(/:/g, "");
  const pullRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = pullRef.current;
    if (!el || !pullX || !pullY || still) return;
    const set = () => el.setAttribute("transform", `translate(${pullX.get().toFixed(1)} ${pullY.get().toFixed(1)})`);
    const a = pullX.on("change", set);
    const b = pullY.on("change", set);
    return () => {
      a();
      b();
    };
  }, [pullX, pullY, still]);

  return (
    <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" className={cn("pointer-events-none", className)} aria-hidden>
      <defs>
        <filter id={`goo-${id}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="26" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="g" />
          <feGaussianBlur in="g" stdDeviation="10" />
        </filter>
      </defs>
      <g filter={`url(#goo-${id})`}>
        {BALLS.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.fill} className={still ? undefined : "metaball"} style={still ? undefined : { animationName: b.anim, animationDuration: `${b.dur}s` }} />
        ))}
        <circle ref={pullRef} cx={600} cy={300} r={80} fill="#CDEEDD" />
      </g>
    </svg>
  );
}
