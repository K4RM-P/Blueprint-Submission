"use client";

import { motion } from "motion/react";
import { Award, Cpu, HardDrive, Lock, ShieldCheck, Sparkle, Stethoscope, Terminal, Trophy, Users, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

const icons = {
  "first-boot": Cpu,
  diagnostician: Stethoscope,
  "data-guardian": ShieldCheck,
  "open-source-installer": Terminal,
  "bench-regular": Wrench,
  century: Trophy,
  mentor: Users,
  default: Award,
  drive: HardDrive,
} as const;

export type BadgeIcon = keyof typeof icons;

interface BadgeCoinProps {
  slug: string;
  name: string;
  unlocked: boolean;
  progress?: number;
  threshold?: number;
  size?: number;
  celebrate?: boolean;
  className?: string;
}

/** Butter coin; locked = flat outline + progress ring, unlocked = full clay (§8). */
export function BadgeCoin({ slug, name, unlocked, progress = 0, threshold = 1, size = 88, celebrate, className }: BadgeCoinProps) {
  const Icon = icons[slug as BadgeIcon] ?? (slug === "sparkle" ? Sparkle : Award);
  const { reduced, t } = useMotionPrefs();
  const pct = Math.max(0, Math.min(1, threshold > 0 ? progress / threshold : 0));
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;

  return (
    <figure className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        initial={celebrate && !reduced ? { y: -80, opacity: 0, scaleY: 1 } : false}
        animate={celebrate && !reduced ? { y: 0, opacity: 1, scaleY: [1, 0.86, 1] } : undefined}
        transition={celebrate ? t("bouncy") : undefined}
      >
        {unlocked ? (
          <div data-tint="butter" className="clay-sm grid size-full place-items-center rounded-full">
            <div className="grid place-items-center rounded-full border border-[rgba(176,128,0,.18)]" style={{ width: size - 18, height: size - 18 }}>
              <Icon className="text-[#7a5a00]" style={{ width: size * 0.36, height: size * 0.36 }} strokeWidth={1.75} aria-hidden />
            </div>
          </div>
        ) : (
          <div className="relative grid size-full place-items-center rounded-full border-2 border-dashed border-line bg-surface">
            <svg className="absolute inset-0 -rotate-90" width={size} height={size} aria-hidden>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={4} />
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--loop)" strokeWidth={4} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
            </svg>
            <Lock className="text-ink-3" style={{ width: size * 0.26, height: size * 0.26 }} strokeWidth={1.75} aria-hidden />
          </div>
        )}
        {celebrate && !reduced ? (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-loop-light"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.7, opacity: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
          />
        ) : null}
      </motion.div>
      <figcaption>
        <span className="block text-small font-semibold text-ink">{name}</span>
        <span className="block text-[0.8125rem] text-ink-2 tnum">{unlocked ? "Unlocked" : `${Math.min(progress, threshold)} / ${threshold}`}</span>
      </figcaption>
    </figure>
  );
}
