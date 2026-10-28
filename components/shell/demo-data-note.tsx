import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

/** Honesty label wherever demo metrics appear: the seeded organizations, people and numbers are fictional. */
export function DemoDataNote({ className, children = "Demo data · fictional organizations and numbers" }: { className?: string; children?: React.ReactNode }) {
  if (!env.demoMode) return null;
  return <span className={cn("chip bg-butter text-[#6b4e00]", className)}>{children}</span>;
}
