"use client";

import { motion, useScroll } from "motion/react";
import { useRef } from "react";
import { useMotionPrefs } from "@/lib/motion";

/** A short liquid line that fills as it scrolls past, carrying the reader into the next chapter (no hard edge). */
export function Pour({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  return (
    <div aria-hidden className={className}>
      <span ref={ref} className="well relative mx-auto block h-24 w-1.5 overflow-hidden rounded-full md:h-32">
        <motion.span className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-loop-light to-loop" style={{ scaleY: reduced ? 1 : scrollYProgress }} />
      </span>
    </div>
  );
}
