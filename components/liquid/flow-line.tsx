"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

interface FlowLineProps {
  children: ReactNode;
  className?: string;
  /** 0..1 portion of the line that is "real" progress (e.g. 3 of 4 steps done). */
  progress?: number;
  /** Fill as the user scrolls; otherwise just show `progress`. */
  scrollLinked?: boolean;
}

/**
 * Thick rounded vertical track that fills with liquid green (§7.2.4).
 * Children are the nodes (stamps) stacked alongside the line.
 */
export function FlowLine({ children, className, progress = 1, scrollLinked = true }: FlowLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 60%"] });
  const eased = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 1.2 });
  const live = scrollLinked && !reduced;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div aria-hidden className="absolute bottom-7 left-[27px] top-7 w-1.5 -translate-x-1/2 overflow-hidden rounded-full bg-[#e7e0d5]">
        <div className="absolute inset-x-0 top-0 rounded-full" style={{ height: `${Math.max(0, Math.min(1, progress)) * 100}%` }}>
          <motion.div
            className="size-full origin-top rounded-full bg-gradient-to-b from-loop-light to-loop"
            style={live ? { scaleY: eased } : { scaleY: 1 }}
          />
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
