import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Floating paths (adapted from 21st.dev): 36 hairline curves sweeping across like a current,
 * drawn in the inherited text colour. Rendered on the server and held still: each path's dash
 * sits at its own seeded offset, so the current reads as flowing without an endless animation
 * (UI §12.9) or any client JavaScript on the landing hero.
 */
export function FloatingPathsBackground({ position, children, className }: { position: number; className?: string; children?: ReactNode }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
    offset: -((i * 7) % 10) / 10,
  }));

  return (
    <div className={cn("floating-paths relative w-full", className)}>
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
              style={{ "--offset": p.offset } as CSSProperties}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  );
}
