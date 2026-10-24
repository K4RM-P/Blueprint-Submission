import { cn } from "@/lib/utils";

/** Clay-shaped placeholder with a slow liquid sheen (§7.3). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton-clay", className)} />;
}

export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">{label}…</span>
      <Skeleton className="h-12 w-2/3 max-w-md rounded-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-36 rounded-[var(--r-lg)] sm:col-span-2" />
        <Skeleton className="h-36 rounded-[var(--r-lg)]" />
      </div>
      <Skeleton className="h-72 rounded-[var(--r-md)]" />
    </div>
  );
}
