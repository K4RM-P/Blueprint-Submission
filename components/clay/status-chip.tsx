import { cn } from "@/lib/utils";

type ChipTone = "mint" | "sky" | "butter" | "apricot" | "neutral" | "danger";

const tones: Record<ChipTone, string> = {
  mint: "bg-mint text-loop-deep",
  sky: "bg-sky text-[#1d4f9a]",
  butter: "bg-butter text-[#6b4e00]",
  apricot: "bg-apricot text-ember-ink",
  neutral: "bg-[#ece6dc] text-ink-2",
  danger: "bg-[#fbe0e0] text-danger-ink",
};

const dots: Record<ChipTone, string> = {
  mint: "bg-loop",
  sky: "bg-[#2e68c4]",
  butter: "bg-warning",
  apricot: "bg-ember",
  neutral: "bg-ink-3",
  danger: "bg-danger",
};

/** Tinted flat pill — never clay, always text (§8). */
export function StatusChip({ tone = "neutral", children, className }: { tone?: ChipTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("chip", tones[tone], className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", dots[tone])} />
      {children}
    </span>
  );
}

export type { ChipTone };
