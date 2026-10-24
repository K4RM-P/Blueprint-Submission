import { cn } from "@/lib/utils";

/** Empty clay vessel/jar for empty states (§6.4). Pure SVG. */
export function ClayVessel({ className, tone = "mint" }: { className?: string; tone?: "mint" | "butter" | "apricot" | "sky" }) {
  const c = { mint: ["#EAF8F1", "#B9E3CE", "#7CC4A2"], butter: ["#FFF8DD", "#F6E3A0", "#D9B850"], apricot: ["#FFF0E5", "#FFD0B0", "#E79A6A"], sky: ["#EEF5FF", "#C6DBF8", "#8DB0E3"] }[tone];
  const id = `v-${tone}`;
  return (
    <svg viewBox="0 0 120 120" className={cn("block", className)} aria-hidden>
      <defs>
        <radialGradient id={id} cx="30%" cy="25%" r="85%">
          <stop offset="0" stopColor={c[0]} />
          <stop offset="0.65" stopColor={c[1]} />
          <stop offset="1" stopColor={c[2]} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="108" rx="34" ry="6" fill={c[2]} opacity="0.25" />
      <path d="M40 14 h40 a6 6 0 0 1 6 6 v4 c0 6 -6 9 -6 15 c14 6 22 18 22 34 c0 20 -14 32 -32 32 h-20 c-18 0 -32 -12 -32 -32 c0 -16 8 -28 22 -34 c0 -6 -6 -9 -6 -15 v-4 a6 6 0 0 1 6 -6 z" fill={`url(#${id})`} />
      <path d="M30 60 c4 -8 10 -12 16 -14" stroke="#fff" strokeOpacity="0.7" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
