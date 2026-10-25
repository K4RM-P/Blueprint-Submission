"use client";

import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent } from "react";
import { ArrowRight } from "lucide-react";
import { ClayButton } from "@/components/clay";
import { useMotionPrefs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";
import { HeroBaton } from "./hero-baton";

export interface HeroLeg {
  /** Where on the baton this leg's callout points, as % of the stage width (desktop). */
  at: number;
  label: string;
  stat: number;
  caption: string;
  /** Callout sits above the baton instead of below. */
  above?: boolean;
}

/**
 * Landing hero, "Pass it on.". A live ticker over a single huge line, a two-tone
 * supporting sentence with the CTAs, then the baton presented like a product on
 * a framed stage: grid, crosshairs, halo, reflection and spec callouts that point
 * at each part of the baton with a live count. The stage tilts flat as it scrolls
 * in. Entrance is CSS (runs before hydration); pointer tilts the baton, moves its
 * highlight and sloshes the liquid. Reduced motion: everything rests in place.
 */
export function Hero({ devicesReused, legs }: { devicesReused: number; legs: HeroLeg[] }) {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const inView = useInView(ref);
  const live = !reduced;

  // Pointer over the stage, -1..1, smoothed by springs (no render per frame).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 16 });
  const sy = useSpring(py, { stiffness: 60, damping: 16 });
  const tilt = useTransform(sx, (v) => v * 2.2);
  const lift = useTransform(sy, (v) => v * 6);
  const lightX = useTransform(sx, (v) => v * 10);
  const lightY = useTransform(sy, (v) => v * 3);
  const sloshRaw = useTransform(sx, (v) => -v * 7);
  const slosh = useSpring(sloshRaw, { stiffness: 40, damping: 6, mass: 1.4 });
  const spotX = useTransform(sx, (v) => `${50 + v * 22}%`);
  const spotY = useTransform(sy, (v) => `${46 + v * 18}%`);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!live || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  // The stage lies back like a product on a table, then stands up as it scrolls in.
  const { scrollYProgress: rise } = useScroll({ target: stageRef, offset: ["start end", "start 25%"] });
  const riseS = useSpring(rise, { stiffness: 90, damping: 22, mass: 1 });
  const rotateX = useTransform(riseS, [0, 1], [18, 0]);
  const scale = useTransform(riseS, [0, 1], [0.94, 1]);

  return (
    <section ref={ref} id="hero" aria-labelledby="hero-title" data-live={inView && live ? "true" : "false"} className="hero relative isolate">
      <div className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6 md:pt-16 lg:pt-20">
        {/* live ticker: a running number, not a slogan */}
        <Link href="/impact" className="hero-in group inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-small text-ink-2 [--d:0ms]">
          <span aria-hidden className="size-2 rounded-full bg-loop-light shadow-[0_0_0_3px_rgba(47,191,138,0.18)]" />
          <span className="font-medium text-ink">Devices back in use through Relay:</span>
          <CountUp value={devicesReused} className="font-mono text-ink-2" />
          <ArrowRight aria-hidden className="size-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <h1 id="hero-title" className="hero-title font-display mt-6 text-[clamp(6rem,27vw,11.5rem)] leading-[0.84] md:mt-8">
          <span className="hero-word [--d:60ms]">Pass</span> <span className="hero-word [--d:140ms]">it</span>{" "}
          <span className="hero-word relative text-loop-deep [--d:220ms]">
            on
            <span className="sr-only">.</span>
            <span aria-hidden className="hero-drop" />
          </span>
        </h1>

        <div className="mt-9 grid gap-8 md:mt-12 md:grid-cols-12 md:items-end">
          <p className="hero-in text-[1.375rem] font-medium leading-[1.3] tracking-[-0.015em] text-ink sm:text-[1.625rem] md:col-span-7 lg:col-span-6 [--d:380ms]">
            Retired business laptops, wiped and rebuilt by Free Geek Toronto volunteers.{" "}
            <span className="text-ink-3">Then handed to the students, newcomers and families who need one.</span>
          </p>
          <div className="hero-in flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap md:col-span-5 md:justify-end lg:col-span-6 [--d:480ms]">
            <ClayButton href="/login?mode=signup" variant="primary" size="lg">
              Become a Reuse Partner
            </ClayButton>
            <ClayButton href="#scan" variant="secondary" size="lg">
              Scan a Passport
            </ClayButton>
          </div>
        </div>

        {/* the stage: the baton presented like a product */}
        <div ref={stageRef} className="hero-in mt-14 [perspective:1800px] md:mt-20 [--d:560ms]">
          <motion.div
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            style={live ? { rotateX, scale, transformOrigin: "50% 0%" } : undefined}
            className="stage relative overflow-hidden rounded-[28px] md:rounded-[36px]"
          >
            <span aria-hidden className="stage-grid absolute inset-0" />
            <motion.span aria-hidden className="stage-spot absolute inset-0" style={live ? ({ "--sx": spotX, "--sy": spotY } as unknown as CSSProperties) : undefined} />
            {["left-4 top-4", "right-4 top-4", "bottom-4 left-4", "bottom-4 right-4"].map((p) => (
              <span key={p} aria-hidden className={cn("crosshair absolute", p)} />
            ))}
            <p aria-hidden className="absolute left-10 top-[14px] font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
              Fig 0.1 · The baton
            </p>
            <p aria-hidden className="absolute right-10 top-[14px] hidden items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3 sm:flex">
              <span className="size-1.5 rounded-full bg-loop-light" /> Live counts
            </p>

            <div className="relative px-5 pb-8 pt-16 md:h-[520px] md:px-0 md:pb-0 md:pt-0">
              <span aria-hidden className="stage-halo absolute left-1/2 top-[18%] h-[50%] w-[80%] -translate-x-1/2 md:top-[14%] md:h-[60%] md:w-[70%]" />
              <div className="relative mx-auto w-full md:absolute md:left-1/2 md:top-[148px] md:w-[62%] md:-translate-x-1/2">
                <div className="hero-baton-in [--d:700ms]">
                  <motion.div style={live ? { rotate: tilt, y: lift } : undefined}>
                    <HeroBaton lightX={lightX} lightY={lightY} slosh={slosh} />
                  </motion.div>
                </div>
                {/* reflection on the stage floor */}
                <div aria-hidden className="stage-reflection hero-baton-in pointer-events-none -mt-2 [--d:700ms]">
                  <HeroBaton />
                </div>
              </div>

              {/* spec callouts: desktop points at the part; phones get a tidy three-up row */}
              <ol className="relative mt-4 grid grid-cols-3 gap-3 md:contents">
                {legs.map((l, i) => (
                  <li
                    key={l.label}
                    className={cn("callout hero-in md:absolute", l.above ? "callout-above" : "callout-below")}
                    style={{ "--at": `${l.at}%`, "--d": `${900 + i * 140}ms` } as CSSProperties}
                  >
                    <span aria-hidden className="callout-line hidden md:block" />
                    <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-3 md:text-[0.6875rem]">
                      {String(i + 1).padStart(2, "0")} · {l.label}
                    </p>
                    <p className="mt-1.5 font-display text-[1.75rem] leading-none text-ink md:text-[2.25rem]">
                      <CountUp value={l.stat} />
                    </p>
                    <p className="mt-1 text-[0.75rem] leading-snug text-ink-2 md:text-small">{l.caption}</p>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
