"use client";

import { cn } from "@/lib/utils";
import { LiquidFill } from "./liquid-fill";
import type { Tint } from "@/components/clay/clay-card";

interface LiquidMeterProps {
  value: number;
  max?: number;
  title: string;
  /** Text meaning of the level, e.g. "Excellent" — never colour alone (§8). */
  verdict?: string;
  tint?: Tint;
  className?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

/** Clay vessel + LiquidFill + label: "Batch Value Score · 86 · Excellent". */
export function LiquidMeter({ value, max = 100, title, verdict, tint = "mint", className, children, compact }: LiquidMeterProps) {
  const pct = max > 0 ? value / max : 0;
  return (
    <div data-tint={tint} className={cn("clay-glass hairline-top flex items-center gap-5", compact ? "rounded-full p-2 pr-5" : "p-6", className)}>
      <div className={cn("shrink-0", compact ? "h-10 w-9" : "h-32 w-28")}>
        <LiquidFill value={pct} shape="vessel" className="size-full" calm={compact} />
      </div>
      <div className="min-w-0" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value} out of ${max}${verdict ? `, ${verdict}` : ""}`} aria-label={title}>
        <p className={cn(compact ? "text-small font-medium text-ink-2" : "eyebrow !text-ink-2")}>{title}</p>
        <p className={cn("font-display tnum text-ink", compact ? "text-xl" : "mt-1 text-[3rem] leading-none")}>
          {value}
          {verdict ? <span className={cn("font-sans font-semibold tracking-normal text-loop-deep", compact ? "ml-2 text-base" : "ml-3 text-xl")}>{verdict}</span> : null}
        </p>
        {children}
      </div>
    </div>
  );
}
