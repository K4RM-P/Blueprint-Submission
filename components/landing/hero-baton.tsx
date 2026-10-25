"use client";

import { useEffect, useId, useRef } from "react";
import type { MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/* Window into the liquid core, in the 600×160 viewBox. */
const WIN = { x: 118, y: 46, w: 364, h: 60 };
const LEVEL = 70;
const PERIOD = 91; // 4 waves per window width, so a 364px drift loops seamlessly

/** A wave strip twice the window's width, starting one window-width to the left. */
function wave(amp: number, closed: boolean) {
  const x0 = WIN.x - WIN.w;
  let d = `M${x0} ${LEVEL}`;
  for (let x = x0; x < WIN.x + WIN.w; x += PERIOD) d += ` q${PERIOD / 4} ${-amp} ${PERIOD / 2} 0 t${PERIOD / 2} 0`;
  return closed ? `${d} V140 H${x0} Z` : d;
}
const FRONT = wave(4, true);
const BACK = wave(5.5, true);
const MENISCUS = wave(4, false);

const BUBBLES = [
  { y: 88, r: 2.6, dur: 7.5, delay: 0 },
  { y: 97, r: 1.8, dur: 9, delay: 2.2 },
  { y: 82, r: 1.6, dur: 8.2, delay: 4.1 },
  { y: 93, r: 3, dur: 10.5, delay: 5.6 },
];

/** Write an SVG transform attribute straight from a motion value: no React render per frame. */
function useAttr(ref: React.RefObject<SVGGElement | null>, mv: MotionValue<number> | undefined, fmt: (v: number) => string) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !mv) return;
    const set = (v: number) => el.setAttribute("transform", fmt(v));
    set(mv.get());
    return mv.on("change", set);
  }, [ref, mv, fmt]);
}
const sloshFmt = (v: number) => `rotate(${v.toFixed(2)} 300 ${LEVEL})`;

/**
 * The hero baton: a long porcelain clay capsule with an apricot band (the business
 * that hands it over) and a mint band (its next owner). A glass window shows the
 * green liquid core flowing left → right, the direction of the handoff. Pointer
 * input moves the specular highlight and sloshes the liquid against the tilt.
 * CSS drives the flow loop (paused when the hero is offscreen or motion is reduced).
 */
export function HeroBaton({
  className,
  lightX,
  lightY,
  slosh,
}: {
  className?: string;
  lightX?: MotionValue<number>;
  lightY?: MotionValue<number>;
  slosh?: MotionValue<number>;
}) {
  const id = useId().replace(/:/g, "");
  const sloshRef = useRef<SVGGElement>(null);
  const lightRef = useRef<SVGGElement>(null);
  useAttr(sloshRef, slosh, sloshFmt);
  useEffect(() => {
    const el = lightRef.current;
    if (!el || !lightX || !lightY) return;
    const set = () => el.setAttribute("transform", `translate(${lightX.get().toFixed(2)} ${lightY.get().toFixed(2)})`);
    set();
    const a = lightX.on("change", set);
    const b = lightY.on("change", set);
    return () => {
      a();
      b();
    };
  }, [lightX, lightY]);

  return (
    <svg viewBox="0 0 600 160" className={cn("block overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`shell-${id}`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.42" stopColor="#F7F2EA" />
          <stop offset="1" stopColor="#DFD3C0" />
        </linearGradient>
        <radialGradient id={`shade-${id}`} cx="0.78" cy="1.15" r="0.9">
          <stop offset="0" stopColor="rgba(140,110,75,0.32)" />
          <stop offset="1" stopColor="rgba(140,110,75,0)" />
        </radialGradient>
        <linearGradient id={`liq-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3FD09A" />
          <stop offset="0.45" stopColor="#1FA673" />
          <stop offset="1" stopColor="#0B5E42" />
        </linearGradient>
        <linearGradient id={`well-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCD3C4" />
          <stop offset="0.5" stopColor="#EEE8DE" />
          <stop offset="1" stopColor="#F5F1EA" />
        </linearGradient>
        <clipPath id={`body-${id}`}>
          <rect x="6" y="14" width="588" height="124" rx="62" />
        </clipPath>
        <clipPath id={`win-${id}`}>
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={WIN.h / 2} />
        </clipPath>
        <filter id={`soft-${id}`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id={`spec-${id}`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* tinted contact shadow (never grey, §12.5) */}
      <ellipse cx="300" cy="150" rx="250" ry="9" fill="#0B5E42" opacity="0.2" filter={`url(#soft-${id})`} />
      <ellipse cx="330" cy="136" rx="270" ry="14" fill="#8A6A45" opacity="0.14" filter={`url(#soft-${id})`} />

      <g clipPath={`url(#body-${id})`}>
        <rect x="6" y="14" width="588" height="124" fill={`url(#shell-${id})`} />
        {/* the two hands: apricot band (business) → mint band (new owner) */}
        <rect x="66" y="14" width="18" height="124" fill="#FFCBA8" />
        <rect x="84" y="14" width="2" height="124" fill="#fff" opacity="0.7" />
        <rect x="516" y="14" width="18" height="124" fill="#A9E3C8" />
        <rect x="534" y="14" width="2" height="124" fill="#fff" opacity="0.7" />
        <rect x="6" y="14" width="588" height="124" fill={`url(#shade-${id})`} />
        {/* inner top-left light, bottom-right shade, like the .clay recipe */}
        <rect x="6" y="14" width="588" height="124" rx="62" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="5" transform="translate(2 3)" />
        <rect x="6" y="14" width="588" height="124" rx="62" fill="none" stroke="rgba(120,92,60,0.16)" strokeWidth="8" transform="translate(-3 -4)" />
      </g>

      {/* window into the liquid core */}
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={WIN.h / 2} fill={`url(#well-${id})`} />
      <g clipPath={`url(#win-${id})`}>
        <g className="baton-liquid">
          <g ref={sloshRef}>
            <g className="baton-wave-slow">
              <path d={BACK} fill="#2FBF8A" opacity="0.45" transform="translate(0 -3)" />
            </g>
            <g className="baton-wave">
              <path d={FRONT} fill={`url(#liq-${id})`} />
              <path d={MENISCUS} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
            </g>
            {BUBBLES.map((b, i) => (
              <circle
                key={i}
                className="baton-bubble"
                cx={WIN.x}
                cy={b.y}
                r={b.r}
                fill="#fff"
                style={{ animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
              />
            ))}
          </g>
        </g>
        {/* inner shadow along the top of the window */}
        <rect x={WIN.x} y={WIN.y - 8} width={WIN.w} height="14" rx="7" fill="rgba(90,70,45,0.16)" filter={`url(#spec-${id})`} />
      </g>
      <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={WIN.h / 2} fill="none" stroke="rgba(90,75,55,0.22)" strokeWidth="1.25" />
      {/* glass glint on the window */}
      <rect x={WIN.x + 22} y={WIN.y + 7} width="170" height="5" rx="2.5" fill="#fff" opacity="0.6" />

      {/* specular highlight that follows the pointer (≤10px, §7.3) */}
      <g ref={lightRef}>
        <ellipse cx="190" cy="31" rx="120" ry="6.5" fill="#fff" opacity="0.95" filter={`url(#spec-${id})`} />
        <circle cx="38" cy="66" r="5" fill="#fff" opacity="0.7" filter={`url(#spec-${id})`} />
      </g>
    </svg>
  );
}
