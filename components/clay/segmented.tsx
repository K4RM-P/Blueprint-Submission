"use client";

import { motion } from "motion/react";
import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import { GooFilter } from "@/components/liquid/goo-filter";

interface Option<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SegmentedProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
  size?: "sm" | "md";
}

/** Well track with a gooey clay indicator that stretches between options (§7.3). */
export function Segmented<T extends string>({ options, value, onChange, label, className, size = "md" }: SegmentedProps<T>) {
  const id = useId();
  const filterId = `goo-${id.replace(/:/g, "")}`;
  const { reduced, t } = useMotionPrefs();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, index: number) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    let next = index;
    for (let i = 0; i < options.length; i++) {
      next = (next + dir + options.length) % options.length;
      if (!options[next].disabled) break;
    }
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={cn("well relative inline-flex max-w-full rounded-full p-1", className)}>
      <GooFilter id={filterId} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-1 flex"
        style={{ filter: reduced ? "drop-shadow(0 4px 6px rgba(90,75,55,.22))" : `url(#${filterId}) drop-shadow(0 4px 6px rgba(90,75,55,.22))` }}
      >
        {options.map((o) => (
          <div key={o.value} className="relative flex-1">
            {o.value === value ? (
              <>
                <motion.div layoutId={`${id}-lead`} transition={t("press")} className="absolute inset-0 rounded-full bg-[#fbf9f5]" />
                {!reduced ? <motion.div layoutId={`${id}-trail`} transition={t("liquid")} className="absolute inset-y-1 inset-x-3 rounded-full bg-[#fbf9f5]" /> : null}
              </>
            ) : null}
          </div>
        ))}
      </div>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          disabled={o.disabled}
          onKeyDown={(e) => onKey(e, i)}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative z-[1] flex-1 rounded-full px-4 font-medium whitespace-nowrap transition-colors disabled:opacity-45",
            size === "sm" ? "h-9 text-small" : "h-11 text-[0.9375rem]",
            o.value === value ? "text-ink" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
