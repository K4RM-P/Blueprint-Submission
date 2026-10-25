"use client";

import { useInView } from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Floating paths (adapted from 21st.dev): 36 hairline curves that sweep across
 * like a current, drawn in the inherited text colour. The sweep is a CSS dash
 * animation (no per-frame JS for 36 paths); durations are seeded per path so
 * server and client match. Loops pause offscreen; reduced motion rests them.
 */
export function FloatingPathsBackground({ position, children, className }: { position: number; className?: string; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    duration: 20 + ((i * 37) % 10),
  }));

  return (
    <div ref={ref} data-live={inView ? "true" : "false"} className={cn("floating-paths relative w-full", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <svg className="h-full w-full" viewBox="0 0 696 316" preserveAspectRatio="xMidYMid slice" fill="none">
          {paths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              pathLength={1}
              className="float-path"
              stroke="currentColor"
              strokeWidth={p.width}
              strokeOpacity={0.1 + p.id * 0.03}
              style={{ "--dur": `${p.duration}s`, "--delay": `-${(p.id * 7) % p.duration}s` } as CSSProperties}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
}
