import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ClayVessel } from "@/components/illustrations/clay-vessel";
import { ClayBaton } from "@/components/illustrations/clay-baton";

/** Small clay illustration + one specific sentence + one action (§8). */
export function EmptyState({
  title,
  children,
  action,
  tone = "mint",
  art = "vessel",
  className,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "mint" | "butter" | "apricot" | "sky";
  /** "baton": a baton resting in a well, waiting to be picked up (bench, queues). */
  art?: "vessel" | "baton";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-start gap-4 py-10 sm:flex-row sm:items-center sm:gap-6", className)}>
      {art === "baton" ? (
        <span aria-hidden data-tint={tone} className="clay grid h-20 w-28 shrink-0 place-items-center !rounded-[26px]">
          <span className="well grid h-9 w-[5.5rem] place-items-center !rounded-full">
            <ClayBaton className="w-20 -rotate-6" core={0.15} />
          </span>
        </span>
      ) : (
        <ClayVessel tone={tone} className="size-20 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-title font-semibold text-ink">{title}</p>
        {children ? <div className="mt-1 max-w-[52ch] text-ink-2">{children}</div> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
