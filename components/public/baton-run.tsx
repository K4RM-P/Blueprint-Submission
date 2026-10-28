"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import { SectionHead } from "@/components/landing/section-head";

export interface RelayStation {
  /** Whose hands the baton is in, e.g. "A Toronto business". */
  hand: string;
  title: string;
  body: string;
  stat: string;
  statLabel: string;
}

/**
 * The Baton Run (Signature Moment 1): the landing page's one pinned, scroll-linked
 * showpiece. One device, tagged with its passport code, travels a hairline track
 * that inks in behind it; at every handoff the receiving station lights up and a ring
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
      <div className={cn("flex flex-col justify-center pb-20 pt-16", reduced ? "md:py-28" : "md:sticky md:top-0 md:h-dvh md:justify-start md:py-0 md:pt-[13vh]")}>
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <SectionHead
            id="relay-title"
            label="The relay"
            title="One laptop, five handoffs."
            muted="Every one on the record."
            aside={<p className="text-ink-2">Follow one laptop from an office desk to its next owner, and the story back to the business that gave it. Live counts from Relay&apos;s records (fictional demo data here).</p>}
          />

          {/* Desktop: horizontal relay lane over one station column per handoff */}
          <div className="mt-14 hidden md:block">
            <Lane stations={stations} stops={stops} travel={travel} arrive={arrive} shown={shown} reduced={reduced} />
            <ol className="mt-10 grid gap-5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
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
  // The device tag drops in from above as the hero hands off, then the run starts.
  const catchY = useTransform(arrive, [0, 1], reduced ? [0, 0] : [-40, 0]);
  const caught = useTransform(arrive, [0, 0.5], reduced ? [1, 1] : [0, 1]);

  return (
    <div ref={laneRef} className="relative h-16" aria-hidden>
      {/* track: a hairline, inked in solid green behind the device as it travels */}
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line">
        <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-loop" style={{ scaleX: fill }} />
      </div>
      {stations.map((s, i) => (
        <div key={s.title} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${stops[i] * 100}%` }}>
          <span className={cn("relative block size-2.5 rounded-full border transition-colors duration-300", i <= shown ? "border-loop bg-loop" : "border-[#cfc6b8] bg-canvas")}>
            {i === shown && i > 0 && !reduced ? (
              <motion.span
                key={`ring-${i}`}
                className="absolute -inset-px rounded-full border border-loop"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 3.4, opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
              />
            ) : null}
          </span>
          <span className={cn("absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap font-mono text-[0.6875rem] uppercase tracking-[0.1em] transition-colors", i <= shown ? "text-ink" : "text-ink-3")}>
            {s.hand}
          </span>
        </div>
      ))}
      <motion.div className="absolute left-0 top-1/2 -translate-x-1/2" style={{ x, y: catchY, opacity: caught }}>
        <DeviceTag />
      </motion.div>
    </div>
  );
}

/** The thing being relayed: one device, shown as its passport code on a flat ink tag above the track. */
function DeviceTag() {
  return (
    <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center">
      <span className="whitespace-nowrap rounded-md bg-ink px-2 py-1 font-mono text-[0.6875rem] font-medium tracking-[0.04em] text-white shadow-[0_6px_16px_-6px_rgba(23,32,28,0.5)]">FGT-7Q2K</span>
      <span className="h-2.5 w-px bg-ink" />
    </span>
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
      <span aria-hidden className="absolute bottom-8 left-[23px] top-8 w-px bg-line">
        <motion.span className="absolute inset-0 origin-top bg-loop" style={{ scaleY: fill }} />
      </span>
      <motion.span aria-hidden className="absolute left-[19px] top-0 size-[9px] rounded-full bg-loop shadow-[0_0_0_4px_var(--canvas),0_0_0_5px_rgba(19,138,97,0.35)]" style={{ y }} />
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
      initial={false}
      animate={{ y: receiving ? -8 : 0, scale: lit || reduced ? 1 : 0.97, opacity: lit || reduced ? 1 : 0.62 }}
      transition={t("soft")}
      className={cn("relative flex h-full flex-col overflow-hidden rounded-[var(--r-md)] border bg-surface-flat p-5 transition-[border-color,box-shadow] duration-500 md:p-6", receiving ? "border-loop/35 shadow-[0_18px_40px_-24px_rgba(19,94,66,0.45)]" : "border-line")}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn("font-display text-[2.5rem] font-semibold leading-none tracking-[-0.05em] tnum transition-colors md:text-[3rem]", lit ? "text-ink" : "text-ink-3")}>{station.stat}</p>
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-3">Handoff {index + 1}</p>
      </div>
      <p className="mt-1 text-small text-ink-2">{station.statLabel}</p>
      <h3 className={cn("mt-6 text-lg font-semibold leading-snug transition-colors", lit ? "text-ink" : "text-ink-2")}>{station.title}</h3>
      <p className="mt-1 text-small text-ink-2">{station.body}</p>
      {/* the handoff: a green rule draws along the card's floor when the device arrives */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
        <motion.span
          className="absolute inset-0 origin-left bg-loop"
          initial={false}
          animate={{ scaleX: lit ? 1 : 0 }}
          transition={t("liquid")}
        />
      </span>
    </motion.div>
  );
}
