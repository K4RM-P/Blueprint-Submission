"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useMotionPrefs } from "@/lib/motion";

/** A short relay lane that fills with liquid to `value` (0..1) the first time it scrolls into view. */
export function ShareBar({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const { reduced, t } = useMotionPrefs();
  const v = Math.max(0, Math.min(1, value));
  return (
    <span ref={ref} aria-hidden className="well relative block h-4 overflow-hidden rounded-full">
      <motion.span
        className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-loop-light to-loop"
        initial={{ scaleX: reduced ? v : 0.02 }}
        animate={{ scaleX: inView || reduced ? v : 0.02 }}
        transition={{ ...t("liquid"), delay: reduced ? 0 : 0.25 }}
      />
    </span>
  );
}
