"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useMotionPrefs } from "@/lib/motion";

const fmt = (n: number, decimals: number) => n.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * A number that springs up from zero once, the first time it scrolls into view. The server renders
 * the final value (no "0" without JS, in print or for crawlers); numbers already on screen at
 * hydration stay put instead of flashing back to zero. Screen readers get the final value.
 */
export function CountUp({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const { reduced } = useMotionPrefs();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => fmt(v, decimals));
  const armed = useRef(false);

  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    const offscreen = !r || r.top > window.innerHeight || r.bottom < 0;
    if (!reduced && offscreen) {
      armed.current = true;
      mv.set(0);
    }
  }, [reduced, mv]);

  useEffect(() => {
    if (reduced || !armed.current) return mv.set(value);
    if (!inView) return;
    const c = animate(mv, value, { type: "spring", stiffness: 50, damping: 18, mass: 1 });
    return () => c.stop();
  }, [inView, reduced, value, mv]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{fmt(value, decimals)}</span>
      <motion.span aria-hidden className="tnum">
        {text}
      </motion.span>
    </span>
  );
}
