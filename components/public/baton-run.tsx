"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import { ClayBaton } from "@/components/illustrations/clay-baton";

export interface RelayStation {
  /** Whose hands the baton is in, e.g. "A Toronto business". */
  hand: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
}

/** Squash amount (0..1) as the baton passes through a handoff point. */
function bumpAt(v: number, stops: number[], width = 0.035) {
  let b = 0;
  for (const s of stops) b = Math.max(b, 1 - Math.abs(v - s) / width);
  return Math.max(0, b);
}

/**
 * The Baton Run (Signature Moment 1): the landing page's one pinned, scroll-linked
 * showpiece. A clay baton with a liquid core travels the relay lane; at every
 * handoff it squashes, the receiving station lights up and a single liquid ring
 * spreads from the node. Scrolling up runs it backwards. Desktop pins; phones get
 * a vertical lane that follows normal scroll. Reduced motion: every station lit,
 * baton resting at the finish.
 */
export function BatonRun({ stations }: { stations: RelayStation[] }) {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const n = stations.length;
  const stops = stations.map((_, i) => (i + 0.5) / n);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 1.2 });
  const travel = useTransform(progress, [0.08, 0.8], [stops[0], stops[n - 1]], { clamp: true });
  // Arrival starts while the section is still entering the viewport, as the hero hands off.
  const { scrollYProgress: entering } = useScroll({ target: ref, offset: ["start 75%", "start start"] });
  const arrive = useSpring(entering, { stiffness: 120, damping: 14, mass: 1 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(travel, "change", (v) => {
    let a = 0;
    stops.forEach((s, i) => {
      if (v >= s - 0.012) a = i;
    });
    setActive(a);
  });
  const shown = reduced ? n - 1 : active;

  return (
    <section ref={ref} aria-labelledby="relay-title" className={cn("relative", reduced ? "" : "md:h-[200vh]")}>
      <div className={cn("flex flex-col justify-center pb-20 pt-6", reduced ? "md:py-28" : "md:sticky md:top-0 md:h-dvh md:justify-start md:py-0 md:pt-[14vh]")}>
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <div className="grid items-end gap-6 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="eyebrow">The relay</p>
              <h2 id="relay-title" className="font-display mt-3 max-w-2xl text-[2.25rem] leading-[1.02] sm:text-display-m">
                Four handoffs. Every one on the record.
              </h2>
            </div>
            <p className="text-ink-2 md:col-span-4 md:pb-1">
              Follow one laptop from an office desk to a student&apos;s backpack. Scroll, and the baton runs the relay with the real counts from Free Geek Toronto&apos;s bench.
            </p>
          </div>

          {/* Desktop: horizontal relay lane over a 4-column station grid */}
          <div className="mt-14 hidden md:block">
            <Lane stations={stations} stops={stops} travel={travel} arrive={arrive} shown={shown} reduced={reduced} />
            <ol className="mt-10 grid grid-cols-4 gap-5">
              {stations.map((s, i) => (
                <li key={s.title}>
                  <StationCard station={s} index={i} lit={i <= shown} receiving={i === shown} />
                </li>
              ))}
            </ol>
          </div>

          {/* Phone: a vertical lane that follows normal scroll (no pinning on small screens) */}
          <VerticalRun stations={stations} reduced={reduced} />
        </div>
      </div>
    </section>
  );
}

function Lane({ stations, stops, travel, arrive, shown, reduced }: { stations: RelayStation[]; stops: number[]; travel: MotionValue<number>; arrive: MotionValue<number>; shown: number; reduced: boolean }) {
  const laneRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = laneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const finish = stops[stops.length - 1];
  const x = useTransform(travel, (v) => (reduced ? finish : v) * width);
  const fill = useTransform(travel, (v) => (reduced ? finish : v));
  const squash = useTransform(travel, (v) => (reduced ? 0 : bumpAt(v, stops.slice(1))));
  const scaleX = useTransform(squash, (b) => 1 - 0.16 * b);
  const scaleY = useTransform(squash, (b) => 1 + 0.14 * b);
  // The hero's baton drops in from above: the lane catches it, squashes, then the run starts.
  const catchY = useTransform(arrive, [0, 1], reduced ? [0, 0] : [-90, 0]);
  const caught = useTransform(arrive, [0, 0.5], reduced ? [1, 1] : [0, 1]);

  return (
    <div ref={laneRef} className="relative h-16" aria-hidden>
      {/* lane: a well pressed into the page, filling with liquid behind the baton */}
      <div className="well absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 overflow-hidden rounded-full">
        <motion.div className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-loop-light to-loop" style={{ scaleX: fill }} />
      </div>
      {stations.map((s, i) => (
        <div key={s.title} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${stops[i] * 100}%` }}>
          <span className={cn("relative grid size-6 place-items-center rounded-full border-4 border-canvas transition-colors duration-300", i <= shown ? "bg-loop" : "bg-[#E1D9CC]")}>
            {i === shown && i > 0 && !reduced ? (
              <motion.span
                key={`ring-${i}`}
                className="absolute size-6 rounded-full border-2 border-loop-light"
                initial={{ scale: 0.6, opacity: 0.7 }}
                animate={{ scale: 3.2, opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
              />
            ) : null}
          </span>
          <span className={cn("absolute left-1/2 top-9 -translate-x-1/2 whitespace-nowrap font-mono text-[0.6875rem] uppercase tracking-[0.1em] transition-colors", i <= shown ? "text-loop-deep" : "text-ink-3")}>
            {s.hand}
          </span>
        </div>
      ))}
      <motion.div className="absolute left-0 top-1/2 -ml-12 -mt-5 w-24" style={{ x, y: catchY, scaleX, scaleY, opacity: caught }}>
        <ClayBaton core={0.35 + 0.65 * ((shown + 1) / stations.length)} />
      </motion.div>
    </div>
  );
}

function VerticalRun({ stations, reduced }: { stations: RelayStation[]; reduced: boolean }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [height, setHeight] = useState(0);
  const n = stations.length;
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setHeight(e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 55%"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 1.2 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(p, "change", (v) => setActive(Math.min(n - 1, Math.floor(v * n + 0.15))));
  const y = useTransform(p, (v) => (reduced ? 1 : v) * Math.max(0, height - 120) + 32);
  const fill = useTransform(p, (v) => (reduced ? 1 : v));
  const shown = reduced ? n - 1 : active;

  return (
    <ol ref={listRef} className="relative mt-10 grid gap-4 pl-14 md:hidden">
      <span aria-hidden className="well absolute bottom-8 left-[18px] top-8 w-3 overflow-hidden rounded-full">
        <motion.span className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-loop-light to-loop" style={{ scaleY: fill }} />
      </span>
      <motion.span aria-hidden className="absolute left-[-6px] top-0 w-[60px] origin-center rotate-90" style={{ y }}>
        <ClayBaton core={(shown + 1) / n} />
      </motion.span>
      {stations.map((s, i) => (
        <li key={s.title}>
          <p className={cn("mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em]", i <= shown ? "text-loop-deep" : "text-ink-3")}>{s.hand}</p>
          <StationCard station={s} index={i} lit={i <= shown} receiving={i === shown} />
        </li>
      ))}
    </ol>
  );
}

function StationCard({ station, index, lit, receiving }: { station: RelayStation; index: number; lit: boolean; receiving: boolean }) {
  const { t, reduced } = useMotionPrefs();
  return (
    <motion.div
      // ≤ 2 tints per view (§12): only the station holding the baton turns mint.
      data-tint={receiving ? "mint" : "porcelain"}
      initial={false}
      animate={{ y: receiving ? -8 : 0, scale: lit || reduced ? 1 : 0.97, opacity: lit || reduced ? 1 : 0.62 }}
      transition={t("soft")}
      className="clay-glass hairline-top relative flex h-full flex-col overflow-hidden p-5 transition-[background-color] duration-500 md:p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn("font-display text-[2.5rem] leading-none tnum transition-colors md:text-[3rem]", lit ? "text-ink" : "text-ink-3")}>{station.stat}</p>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-3">Leg {index + 1}</p>
      </div>
      <p className="mt-1 text-small text-ink-2">{station.statLabel}</p>
      <h3 className={cn("mt-6 text-lg font-semibold leading-snug transition-colors", lit ? "text-ink" : "text-ink-2")}>{station.title}</h3>
      <p className="mt-1 text-small text-ink-2">{station.body}</p>
      {/* the handoff: liquid pours along the card's floor when the baton arrives */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 overflow-hidden">
        <motion.span
          className="absolute inset-0 origin-left bg-gradient-to-r from-loop-light to-loop"
          initial={false}
          animate={{ scaleX: lit ? 1 : 0 }}
          transition={t("liquid")}
        />
      </span>
    </motion.div>
  );
}
