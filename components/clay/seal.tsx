"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

interface SealProps {
  /** Text set around the rim, e.g. "DATA WIPED · RELAY · FREE GEEK TORONTO". */
  rim: string;
  icon: ReactNode;
  size?: number;
  /** Resting tilt in degrees, like a hand-pressed ink stamp. */
  tilt?: number;
  /** Press onto the surface when it mounts (or scrolls into view). */
  stamp?: boolean;
  inView?: boolean;
  className?: string;
}

/**
 * Sky-tinted ink seal: rim text, a double ring, an icon at the centre. It stamps
 * onto its card with the `press` spring (oversized → squash → settle at a slight
 * tilt) and sends out one soft ring. Used for wipes, certificates and verification.
 */
export function Seal({ rim, icon, size = 112, tilt = -8, stamp = true, inView = false, className }: SealProps) {
  const id = useId().replace(/:/g, "");
  const { reduced } = useMotionPrefs();
  const live = stamp && !reduced;
  const target = { scale: [1.55, 0.92, 1], rotate: [tilt - 14, tilt + 2, tilt], opacity: [0, 1, 1] };
  const transition = { duration: 0.55, times: [0, 0.6, 1], ease: [0.3, 0, 0.2, 1] as const };

  return (
    <motion.div
      aria-hidden
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size, rotate: live ? undefined : tilt }}
      initial={live ? { scale: 1.55, rotate: tilt - 14, opacity: 0 } : false}
      animate={live && !inView ? target : undefined}
      whileInView={live && inView ? target : undefined}
      viewport={{ once: true, margin: "-60px" }}
      transition={transition}
    >
      <svg viewBox="0 0 120 120" className="size-full">
        <defs>
          <path id={`rim-${id}`} d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
          <radialGradient id={`face-${id}`} cx="35%" cy="30%" r="80%">
            <stop offset="0" stopColor="#F2F7FF" />
            <stop offset="1" stopColor="#D3E3FC" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="57" fill={`url(#face-${id})`} />
        <circle cx="60" cy="60" r="55" fill="none" stroke="#2E68C4" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="34" fill="none" stroke="#2E68C4" strokeWidth="1.5" strokeDasharray="2 3" />
        <text fill="#1D4F9A" fontSize="9.5" fontFamily="var(--font-geist-mono), ui-monospace, monospace" letterSpacing="2.2" fontWeight="600">
          <textPath href={`#rim-${id}`} startOffset="0">
            {rim}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[#1D4F9A] [&_svg]:stroke-[1.9]" style={{ fontSize: size * 0.26 }}>
        <span className="[&_svg]:size-[1em]">{icon}</span>
      </span>
      {live ? (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-[#2E68C4]"
          initial={{ scale: 1, opacity: 0 }}
          animate={inView ? undefined : { scale: [1, 1.5], opacity: [0.5, 0] }}
          whileInView={inView ? { scale: [1, 1.5], opacity: [0.5, 0] } : undefined}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.32, ease: [0.2, 0, 0, 1] }}
        />
      ) : null}
    </motion.div>
  );
}
