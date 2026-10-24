import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ClayVessel } from "@/components/illustrations/clay-vessel";

/** Small clay illustration + one specific sentence + one action (§8). */
export function EmptyState({ title, children, action, tone = "mint", className }: { title: string; children?: ReactNode; action?: ReactNode; tone?: "mint" | "butter" | "apricot" | "sky"; className?: string }) {
  return (
    <div className={cn("flex flex-col items-start gap-4 py-10 sm:flex-row sm:items-center sm:gap-6", className)}>
      <ClayVessel tone={tone} className="size-20 shrink-0" />
      <div className="min-w-0">
        <p className="text-title font-semibold text-ink">{title}</p>
        {children ? <div className="mt-1 max-w-[52ch] text-ink-2">{children}</div> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
