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

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const complete = async () => {
    setBusy(true);
    setStatus(`${label}: confirmed`);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(10);
    controls.set({ scaleX: 1 });
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setArmed(false);
    }
  };

  const start = () => {
    if (disabled || done || busy) return;
    setStatus("Keep holding to confirm");
    controls.start({ scaleX: 1, transition: { duration: reduced ? 0.01 : duration / 1000, ease: "linear" } });
    timer.current = window.setTimeout(complete, duration);
  };

  const cancel = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (!busy && !done) {
      controls.start({ scaleX: 0, transition: { type: "spring", stiffness: 90, damping: 20 } });
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
      controls.start({ scaleX: 0.5, transition: { duration: 0.2 } });
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
      <motion.span
        aria-hidden
        initial={{ scaleX: done ? 1 : 0 }}
        animate={controls}
        className="absolute inset-0 -z-10 origin-left bg-gradient-to-r from-loop/80 to-loop-light/80"
      />
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
