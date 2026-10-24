import Link from "next/link";
import { cn } from "@/lib/utils";

/** Relay wordmark: a liquid loop + Bricolage name. Not Free Geek's branding. */
export function LoopMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="10" fill="#D7F1E4" />
      <path d="M10.5 16a5.5 5.5 0 1 1 5.5 5.5" fill="none" stroke="#138A61" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M16 21.5l-2.6-2.2m2.6 2.2l-2.3 2.5" fill="none" stroke="#138A61" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", sub, className }: { href?: string; sub?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 rounded-full", className)}>
      <LoopMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.25rem] tracking-[-0.03em] text-ink">Relay</span>
        {sub ? <span className="mt-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-ink-3">{sub}</span> : null}
      </span>
    </Link>
  );
}
