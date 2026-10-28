"use client";

import { motion } from "motion/react";
import { Award, Cpu, HardDrive, Lock, ShieldCheck, Stethoscope, Terminal, Trophy, Users, Wrench } from "lucide-react";
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
  const Icon = icons[slug as BadgeIcon] ?? Award;
  const { reduced, t } = useMotionPrefs();
  const pct = Math.max(0, Math.min(1, threshold > 0 ? progress / threshold : 0));
  const live = Boolean(celebrate) && !reduced;
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;

  return (
    <figure className={cn("flex flex-col items-center gap-2 text-center", className)}>
      {/* Coin mint (Signature Moment 11): drops in, spins once on its edge, lands with a squash. */}
      <motion.div
        className="relative"
        style={{ width: size, height: size, transformPerspective: 600 }}
        initial={live ? { y: -110, opacity: 0, rotateY: 0 } : false}
        animate={live ? { y: 0, opacity: 1, rotateY: 360 } : undefined}
        transition={live ? { y: t("bouncy"), opacity: { duration: 0.15 }, rotateY: { duration: 0.85, ease: [0.25, 0.1, 0.2, 1] } } : undefined}
      >
        <motion.div
          className="size-full origin-bottom"
          initial={false}
          animate={live ? { scaleY: [1, 1, 0.84, 1.04, 1], scaleX: [1, 1, 1.1, 0.98, 1] } : undefined}
          transition={live ? { duration: 0.9, times: [0, 0.42, 0.56, 0.76, 1], ease: "easeOut" } : undefined}
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
        </motion.div>
        {live ? (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-loop-light"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.2, 0, 0, 1] }}
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
