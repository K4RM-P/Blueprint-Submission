"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";
import { LoopMark } from "@/components/shell/logo";
import { cardFacts, legLabel, type PassportStory } from "@/lib/passport-story";
import { cn } from "@/lib/utils";
import { useStoryMotion } from "./story-context";

/**
 * Relay Wrapped finale: a collectible passport card. Deep green cover band
 * (the booklet's), a perforated tear line, then porcelain facts. On desktop it
 * tilts toward the pointer with a soft sheen; reduced motion keeps it flat.
 */
export function WrappedCard({ story, className }: { story: PassportStory; className?: string }) {
  const { reduced, lowPower } = useStoryMotion();
  const live = !reduced && !lowPower;
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 170, damping: 24 });
  const sy = useSpring(py, { stiffness: 170, damping: 24 });
  const rotateY = useTransform(sx, [0, 1], [-7, 7]);
  const rotateX = useTransform(sy, [0, 1], [6, -6]);
  const sheen = useTransform(sx, [0, 1], ["0%", "100%"]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!live || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };
  const facts = cardFacts(story);
  const legs = story.stage === "recycled" ? 2 : story.leg;

  return (
    <div className={cn("[perspective:1200px]", className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.article
        aria-label={`${story.deviceName}, passport ${story.code}`}
        className="relative overflow-hidden rounded-[28px] bg-[#FBF9F5] shadow-[0_40px_70px_-34px_rgba(11,94,66,.55),0_14px_28px_-16px_rgba(60,50,35,.35),inset_0_1px_0_rgba(255,255,255,.9)]"
        style={live ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
        initial={reduced ? false : { y: 60, rotate: -4, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
        transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 170, damping: 20, delay: 0.15 }}
      >
        {/* cover band */}
        <div className="relative overflow-hidden px-[6cqw] pb-[3.2cqh] pt-[2.6cqh] text-white" style={{ background: "radial-gradient(120% 90% at 18% 0%, rgba(255,255,255,.16), transparent 55%), linear-gradient(160deg, #157a56, #0b5e42 58%, #08452f)" }}>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <LoopMark className="size-6" />
              <span className="font-mono text-[0.625rem] tracking-[0.22em] text-[#CDEFDF]">DEVICE PASSPORT</span>
            </span>
            <span className="whitespace-nowrap font-mono text-[0.75rem] tracking-[0.12em] text-[#CDEFDF]">{story.code}</span>
          </div>
          <p className="story-huge mt-[2.4cqh] text-[clamp(1.75rem,8.4cqw,2.6rem)] !leading-[0.95] !tracking-[-0.045em] text-white">{story.deviceName}</p>
          <p className="mt-2 text-[0.8125rem] text-[#B9E6D2]">{story.specs.slice(0, 3).join(" · ")}</p>
        </div>

        {/* tear line */}
        <div aria-hidden className="relative h-0">
          <span className="absolute -left-3 -top-3 size-6 rounded-full bg-[var(--slide-bg,#F4F0E9)]" />
          <span className="absolute -right-3 -top-3 size-6 rounded-full bg-[var(--slide-bg,#F4F0E9)]" />
          <span className="absolute inset-x-5 top-0 border-t-2 border-dashed border-[#E4DED4]" />
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-[1.7cqh] px-[6cqw] pb-[2cqh] pt-[2.6cqh]">
          {facts.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-2">{f.label}</dt>
              <dd className="mt-0.5 line-clamp-2 text-[0.9375rem] font-semibold leading-snug text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex items-center justify-between gap-3 border-t border-[#EEE8DE] px-[6cqw] py-[1.8cqh]">
          <div className="flex items-center gap-2">
            <span className="flex gap-1" aria-hidden>
              {[1, 2, 3].map((n) => (
                <span key={n} className={cn("h-2 w-5 rounded-full", n <= legs ? "bg-gradient-to-r from-loop to-loop-light" : "bg-[#E9E2D6]")} />
              ))}
            </span>
            <span className="whitespace-nowrap font-mono text-[0.6875rem] tracking-[0.1em] text-ink-2">{legLabel(story).toUpperCase()}</span>
          </div>
          <span className="whitespace-nowrap font-display text-[1.0625rem] text-loop-deep">Pass it on.</span>
        </div>

        {live ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,.55) 48%, transparent 62%)", backgroundSize: "220% 100%", backgroundPositionX: sheen }}
          />
        ) : null}
      </motion.article>
    </div>
  );
}
