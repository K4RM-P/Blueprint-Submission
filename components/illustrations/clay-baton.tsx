import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The relay baton: a glossy porcelain clay capsule with a liquid-green core.
 * Light from the top-left, tinted contact shadow. Pure SVG, decorative.
 */
export function ClayBaton({ className, core = 1 }: { className?: string; /** 0..1 how full the core is. */ core?: number }) {
  const id = useId().replace(/:/g, "");
  const fill = Math.max(0.08, Math.min(1, core));
  return (
    <svg viewBox="0 0 96 40" className={cn("block overflow-visible", className)} aria-hidden>
      <defs>
        <linearGradient id={`shell-${id}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#F1EBE1" />
          <stop offset="1" stopColor="#D9CDBB" />
        </linearGradient>
        <linearGradient id={`core-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5BD3A4" />
          <stop offset="0.5" stopColor="#2FBF8A" />
          <stop offset="1" stopColor="#0B5E42" />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <rect x="22" y="11" width="52" height="18" rx="9" />
        </clipPath>
        <filter id={`drop-${id}`} x="-30%" y="-40%" width="160%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0B5E42" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter={`url(#drop-${id})`}>
        <rect x="2" y="4" width="92" height="32" rx="16" fill={`url(#shell-${id})`} />
      </g>
      {/* window into the liquid core */}
      <rect x="22" y="11" width="52" height="18" rx="9" fill="#E9E2D6" />
      <g clipPath={`url(#clip-${id})`}>
        <rect x="22" y="11" width={52 * fill} height="18" fill={`url(#core-${id})`} />
        <rect x="24" y="13" width={Math.max(0, 52 * fill - 6)} height="3" rx="1.5" fill="#fff" opacity="0.45" />
      </g>
      <rect x="22" y="11" width="52" height="18" rx="9" fill="none" stroke="rgba(90,75,55,.18)" strokeWidth="1" />
      {/* specular highlight, top-left */}
      <rect x="10" y="7.5" width="30" height="4" rx="2" fill="#fff" opacity="0.9" />
      <circle cx="13" cy="20" r="2.2" fill="#fff" opacity="0.6" />
    </svg>
  );
}
