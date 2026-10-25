"use client";

import { motion } from "motion/react";
import { ClayBaton } from "@/components/illustrations/clay-baton";
import { cn } from "@/lib/utils";
import { useStoryMotion } from "./story-context";

/**
 * The relay baton as a story character: it settles in with weight and, when
 * `glow` is on, a warm halo blooms once behind it (never loops, §12.9).
 */
export function BatonSprite({ className, glow = false, core = 1, rotate = -14, delay = 0.2 }: { className?: string; glow?: boolean; core?: number; rotate?: number; delay?: number }) {
  const { reduced } = useStoryMotion();
  return (
    <div className={cn("relative", className)}>
      {glow ? (
        <motion.span
          aria-hidden
          className="absolute -inset-[45%] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,236,214,.7) 45%, rgba(255,224,203,0) 72%)" }}
          initial={reduced ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 90, damping: 20, mass: 1.2, delay: delay + 0.35 }}
        />
      ) : null}
      <motion.div
        className="relative"
        initial={reduced ? false : { y: 40, rotate: rotate - 20, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, rotate, opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 170, damping: 18, delay }}
      >
        <ClayBaton className="h-auto w-full" core={core} />
      </motion.div>
    </div>
  );
}
