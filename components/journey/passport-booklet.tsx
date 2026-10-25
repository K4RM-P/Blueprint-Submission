import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LoopMark } from "@/components/shell/logo";

/**
 * Passport cover opens (Signature Moment 4). The page renders as a closed clay
 * booklet: a deep-green cover with an embossed title sits over the first page and
 * swings open in 3D on load. Pure CSS (works before hydration and never delays
 * content: the page underneath is already painted and readable). The cover never
 * takes pointer events. Reduced motion and print: no cover at all.
 */
export function PassportBooklet({ code, children, className }: { code: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("passport-booklet relative", className)}>
      <div className="passport-page">{children}</div>
      <div aria-hidden className="passport-cover no-print">
        <div className="passport-cover-front">
          <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
            <span className="grid size-16 place-items-center rounded-[22px] bg-white/10 shadow-[inset_2px_2px_6px_rgba(255,255,255,.25),inset_-3px_-4px_8px_rgba(0,0,0,.25)]">
              <LoopMark className="size-10" />
            </span>
            <p className="font-mono text-[0.8125rem] tracking-[0.32em] text-[#CDEFDF]">DEVICE PASSPORT</p>
            <p className="font-display text-[2.25rem] leading-none text-white/95">Relay</p>
            <p className="font-mono text-small tracking-[0.18em] text-[#9BD8BE]">{code}</p>
          </div>
        </div>
        <div className="passport-cover-back" />
      </div>
    </div>
  );
}
