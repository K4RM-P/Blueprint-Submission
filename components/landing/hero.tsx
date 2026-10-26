"use client";

import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { ClayButton } from "@/components/clay";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { useMotionPrefs } from "@/lib/motion";
import { CountUp } from "./count-up";
import { DashboardPreview, type PreviewTotals } from "./dashboard-preview";

/**
 * Landing hero, "Pass it on.". Centered, Apple/Vercel-style: a live pill, one
 * huge line, a two-tone sentence speaking to the business retiring laptops (the
 * Reuse Partner promise), the CTAs, then the product itself: the
 * Partner Portal in a window that lies back and stands up as it scrolls in, on
 * a mint glow. Entrance is CSS (runs
 * before hydration). Reduced motion: everything rests in place.
 */
export function Hero({ devicesReused, totals }: { devicesReused: number; totals: PreviewTotals }) {
  const ref = useRef<HTMLElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const inView = useInView(ref);
  const live = !reduced;

  const { scrollYProgress: rise } = useScroll({ target: shotRef, offset: ["start end", "start 20%"] });
  const riseS = useSpring(rise, { stiffness: 90, damping: 22, mass: 1 });
  const rotateX = useTransform(riseS, [0, 1], [24, 0]);
  const scale = useTransform(riseS, [0, 1], [0.9, 1]);
  const y = useTransform(riseS, [0, 1], [40, 0]);

  return (
    <section ref={ref} id="hero" aria-labelledby="hero-title" data-live={inView && live ? "true" : "false"} className="hero relative isolate overflow-x-clip">
      <span aria-hidden className="hero-aura absolute inset-x-0 top-0 -z-10 h-[1100px]" />
      {/* a current of hairlines sweeping behind the headline, in the relay's green */}
      <div aria-hidden className="hero-paths pointer-events-none absolute left-1/2 top-0 -z-10 h-[760px] w-[max(100%,1440px)] -translate-x-1/2 text-loop-deep md:h-[900px]">
        <FloatingPathsBackground position={1} className="absolute inset-0" />
        <FloatingPathsBackground position={-1} className="absolute inset-0" />
      </div>
      <div className="mx-auto max-w-[1200px] px-4 pt-12 text-center sm:px-6 md:pt-20 lg:pt-24">
        <Link href="/impact" className="hero-in group inline-flex items-center gap-3 text-small text-ink-2 [--d:0ms]">
          <span className="inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-loop-deep">
            <span aria-hidden className="live-dot size-1.5 rounded-full bg-loop" /> Live
          </span>
          <span aria-hidden className="h-3.5 w-px bg-line" />
          <span>
            <CountUp value={devicesReused} className="font-semibold text-ink" /> devices back in use
          </span>
          <span className="hidden items-center gap-1 font-medium text-ink underline decoration-line sm:inline-flex underline-offset-4 transition-colors group-hover:decoration-ink">
            See the impact <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <h1 id="hero-title" className="hero-title font-display mx-auto mt-8 text-[clamp(4.75rem,19vw,10.5rem)] leading-[0.86] md:mt-10">
          <span className="hero-word [--d:60ms]">Pass</span> <span className="hero-word [--d:140ms]">it</span>{" "}
          <span className="hero-word hero-ink relative [--d:220ms]">
            on
            <span className="sr-only">.</span>
            <span aria-hidden className="hero-drop" />
          </span>
        </h1>

        <p className="hero-in mx-auto mt-8 max-w-[44rem] text-[1.1875rem] font-medium leading-[1.4] tracking-[-0.012em] text-ink sm:text-[1.375rem] md:mt-10 [--d:380ms]">
          Retiring your company&apos;s laptops? Give them to Free Geek Toronto for free.{" "}
          <span className="text-ink-3">Every drive gets a certified data wipe, and each laptop&apos;s Device Passport shows you who it helps in Toronto.</span>
        </p>

        <div className="hero-in mt-9 flex flex-col items-center justify-center gap-3 min-[420px]:flex-row [--d:480ms]">
          <ClayButton href="/become-a-partner" variant="primary" size="lg" iconRight={<ArrowRight />}>
            Become a Reuse Partner
          </ClayButton>
          <ClayButton href="#passport" variant="secondary" size="lg">
            See a Device Passport
          </ClayButton>
        </div>
        <p className="hero-in mt-4 text-[0.8125rem] text-ink-3 [--d:540ms]">Free for businesses · Certified data wipe for every batch · No price rise for the people Free Geek Toronto serves</p>

        {/* the product shot */}
        <div ref={shotRef} className="hero-in relative mt-16 [perspective:2000px] md:mt-24 [--d:620ms]">
          <span aria-hidden className="shot-glow absolute inset-x-[6%] top-[8%] -z-10 h-[80%]" />
          <motion.div style={live ? { rotateX, scale, y, transformOrigin: "50% 0%" } : undefined} role="img" aria-label="Example Partner Portal dashboard: devices received, verified and back in use, a chart over time, who the laptops help, and recent batches.">
            <div aria-hidden>
              <DashboardPreview totals={totals} />
            </div>
          </motion.div>
          <span aria-hidden className="shot-floor pointer-events-none absolute inset-x-0 -bottom-px h-40" />
        </div>

      </div>
    </section>
  );
}
