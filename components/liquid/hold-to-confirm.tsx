"use client";

import { motion, useAnimationControls } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

interface HoldToConfirmProps {
  label: string;
  hint?: string;
  onConfirm: () => void | Promise<void>;
  duration?: number;
  disabled?: boolean;
  done?: boolean;
  icon?: ReactNode;
  className?: string;
}

/**
 * Tile that fills with liquid while held (1.2s); releasing early drains it.
 * Keyboard / screen reader alternative: press Enter (or Space) twice (§11).
 */
export function HoldToConfirm({ label, hint, onConfirm, duration = 1200, disabled, done, icon, className }: HoldToConfirmProps) {
  const controls = useAnimationControls();
  const { reduced } = useMotionPrefs();
  const timer = useRef<number | null>(null);
  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [holding, setHolding] = useState(false);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const complete = async () => {
    setHolding(false);
    setBusy(true);
    setStatus(`${label}: confirmed`);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([10, 40, 16]);
    controls.set({ x: "0%" });
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setArmed(false);
    }
  };

  const start = () => {
    if (disabled || done || busy) return;
    setHolding(true);
    setStatus("Keep holding to confirm");
    // Constant-rate fill on purpose: the level is a timer the volunteer can read.
    controls.start({ x: "0%", transition: { duration: reduced ? 0.01 : duration / 1000, ease: "linear" } });
    timer.current = window.setTimeout(complete, duration);
  };

  const cancel = () => {
    setHolding(false);
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (!busy && !done) {
      controls.start({ x: "-100%", transition: { type: "spring", stiffness: 90, damping: 20 } });
      setStatus("");
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (disabled || done || busy || e.repeat) return;
    if (!armed) {
      setArmed(true);
      setStatus(`Press ${e.key === " " ? "Space" : "Enter"} again to confirm: ${label}`);
      controls.start({ x: "-50%", transition: { type: "spring", stiffness: 170, damping: 24 } });
      return;
    }
    void complete();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={onKeyDown}
      onBlur={() => {
        if (armed) {
          setArmed(false);
          cancel();
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      aria-describedby={hint ? undefined : undefined}
      className={cn(
        "clay relative isolate flex min-h-[72px] w-full touch-none select-none items-center gap-4 overflow-hidden px-5 py-4 text-left disabled:opacity-55",
        done && "clay-sunk",
        className,
      )}
      data-tint={done ? "mint" : "sky"}
    >
      {/* Liquid pours in from the left with a wavy leading edge (translate only, never stretched). */}
      <motion.span aria-hidden initial={{ x: done ? "0%" : "-100%" }} animate={controls} className="absolute inset-y-0 left-[-12px] right-[12px] -z-10">
        <span className="absolute inset-0 bg-gradient-to-r from-loop/85 to-loop-light/85" />
        <svg viewBox="0 0 12 100" preserveAspectRatio="none" className="absolute inset-y-0 -right-3 h-full w-3">
          <path className={holding && !reduced ? "hold-edge" : undefined} d="M0 0 C 12 12, 0 25, 9 37 S 2 62, 10 75 S 4 92, 0 100 Z" fill="#46C796" fillOpacity="0.85" />
        </svg>
      </motion.span>
      <span aria-hidden className={cn("grid size-11 shrink-0 place-items-center rounded-full [&_svg]:size-6", done ? "bg-loop text-white" : "bg-white/70 text-loop-deep")}>
        {done ? <Check strokeWidth={2.25} /> : icon}
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-semibold text-ink">{label}</span>
        <span className="block text-small text-ink-2">{done ? "Done" : armed ? "Press again to confirm" : (hint ?? "Press and hold to confirm")}</span>
      </span>
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </button>
  );
}
