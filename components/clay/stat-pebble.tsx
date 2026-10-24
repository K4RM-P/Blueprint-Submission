"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import type { Tint } from "./clay-card";

interface StatPebbleProps {
  label: string;
  value: number;
  /** Fraction digits to show. */
  decimals?: number;
  suffix?: string;
  prefix?: string;
  delta?: string;
  tint?: Tint;
  size?: "sm" | "md" | "lg";
  caption?: string;
  className?: string;
}

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Clay pebble with a big Bricolage number that counts up once on view (§8). */
export function StatPebble({ label, value, decimals = 0, suffix, prefix, delta, tint = "porcelain", size = "md", caption, className }: StatPebbleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const { reduced } = useMotionPrefs();
  const mv = useMotionValue(value);
  const display = useTransform(mv, (v) => fmt(v, decimals));
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    if (!inView) return;
    if (started.current) {
      const c = animate(mv, value, { type: "spring", stiffness: 60, damping: 20 });
      return () => c.stop();
    }
    started.current = true;
    const c = animate(mv, value, { type: "spring", stiffness: 60, damping: 20, from: 0 });
    return () => c.stop();
  }, [inView, value, reduced, mv]);

  const numberSize = size === "lg" ? "text-[3.25rem] sm:text-[4.5rem]" : size === "sm" ? "text-[1.75rem]" : "text-[2.25rem] sm:text-[2.75rem]";

  return (
    <div ref={ref} data-tint={tint} className={cn("clay flex flex-col justify-between gap-3", size === "sm" ? "rounded-[22px] p-5" : "p-6", className)}>
      <p className="eyebrow !text-ink-2">{label}</p>
      <div>
        <p className={cn("font-display tnum leading-none text-ink", numberSize)} aria-label={`${prefix ?? ""}${fmt(value, decimals)}${suffix ? ` ${suffix}` : ""}`}>
          <span aria-hidden>
            {prefix}
            <motion.span>{display}</motion.span>
          </span>
          {suffix ? <span aria-hidden className="ml-1.5 text-[0.4em] font-sans font-medium tracking-normal text-ink-2">{suffix}</span> : null}
        </p>
        {caption ? <p className="mt-2 text-small text-ink-2">{caption}</p> : null}
      </div>
      {delta ? <span className="chip w-fit bg-white/70 text-loop-deep">{delta}</span> : null}
    </div>
  );
}
