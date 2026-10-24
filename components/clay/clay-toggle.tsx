"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

interface ClayToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

/** Clay knob on a well track; the track fills with liquid when on (§7.3). */
export function ClayToggle({ checked, onCheckedChange, label, description, disabled, name, className }: ClayToggleProps) {
  const id = useId();
  const { reduced, t } = useMotionPrefs();
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="block font-medium text-ink">
          {label}
        </label>
        {description ? (
          <p id={`${id}-d`} className="mt-0.5 text-small text-ink-2">
            {description}
          </p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        name={name}
        aria-checked={checked}
        aria-describedby={description ? `${id}-d` : undefined}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className="well relative h-9 w-16 shrink-0 rounded-full p-1 disabled:opacity-50"
      >
        <motion.span
          aria-hidden
          className="absolute inset-y-1 left-1 rounded-full bg-gradient-to-r from-loop to-loop-light"
          initial={false}
          animate={{ width: checked ? "calc(100% - 8px)" : "28px", opacity: checked ? 1 : 0 }}
          transition={t("liquid")}
        />
        <motion.span
          aria-hidden
          data-tint="porcelain"
          className="clay-sm relative block size-7 rounded-full"
          initial={false}
          animate={{ x: checked ? 28 : 0, scaleX: reduced ? 1 : [1, 1.15, 1] }}
          transition={reduced ? t("fade") : { x: t("liquid"), scaleX: { duration: 0.35 } }}
        />
        <span className="sr-only">{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}
