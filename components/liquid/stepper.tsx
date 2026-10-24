"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import { GooFilter } from "./goo-filter";

/** Stepper dots; a liquid indicator merges gooey-style into each step as you advance (§7.3). */
export function Stepper({ steps, current, onStep, maxReached, label = "Batch steps" }: { steps: string[]; current: number; onStep?: (i: number) => void; maxReached: number; label?: string }) {
  const id = useId().replace(/:/g, "");
  const { reduced, t } = useMotionPrefs();
  return (
    <nav aria-label={label}>
      <GooFilter id={`goo-step-${id}`} />
      <ol className="relative flex items-center gap-2">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center gap-2" style={reduced ? undefined : { filter: `url(#goo-step-${id})` }}>
          {steps.map((s, i) => (
            <div key={s} className="relative flex flex-1 items-center">
              <span className="size-9 shrink-0" />
              {i === current ? <motion.span layoutId={`step-blob-${id}`} transition={t("liquid")} className="absolute left-0 size-9 rounded-full bg-loop" /> : null}
            </div>
          ))}
        </div>
        {steps.map((s, i) => {
          const done = i < current;
          const reachable = i <= maxReached && onStep;
          return (
            <li key={s} className="relative flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onStep?.(i)}
                aria-current={i === current ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${s}${done ? " (done)" : ""}`}
                className={cn(
                  "relative grid size-9 shrink-0 place-items-center rounded-full text-small font-semibold tnum transition-colors",
                  i === current ? "text-white" : done ? "bg-mint text-loop-deep" : "border-2 border-line text-ink-3",
                  reachable && i !== current && "hover:border-loop",
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
              </button>
              <span className={cn("truncate text-small font-medium", i === current ? "hidden text-ink sm:block" : "hidden text-ink-2 2xl:block")}>{s}</span>
              {i < steps.length - 1 ? <span aria-hidden className={cn("h-0.5 min-w-3 flex-1 rounded-full", done ? "bg-loop" : "bg-line")} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
