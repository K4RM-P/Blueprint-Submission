import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Landing chapter header: a mono figure label, then a two-tone display line
 * (statement in ink, continuation in ink-3). Optional aside sits right on desktop.
 */
export function SectionHead({ fig, label, title, muted, aside, id, className }: { fig: string; label: string; title: string; muted?: string; aside?: ReactNode; id: string; className?: string }) {
  return (
    <div className={cn("grid gap-6 md:grid-cols-12 md:items-end", className)}>
      <div className="md:col-span-8">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
          Fig {fig} <span className="mx-1.5 text-line">/</span> {label}
        </p>
        <h2 id={id} className="font-display mt-4 max-w-[18ch] text-[2.5rem] leading-[1] tracking-[-0.045em] sm:text-[3.25rem] lg:text-[3.75rem]">
          {title}
          {muted ? <span className="text-ink-3"> {muted}</span> : null}
        </h2>
      </div>
      {aside ? <div className="md:col-span-4 md:pb-2">{aside}</div> : null}
    </div>
  );
}

/** Full-bleed hairline between chapters, with crosshairs where it meets the page guides (desktop). */
export function Rule() {
  return (
    <div aria-hidden className="rule">
      <span className="crosshair rule-mark left-[max(-6px,calc(50%-600px-6px))] hidden lg:block" />
      <span className="crosshair rule-mark right-[max(-6px,calc(50%-600px-6px))] hidden lg:block" />
    </div>
  );
}
