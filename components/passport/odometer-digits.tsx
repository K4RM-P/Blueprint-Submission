"use client";

import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useStoryMotion } from "./story-context";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

/**
 * Liquid-filled odometer for the story's numbers slide. Like LiquidDigits, but
 * supports decimals and rolls as soon as its slide mounts. Each digit is a
 * small clay window with a green liquid floor that tilts against the roll.
 * Reduced motion: the final value, still.
 */
export function OdometerDigits({ value, decimals = 0, label, className, delay = 0.35 }: { value: number; decimals?: number; label: string; className?: string; delay?: number }) {
  const { reduced } = useStoryMotion();
  const chars = value.toLocaleString("en-CA", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).split("");
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let d = 0;
  return (
    <span className={cn("inline-flex items-end gap-[0.08em]", className)}>
      <span className="sr-only">{label}</span>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          return (
            <span key={`s${i}`} aria-hidden className="story-huge px-[0.02em] pb-[0.1em] text-[0.8em] text-ink-2">
              {c}
            </span>
          );
        }
        const place = digitCount - 1 - d++;
        return <Window key={`d${i}`} digit={Number(c)} delay={delay + place * 0.11} still={reduced} />;
      })}
    </span>
  );
}

function Window({ digit, delay, still }: { digit: number; delay: number; still: boolean }) {
  const pos = useMotionValue(still ? digit : digit - 10);
  const y = useTransform(pos, (p) => `${-(((p % 10) + 10) % 10) * 1.18}em`);
  const tilt = useMotionValue(0);
  useEffect(() => {
    if (still) {
      pos.set(digit);
      return;
    }
    const a = animate(pos, digit, { type: "spring", stiffness: 60, damping: 17, mass: 1.1, delay });
    const b = animate(tilt, [0, -10, 6, -2, 0], { duration: 1.4, delay: delay + 0.1, ease: [0.2, 0, 0, 1] });
    return () => {
      a.stop();
      b.stop();
    };
  }, [still, digit, delay, pos, tilt]);

  return (
    <span aria-hidden data-tint="porcelain" className="clay-sm relative inline-block h-[1.18em] w-[0.78em] overflow-hidden rounded-[0.16em]">
      <Liquid tilt={tilt} />
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" style={{ y }}>
        {DIGITS.map((n, k) => (
          <span key={k} className="story-huge grid h-[1.18em] place-items-center text-[#17201C]">
            {n}
          </span>
        ))}
      </motion.span>
      <span className="pointer-events-none absolute inset-x-[14%] top-[5%] h-[12%] rounded-full bg-white/60" />
    </span>
  );
}

function Liquid({ tilt }: { tilt: MotionValue<number> }) {
  return (
    <motion.span className="absolute -inset-x-[30%] bottom-[-8%] h-[40%] origin-bottom" style={{ rotate: tilt }}>
      <span className="absolute inset-0 rounded-t-[40%] bg-gradient-to-b from-loop-light/60 to-loop/55" />
      <span className="absolute inset-x-0 top-0 h-px bg-white/80" />
    </motion.span>
  );
}
