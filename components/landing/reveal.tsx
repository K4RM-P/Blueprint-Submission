"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { springs, reducedTransition, useMotionPrefs } from "@/lib/motion";

/**
 * Landing entrance: content settles up into place on the `soft` spring the first
 * time it scrolls into view, with a slight scale so it eases in rather than fades
 * up. `delay` staggers siblings. Reduced motion: a 150ms fade.
 */
export function Reveal({ children, className, delay = 0, y = 40 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y, scale: reduced ? 1 : 0.965 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={reduced ? reducedTransition : { ...springs.soft, delay, opacity: { duration: 0.45, delay, ease: [0.2, 0, 0, 1] } }}
    >
      {children}
    </motion.div>
  );
}
