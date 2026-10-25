"use client";

import { motion } from "motion/react";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/motion";
import { useStoryMotion } from "./story-context";

/**
 * Slide kit for Relay Wrapped: every slide is an eyebrow, one huge key line,
 * one hero element and an optional note, so the deck reads as one system.
 */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  const { reduced } = useStoryMotion();
  return (
    <motion.p
      className={cn("story-eyebrow", className)}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0.15 } : { ...springs.soft, delay: 0.15 }}
    >
      {children}
    </motion.p>
  );
}

/** "Its first job was at *Maple Ledger.*" → words, with the starred run flagged. */
function splitEmphasis(text: string): { word: string; em: boolean }[] {
  const out: { word: string; em: boolean }[] = [];
  let emphasis = false;
  for (const raw of text.split(/\s+/)) {
    const startsEm = raw.startsWith("*");
    if (startsEm) emphasis = true;
    out.push({ word: raw.replace(/\*/g, ""), em: emphasis });
    if (raw.slice(startsEm ? 1 : 0).includes("*")) emphasis = false;
  }
  return out;
}

/**
 * The slide's key line, set word by word with the `soft` spring. Wrap words in
 * *asterisks* to set them in loop green. Real text stays in the DOM for readers.
 */
export function KineticLine({ text, className, delay = 0.25, as = "h2", size = "lg" }: { text: string; className?: string; delay?: number; as?: "h1" | "h2"; size?: "lg" | "sm" }) {
  const { reduced } = useStoryMotion();
  const Tag = as === "h1" ? motion.h1 : motion.h2;
  const words = splitEmphasis(text);
  return (
    <Tag className={cn("story-line", size === "sm" && "story-line-sm", className)}>
      {words.map(({ word, em }, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className={cn("inline-block", em && "story-em")}
              initial={reduced ? false : { y: "0.9em", opacity: 0, rotate: 2 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 210, damping: 26, delay: delay + i * 0.045 }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}

export function Sub({ children, className, delay = 0.55 }: { children: ReactNode; className?: string; delay?: number }) {
  const { reduced } = useStoryMotion();
  return (
    <motion.p
      className={cn("story-sub mt-4", className)}
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0.15 } : { ...springs.soft, delay }}
    >
      {children}
    </motion.p>
  );
}

/** The one hero element, centred in the space the text leaves. */
export function Hero({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative flex min-h-0 flex-1 items-center justify-center", className)}>{children}</div>;
}

/** Small mono chip for dates and codes. */
export function MonoChip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex h-7 items-center rounded-full bg-white/65 px-3 font-mono text-[0.75rem] tracking-[0.06em] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.9)]", className)}>{children}</span>;
}

/** Appears after the hero; used for honest small print (TO VERIFY, Illustrative). */
export function Footnote({ children, className, delay = 0.9 }: { children: ReactNode; className?: string; delay?: number }) {
  const { reduced } = useStoryMotion();
  return (
    <motion.p
      className={cn("text-[0.75rem] leading-snug text-ink-2", className)}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduced ? { duration: 0.15 } : { duration: 0.4, delay }}
    >
      {children}
    </motion.p>
  );
}
