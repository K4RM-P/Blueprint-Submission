"use client";

import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type PointerEvent } from "react";
import { ClayButton } from "@/components/clay";
import { LiquidDigits } from "@/components/liquid/liquid-digits";
import { useMotionPrefs } from "@/lib/motion";
import { HeroBaton } from "./hero-baton";
import { Metaballs } from "./metaballs";

const ROUTE = ["A business", "A volunteer", "A new owner"];

/**
 * Landing hero: "Pass it on." The baton is the "it": it rides the end of the
 * headline, its liquid core flowing toward the next owner, and the full stop is a
 * drop of the same liquid. Entrance is CSS (runs before hydration, ~1.4s, spring
 * curve). Pointer tilts the baton, moves its highlight and sloshes the liquid.
 * On scroll the baton drops toward the relay lane and a liquid line pours the
 * page into the next section. Reduced motion: everything rests in its final place.
 */
export function Hero({ devicesReused }: { devicesReused: number }) {
  const ref = useRef<HTMLElement>(null);
  const { reduced, lowPower } = useMotionPrefs();
  const inView = useInView(ref);
  const live = !reduced;

  // Pointer, normalised to -1..1 over the hero, smoothed by springs (no render per frame).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 16, mass: 1 });
  const sy = useSpring(py, { stiffness: 60, damping: 16, mass: 1 });
  const tilt = useTransform(sx, (v) => v * 2.4);
  const lift = useTransform(sy, (v) => v * 5);
  const lightX = useTransform(sx, (v) => v * 10);
  const lightY = useTransform(sy, (v) => v * 3);
  // Liquid lags behind and counter-rotates, so it reads as weight inside the glass.
  const sloshRaw = useTransform(sx, (v) => -v * 7);
  const slosh = useSpring(sloshRaw, { stiffness: 40, damping: 6, mass: 1.4 });
  const pullX = useTransform(sx, (v) => v * 140);
  const pullY = useTransform(sy, (v) => v * 90);

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!live || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  // Scroll hand-off: the baton sinks toward the relay lane as the hero leaves.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const handoff = useSpring(scrollYProgress, { stiffness: 90, damping: 20, mass: 1.2 });
  const dropY = useTransform(handoff, [0, 1], [0, 150]);
  const dropRotate = useTransform(handoff, [0, 1], [0, 4]);
  const dropScale = useTransform(handoff, [0, 1], [1, 0.82]);
  const copyY = useTransform(handoff, [0, 1], [0, -60]);
  const copyFade = useTransform(handoff, [0, 0.7], [1, 0.45]);
  const pour = useTransform(scrollYProgress, [0.05, 0.75], [0, 1]);

  const rotate = useTransform([tilt, dropRotate] as const, ([a, b]: number[]) => a + b);
  const y = useTransform([lift, dropY] as const, ([a, b]: number[]) => a + b);
  const metaballs = !reduced && !lowPower;

  return (
    <section
      ref={ref}
      aria-labelledby="hero-title"
      data-live={inView && live ? "true" : "false"}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="hero relative isolate"
    >
      {/* fluid backdrop: animated on capable desktops, a still version elsewhere */}
      <div aria-hidden className="hero-in pointer-events-none absolute inset-y-[-12%] right-[-18%] -z-10 w-[92%] opacity-60 [mask-image:radial-gradient(closest-side,#000_55%,transparent)] md:w-[70%] [--d:200ms]">
        <Metaballs className="size-full" pullX={pullX} pullY={pullY} still={!metaballs || !inView} />
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-6 pt-10 sm:px-6 md:pt-16 lg:pt-20">
        <p className="eyebrow hero-in [--d:0ms]">Free Geek Toronto × Relay</p>

        <h1 id="hero-title" className="font-display mt-5 text-[clamp(5.25rem,24vw,9.75rem)] leading-[0.86] tracking-[-0.05em] md:mt-7">
          <span className="block">
            <span className="hero-word [--d:60ms]">Pass</span> <span className="hero-word [--d:150ms]">it</span>
          </span>
          <span className="flex items-center gap-[0.12em]">
            <span className="hero-word relative shrink-0 text-loop-deep [--d:240ms]">
              on
              <span className="sr-only">.</span>
              <span aria-hidden className="hero-drop" />
            </span>
            {/* the baton rides the end of the sentence and bleeds off the right edge on phones */}
            <span aria-hidden className="hero-baton-in relative -my-[0.12em] ml-[0.3em] block w-[3em] min-w-0 shrink-0 md:w-[4.5em] [--d:320ms]">
              <motion.span className="block will-change-transform" style={live ? { rotate, y, scale: dropScale, transformOrigin: "20% 50%" } : undefined}>
                <HeroBaton lightX={lightX} lightY={lightY} slosh={slosh} />
              </motion.span>
            </span>
          </span>
        </h1>

        <motion.div style={live ? { y: copyY, opacity: copyFade } : undefined} className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6 lg:col-span-6">
            <p className="hero-in max-w-[30rem] text-body-l text-ink-2 [--d:420ms]">
              Your company&apos;s retired laptops, rebuilt by Free Geek Toronto volunteers and handed to students, newcomers and families. Every handoff is on the record.
            </p>
            <div className="hero-in mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center [--d:520ms]">
              <ClayButton href="/login?mode=signup" variant="primary" size="lg">
                Become a Reuse Partner
              </ClayButton>
              <ClayButton href="#scan" variant="secondary" size="lg">
                Scan a Passport
              </ClayButton>
            </div>
          </div>

          {/* live proof: a reading on the instrument, not a sticker */}
          <div className="hero-in md:col-span-5 md:col-start-7 lg:col-start-7 [--d:640ms]">
            <div className="flex items-end gap-4">
              <LiquidDigits value={devicesReused} label={`${devicesReused.toLocaleString("en-CA")} devices back in use`} className="text-[2.75rem] sm:text-[3.25rem]" />
              <p className="pb-1 text-small leading-snug text-ink-2" aria-hidden>
                devices back in use,
                <br />
                counted live
              </p>
            </div>
            <ol className="mt-5 flex items-center gap-2 font-mono max-[380px]:text-[0.625rem] text-[0.6875rem] uppercase tracking-[0.1em] text-ink-3" aria-label="The route every device takes">
              {ROUTE.map((r, i) => (
                <li key={r} className="flex items-center gap-2 whitespace-nowrap">
                  {i > 0 ? <span aria-hidden className="route-dash h-px w-4 bg-loop-light lg:w-8" style={{ animationDelay: `${0.75 + i * 0.18}s` }} /> : null}
                  <span className={i === ROUTE.length - 1 ? "text-loop-deep" : undefined}>{r}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </div>

      {/* the pour: liquid carries the reader into the relay below (no hard edge) */}
      <div aria-hidden className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <span className="well relative ml-0.5 mt-8 block h-20 w-1.5 overflow-hidden rounded-full md:h-24">
          <motion.span className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-loop-light to-loop" style={{ scaleY: live ? pour : 1 }} />
        </span>
      </div>
    </section>
  );
}
