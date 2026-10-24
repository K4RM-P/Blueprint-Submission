"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

const paths = [
  "M421 299Q384 398 286 427Q188 456 116 378Q44 300 98 207Q152 114 256 92Q360 70 409 135Q458 200 421 299Z",
  "M444 308Q394 416 287 413Q180 410 117 335Q54 260 109 172Q164 84 268 80Q372 76 433 138Q494 200 444 308Z",
  "M403 316Q406 432 289 446Q172 460 104 380Q36 300 92 212Q148 124 257 106Q366 88 383 144Q400 200 403 316Z",
  "M432 286Q366 372 285 406Q204 440 140 370Q76 300 115 198Q154 96 262 86Q370 76 434 138Q498 200 432 286Z",
];

interface LiquidBlobProps {
  className?: string;
  tone?: "mint" | "apricot";
  duration?: number;
}

/**
 * Large blurred blob that slowly morphs (§7.2.3). Landing hero and Passport only.
 * Paused offscreen; not rendered for reduced motion or low-power devices.
 */
export function LiquidBlob({ className, tone = "mint", duration = 22 }: LiquidBlobProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const { reduced, lowPower, expression } = useMotionPrefs();
  const fill = tone === "mint" ? "#9fdcc0" : "#ffc29e";
  const still = reduced || lowPower || expression < 3;

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none absolute", className)} style={{ filter: "blur(40px)", opacity: 0.35 }}>
      <svg viewBox="0 0 512 512" className="size-full">
        {still || !inView ? (
          <path d={paths[0]} fill={fill} />
        ) : (
          <motion.path
            fill={fill}
            initial={{ d: paths[0] }}
            animate={{ d: [...paths, paths[0]] }}
            transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </svg>
    </div>
  );
}
