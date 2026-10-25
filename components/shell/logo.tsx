import Link from "next/link";
import { cn } from "@/lib/utils";

/** Relay mark: a liquid-cored baton mid-pass, with the arc of the handoff. Not Free Geek's branding. */
export function LoopMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="10" fill="#D7F1E4" />
      <g transform="rotate(-35 16 16)">
        <rect x="4.5" y="11.4" width="23" height="9.2" rx="4.6" fill="#FBF9F5" stroke="#0B5E42" strokeWidth="1.8" />
        <rect x="10" y="13.9" width="12" height="4.2" rx="2.1" fill="#138A61" />
        <rect x="7" y="12.9" width="5" height="1.4" rx="0.7" fill="#fff" />
      </g>
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
