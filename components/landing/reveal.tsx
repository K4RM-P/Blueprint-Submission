"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Landing entrance: content settles up into place, with a slight scale so it eases in rather
 * than fades up, the first time it scrolls into view. `delay` staggers siblings. Pure CSS
 * transition (`.reveal` in globals.css) toggled by one IntersectionObserver, so it costs almost
 * nothing to hydrate. Reduced motion: a 150ms fade. Print and no-JS: shown as is.
 */
export function Reveal({ children, className, delay = 0, y = 40 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.in = "true";
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ "--reveal-y": `${y}px`, "--reveal-delay": `${delay}s` } as CSSProperties}>
      {children}
    </div>
  );
}
