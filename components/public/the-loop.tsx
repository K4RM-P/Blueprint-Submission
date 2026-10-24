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

/** Track path (viewBox 1000 × 40), drawn under the 4-column station grid. */
const TRACK = "M20 20 H980";

/**
 * The page's one pinned, scroll-driven showpiece (UI §9.1.2): a horizontal liquid
 * track fills as you scroll and each clay station in the grid below lights up when
 * the liquid reaches it. Stations live in a normal 4-column grid, so nothing can
 * spill off-screen. Reduced motion: a calm static track with every station lit.
 */
export function TheLoop({ stations }: { stations: LoopStation[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 1.2 });
  const length = useTransform(progress, [0.05, 0.85], [0.04, 1]);
  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (v) => {
    if (reduced) return;
    setActive(v < 0.22 ? 0 : v < 0.45 ? 1 : v < 0.66 ? 2 : 3);
  });
  const shown = reduced ? 3 : active;

  return (
    <section ref={ref} aria-labelledby="loop-title" className={cn("relative", reduced ? "" : "md:h-[220vh]")}>
      <div className={cn("flex flex-col justify-center py-20", reduced ? "md:py-24" : "md:sticky md:top-0 md:h-dvh md:py-0")}>
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The loop</p>
              <h2 id="loop-title" className="font-display mt-3 max-w-xl text-[2.25rem] leading-[1.02] sm:text-display-m">
                Every laptop takes the same four steps back into someone&apos;s hands.
              </h2>
            </div>
            <p className="hidden font-mono text-small text-ink-3 tnum md:block" aria-hidden>
              0{shown + 1} / 04
            </p>
          </div>

          {/* Desktop: liquid track over a 4-column station grid */}
          <div className="mt-12 hidden md:block">
            <div className="relative">
              <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="h-10 w-full overflow-visible" aria-hidden>
                <defs>
                  <linearGradient id="loop-liquid" x1="0" x2="1">
                    <stop offset="0" stopColor="#2FBF8A" />
                    <stop offset="1" stopColor="#138A61" />
                  </linearGradient>
                </defs>
                <path d={TRACK} fill="none" stroke="#E7E0D5" strokeWidth="14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <motion.path
                  d={TRACK}
                  fill="none"
                  stroke="url(#loop-liquid)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ pathLength: reduced ? 1 : length }}
                />
              </svg>
              {/* Station nodes sit on the track at each column's centre */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-4" aria-hidden>
                {stations.map((s, i) => (
                  <div key={s.title} className="flex items-center justify-center">
                    <motion.span
                      animate={{ scale: i <= shown ? 1 : 0.7 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
                      className={cn(
                        "grid size-7 place-items-center rounded-full border-4 border-canvas",
                        i <= shown ? "bg-loop" : "bg-[#E7E0D5]",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
            <ol className="mt-8 grid grid-cols-4 gap-5">
              {stations.map((s, i) => (
                <li key={s.title}>
                  <StationCard station={s} index={i} lit={i <= shown} />
                </li>
              ))}
            </ol>
          </div>

          {/* Phone: a simple vertical list, every station lit (no scroll-jacking on small screens) */}
          <ol className="relative mt-8 grid gap-4 md:hidden">
            <span className="absolute bottom-6 left-[calc(1.25rem+19px)] top-6 w-1.5 rounded-full bg-gradient-to-b from-loop-light to-loop" aria-hidden />
            {stations.map((s, i) => (
              <li key={s.title} className="relative">
                <StationCard station={s} index={i} lit />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function StationCard({ station, index, lit }: { station: LoopStation; index: number; lit: boolean }) {
  const { t } = useMotionPrefs();
  return (
    <motion.div
      data-tint={lit ? TINTS[index] : "porcelain"}
      animate={{ y: lit ? 0 : 8, opacity: lit ? 1 : 0.55 }}
      transition={t("soft")}
      className="clay-glass hairline-top flex h-full gap-4 p-5 md:flex-col"
    >
      <span data-tint={TINTS[index]} className="clay-sm relative grid size-11 shrink-0 place-items-center rounded-[14px] text-loop-deep [&_svg]:size-[22px] [&_svg]:stroke-[1.75]" aria-hidden>
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
