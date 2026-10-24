import Image from "next/image";
import { labels, type PartnerTier } from "@/lib/domain";
import { cn } from "@/lib/utils";

/** Calm porcelain tile: logo (or monogram), name, devices reused. No marquee. */
export function PartnerTile({ name, logoUrl, tier, reused, featured }: { name: string; logoUrl: string | null; tier: PartnerTier; reused: number; featured?: boolean }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <div data-tint={featured ? "butter" : "porcelain"} className={cn("clay-glass hairline-top flex h-full flex-col gap-4 p-5", featured && "sm:p-7")}>
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <Image src={logoUrl} alt={`${name} logo`} width={48} height={48} className="size-12 rounded-[14px] bg-white object-contain p-1.5" unoptimized />
        ) : (
          <span aria-hidden className="grid size-12 place-items-center rounded-[14px] bg-ink font-display text-lg text-white">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{name}</p>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-3">{labels.tier[tier]}</p>
        </div>
      </div>
      <p className="mt-auto">
        <span className="font-display text-[2rem] leading-none tnum">{reused}</span> <span className="text-small text-ink-2">devices back in use</span>
      </p>
    </div>
  );
}
