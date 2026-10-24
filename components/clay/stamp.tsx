"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import type { Tint } from "./clay-card";

interface StampProps {
  icon: ReactNode;
  label: string;
  date?: string;
  tint?: Tint;
  done?: boolean;
  size?: "sm" | "md";
  /** Animate pressing into the page when scrolled into view. */
  animateIn?: boolean;
  className?: string;
}

/** Round clay seal that presses onto the card (§8). */
export function Stamp({ icon, label, date, tint = "mint", done = true, size = "md", animateIn = true, className }: StampProps) {
  const { reduced, t } = useMotionPrefs();
  const dim = size === "sm" ? "size-11" : "size-14";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.span
        aria-hidden
        data-tint={done ? tint : "porcelain"}
        className={cn("grid shrink-0 place-items-center rounded-full [&_svg]:stroke-[1.75]", dim, done ? "clay-sm text-loop-deep" : "border-2 border-dashed border-line text-ink-3", size === "sm" ? "[&_svg]:size-5" : "[&_svg]:size-6")}
        initial={animateIn && !reduced && done ? { scale: 1.15, rotate: -4, opacity: 0 } : false}
        whileInView={animateIn && !reduced && done ? { scale: 1, rotate: 0, opacity: 1 } : undefined}
        viewport={{ once: true, margin: "-60px" }}
        transition={t("press")}
      >
        {icon}
      </motion.span>
      <div className="min-w-0">
        <p className={cn("font-semibold leading-snug", done ? "text-ink" : "text-ink-2")}>{label}</p>
        {date ? <p className="text-small text-ink-2 tnum">{date}</p> : null}
      </div>
    </div>
  );
}
