"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Building2, HardDrive, HeartHandshake, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

export interface LoopStation {
  title: string;
  body: string;
  stat: string;
  statLabel: string;
}

const ICONS = [<Building2 key="a" />, <HardDrive key="b" />, <Wrench key="c" />, <HeartHandshake key="d" />];
const TINTS = ["apricot", "sky", "butter", "mint"] as const;

/** Points along the loop path (viewBox 1000 × 520) for the four stations. */
const NODES = [
  { x: 150, y: 120 },
  { x: 850, y: 120 },
  { x: 850, y: 400 },
  { x: 150, y: 400 },
];
const PATH = "M150 120 H850 a140 140 0 0 1 0 280 H150 a140 140 0 0 1 0 -280";

/**
 * The page's one pinned, scroll-driven showpiece (UI §9.1.2): a liquid FlowLine
 * travels the loop and each clay station lights up as it arrives.
 * Reduced motion: a calm static loop with every station lit.
 */
export function TheLoop({ stations }: { stations: LoopStation[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 1.2 });
  const length = useTransform(progress, [0.05, 0.9], [0, 1]);
  const [active, setActive] = useState(reduced ? 3 : 0);
  useMotionValueEvent(progress, "change", (v) => {
    if (reduced) return;
    setActive(v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.72 ? 2 : 3);
  });
  const shown = reduced ? 3 : active;

  return (
    <section ref={ref} aria-labelledby="loop-title" className={cn("relative", reduced ? "" : "h-[320vh]")}>
      <div className={cn("flex flex-col justify-center", reduced ? "py-24" : "sticky top-0 h-dvh")}>
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The loop</p>
              <h2 id="loop-title" className="font-display mt-3 max-w-xl text-[2.25rem] leading-[1.02] sm:text-display-m">
                Every laptop takes the same four steps back into someone&apos;s hands.
              </h2>
            </div>
            <p className="font-mono text-small text-ink-3 tnum" aria-hidden>
              0{shown + 1} / 04
            </p>
          </div>

          <div className="relative mt-10 hidden md:block">
            <svg viewBox="0 0 1000 520" className="w-full" aria-hidden>
              <defs>
                <linearGradient id="loop-liquid" x1="0" x2="1">
                  <stop offset="0" stopColor="#2FBF8A" />
                  <stop offset="1" stopColor="#138A61" />
                </linearGradient>
              </defs>
              <path d={PATH} fill="none" stroke="#E7E0D5" strokeWidth="18" strokeLinecap="round" />
              <motion.path d={PATH} fill="none" stroke="url(#loop-liquid)" strokeWidth="18" strokeLinecap="round" style={{ pathLength: reduced ? 1 : length }} />
              <path d={PATH} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" transform="translate(0 -5)" />
            </svg>
            {stations.map((s, i) => (
              <Station key={s.title} station={s} index={i} lit={i <= shown} style={{ left: `${(NODES[i].x / 1000) * 100}%`, top: `${(NODES[i].y / 520) * 100}%` }} />
            ))}
          </div>

          <ol className="mt-8 grid gap-4 md:hidden">
            {stations.map((s, i) => (
              <li key={s.title}>
                <StationCard station={s} index={i} lit={i <= shown} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Station({ station, index, lit, style }: { station: LoopStation; index: number; lit: boolean; style: React.CSSProperties }) {
  const below = index >= 2;
  return (
    <div className="absolute w-[min(300px,30vw)] -translate-x-1/2" style={{ ...style, transform: `translate(-50%, ${below ? "-18%" : "-82%"})` }}>
      <StationCard station={station} index={index} lit={lit} />
    </div>
  );
}

function StationCard({ station, index, lit }: { station: LoopStation; index: number; lit: boolean }) {
  const { t } = useMotionPrefs();
  return (
    <motion.div
      data-tint={lit ? TINTS[index] : "porcelain"}
      animate={{ scale: lit ? 1 : 0.96, opacity: lit ? 1 : 0.55 }}
      transition={t("soft")}
      className="clay-glass hairline-top flex gap-4 p-5"
    >
      <span data-tint={TINTS[index]} className="clay-sm grid size-11 shrink-0 place-items-center rounded-[14px] text-loop-deep [&_svg]:size-[22px] [&_svg]:stroke-[1.75]" aria-hidden>
        {ICONS[index]}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-3">Step {index + 1}</p>
        <h3 className="mt-0.5 font-semibold leading-snug">{station.title}</h3>
        <p className="mt-1 text-small text-ink-2">{station.body}</p>
        <p className="mt-3 font-display text-[1.75rem] leading-none tnum">
          {station.stat}
          <span className="ml-2 font-sans text-small font-medium tracking-normal text-ink-2">{station.statLabel}</span>
        </p>
      </div>
    </motion.div>
  );
}
