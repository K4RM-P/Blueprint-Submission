"use client";

import { animate, motion, useInView, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Liquid odometer (Signature Moment 2): each digit is a small clay window with a
 * green liquid floor. Digits roll into place right-to-left with the `liquid`
 * spring; the liquid tilts against the roll and settles as the number lands.
 * Transform-only. Reduced motion: the final number, still.
 */
export function LiquidDigits({ value, className, label }: { value: number; className?: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const { reduced } = useMotionPrefs();
  const chars = Math.max(0, Math.round(value)).toLocaleString("en-CA").split("");
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let d = 0;

  return (
    <span ref={ref} className={cn("inline-flex items-end gap-1", className)}>
      <span className="sr-only">{label}</span>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) {
          return (
            <span key={`sep-${i}`} aria-hidden className="pb-1 font-display text-[1.25em] leading-none text-ink-3">
              {c}
            </span>
          );
        }
        const place = digitCount - 1 - d++;
        return <DigitWindow key={`d-${i}`} digit={Number(c)} delay={place * 0.12} run={inView && !reduced} still={reduced} />;
      })}
    </span>
  );
}

function DigitWindow({ digit, delay, run, still }: { digit: number; delay: number; run: boolean; still: boolean }) {
  // Roll position in digit units; starts a full turn back so every digit travels.
  const pos = useMotionValue(still ? digit : digit - 10);
  const y = useTransform(pos, (p) => `${-(((p % 10) + 10) % 10) * 1.5}em`);
  const tilt = useMotionValue(0);

  useEffect(() => {
    if (still) {
      pos.set(digit);
      return;
    }
    if (!run) return;
    const a = animate(pos, digit, { type: "spring", stiffness: 70, damping: 18, mass: 1.1, delay });
    const b = animate(tilt, [0, -9, 5, -2, 0], { duration: 1.3, delay: delay + 0.1, ease: [0.2, 0, 0, 1] });
    return () => {
      a.stop();
      b.stop();
    };
  }, [run, still, digit, delay, pos, tilt]);

  return (
    <span aria-hidden data-tint="mint" className="clay-sm relative inline-block h-[1.5em] w-[1.02em] overflow-hidden rounded-[0.3em]">
      <Liquid tilt={tilt} />
      <motion.span className="absolute inset-x-0 top-0 flex flex-col" style={{ y }}>
        {[...DIGITS, "0"].map((n, k) => (
          <span key={k} className="grid h-[1.5em] place-items-center font-display leading-none text-ink tnum">
            {n}
          </span>
        ))}
      </motion.span>
      {/* glass highlight, top-left light */}
      <span className="pointer-events-none absolute inset-x-[12%] top-[6%] h-[18%] rounded-full bg-white/55" />
    </span>
  );
}

function Liquid({ tilt }: { tilt: MotionValue<number> }) {
  return (
    <motion.span className="absolute -inset-x-[30%] bottom-[-10%] h-[46%] origin-bottom" style={{ rotate: tilt }}>
      <span className="absolute inset-0 rounded-t-[40%] bg-gradient-to-b from-loop-light/70 to-loop/60" />
      <span className="absolute inset-x-0 top-0 h-px bg-white/70" />
    </motion.span>
  );
}
