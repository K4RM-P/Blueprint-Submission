"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { LoopMark } from "@/components/shell/logo";
import { LiquidBlob } from "@/components/liquid";
import { useMotionPrefs } from "@/lib/motion";
import type { PassportStory } from "@/lib/passport-story";
import { cn } from "@/lib/utils";
import { LiquidTransition } from "./liquid-transition";
import { Eyebrow, Hero } from "./slide-primitives";
import { ShareActions, storyImagePath } from "./share-actions";
import { SlideContent } from "./slides";
import { logStoryEvent } from "./story-analytics";
import { StoryMotionContext } from "./story-context";
import { WrappedCard } from "./wrapped-card";
import "./story.css";

const HOLD_MS = 220;
const SWIPE_PX = 48;

/**
 * Relay Wrapped player (DP-02): a full-screen 9:16 story. Segmented liquid
 * progress, tap right/left, hold to pause, swipe, arrow keys and Space, auto
 * advance (paused when the tab is hidden), deep links via ?s=N, and anonymous
 * start/complete/drop-off analytics. Reduced motion: no auto-advance, crossfades.
 */
export function StoryPlayer({ story, initialIndex = 0 }: { story: PassportStory; initialIndex?: number }) {
  const { reduced, lowPower } = useMotionPrefs();
  const slides = story.slides;
  const last = slides.length - 1;
  const [index, setIndex] = useState(initialIndex);
  const [dir, setDir] = useState<1 | -1 | 0>(0);
  const [userPaused, setUserPaused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [replays, setReplays] = useState(0);
  const slide = slides[index];
  const paused = userPaused || holding || hidden;
  const autoAdvance = !reduced && slide.durationMs !== null;

  // ---- analytics: start (left the cover), complete (reached the card), drop (left mid-story)
  const seen = useRef({ started: initialIndex > 0, completed: false, slide: slide.key });
  useEffect(() => {
    seen.current.slide = slide.key;
    if (index > 0 && !seen.current.started) {
      seen.current.started = true;
      logStoryEvent("start", slides[0].key);
    }
    if (index === last && !seen.current.completed) {
      seen.current.completed = true;
      logStoryEvent("complete", slide.key);
    }
  }, [index, last, slide.key, slides]);
  useEffect(() => {
    const onHide = () => {
      if (seen.current.started && !seen.current.completed) {
        seen.current.completed = true; // count one drop per visit
        logStoryEvent("drop", seen.current.slide);
      }
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  // ---- navigation
  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(last, next));
      if (clamped === index) return;
      setDir(clamped > index ? 1 : -1);
      setIndex(clamped);
    },
    [index, last],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);
  const replay = useCallback(() => {
    setDir(-1);
    setIndex(0);
    setReplays((r) => r + 1);
    setUserPaused(false);
  }, []);

  // ---- deep link: keep ?s=N in the URL without adding history entries
  useEffect(() => {
    const url = new URL(window.location.href);
    if (index === 0) url.searchParams.delete("s");
    else url.searchParams.set("s", String(index + 1));
    window.history.replaceState(window.history.state, "", url);
  }, [index]);

  // ---- tab hidden pauses the story
  useEffect(() => {
    const on = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  // ---- lock the page behind the story
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = before;
    };
  }, []);

  // ---- keyboard
  const closeHref = `/p/${story.code}?view=full`;
  const closeRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const onControl = Boolean(t?.closest("button, a, input, textarea, select"));
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === " " && !onControl) {
        e.preventDefault();
        if (index === 0) next();
        else setUserPaused((p) => !p);
      } else if (e.key === "Escape") {
        closeRef.current?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, index]);

  // ---- preload the share image as the finale approaches
  useEffect(() => {
    if (index < last - 1) return;
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = storyImagePath(story.code);
    document.head.appendChild(link);
    return () => link.remove();
  }, [index, last, story.code]);

  // ---- gestures: tap zones, hold to pause, swipe
  const gesture = useRef<{ x: number; y: number; t: number; timer: number | null; held: boolean; id: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("a, button, input, [data-no-tap]")) return;
    const timer = window.setTimeout(() => {
      if (gesture.current) gesture.current.held = true;
      setHolding(true);
    }, HOLD_MS);
    gesture.current = { x: e.clientX, y: e.clientY, t: Date.now(), timer, held: false, id: e.pointerId };
  };
  const endGesture = (e: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    if (g.timer) window.clearTimeout(g.timer);
    setHolding(false);
    if (cancelled) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else prev();
      return;
    }
    if (dy > SWIPE_PX * 2 && Math.abs(dy) > Math.abs(dx) && e.pointerType === "touch") {
      closeRef.current?.click();
      return;
    }
    if (g.held || Math.abs(dx) > 10 || Math.abs(dy) > 10) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.3) prev();
    else next();
  };

  const finale = (
    <div className="flex h-full flex-col">
      <Eyebrow>{story.stage === "sold" ? "Your laptop's story" : "This laptop's story"}</Eyebrow>
      <Hero className="py-[2cqh]">
        <WrappedCard story={story} className="w-full max-w-[360px]" />
      </Hero>
      <ShareActions story={story} onReplay={replay} />
    </div>
  );

  return (
    <StoryMotionContext.Provider value={{ reduced, lowPower }}>
      <div className="story-root no-print" role="region" aria-roledescription="story" aria-label={`${story.deviceName}: its story`}>
        {/* desktop ambient backdrop: the current tint, two slow liquid blobs */}
        <div aria-hidden className="story-ambient hidden sm:block" style={{ backgroundColor: ambient[slide.tint] }}>
          <LiquidBlob className="-left-40 -top-40 size-[640px]" tone="mint" duration={26} />
          <LiquidBlob className="-bottom-48 -right-40 size-[600px]" tone="apricot" duration={30} />
        </div>

        <DesktopNav side="left" onClick={prev} disabled={index === 0} label="Previous slide" />

        <div className="story-stage" onPointerDown={onPointerDown} onPointerUp={(e) => endGesture(e)} onPointerCancel={(e) => endGesture(e, true)} onContextMenu={(e) => e.preventDefault()}>
          <AnimatePresence initial={false}>
            <LiquidTransition key={`${index}-${replays}`} dir={dir} tint={slide.tint} reduced={reduced}>
              <section className="story-slide" data-tint={slide.tint} data-slide={slide.key} aria-label={`Slide ${index + 1} of ${slides.length}: ${slide.title}`}>
                <SlideContent k={slide.key} story={story} finale={finale} onBegin={next} />
              </section>
            </LiquidTransition>
          </AnimatePresence>

          {/* chrome */}
          <div className="story-progress" role="progressbar" aria-label="Story progress" aria-valuemin={1} aria-valuemax={slides.length} aria-valuenow={index + 1} aria-valuetext={`Slide ${index + 1} of ${slides.length}`}>
            {slides.map((s, i) => (
              <span
                key={`${s.key}-${i === index ? replays : 0}`}
                className="story-seg"
                data-state={i < index ? "done" : i === index ? "active" : "todo"}
                data-paused={paused ? "true" : "false"}
                data-static={i === index && !autoAdvance ? "true" : undefined}
                style={{ ["--seg-ms" as string]: `${s.durationMs ?? 0}ms` }}
              >
                <span
                  className="story-seg-fill"
                  style={i === index && slide.durationMs === null ? { transform: "scaleX(0)", animation: "none" } : undefined}
                  onAnimationEnd={i === index && autoAdvance ? next : undefined}
                />
              </span>
            ))}
          </div>
          <div className="absolute inset-x-[14px] top-[calc(24px+env(safe-area-inset-top))] z-30 flex items-center justify-between">
            <span className="flex items-center gap-2 pl-0.5">
              <LoopMark className="size-7" />
              <span className="font-mono text-[0.625rem] tracking-[0.2em] text-ink-2">RELAY · DEVICE PASSPORT</span>
            </span>
            <span className="flex items-center gap-2" data-no-tap>
              {autoAdvance ? (
                <button type="button" className="story-chip-btn" onClick={() => setUserPaused((p) => !p)} aria-label={userPaused ? "Play story" : "Pause story"} aria-pressed={userPaused}>
                  {userPaused ? <Play /> : <Pause />}
                </button>
              ) : null}
              <Link ref={closeRef} href={closeHref} className="story-chip-btn" aria-label="Close story and view the full passport">
                <X />
              </Link>
            </span>
          </div>
          {holding ? (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pointer-events-none absolute bottom-[calc(18px+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 font-mono text-[0.6875rem] tracking-[0.12em] text-white">
              PAUSED
            </motion.span>
          ) : null}
        </div>

        <DesktopNav side="right" onClick={next} disabled={index === last} label="Next slide" />

        <p className="sr-only" aria-live="polite">
          {`Slide ${index + 1} of ${slides.length}: ${slide.title}.${paused ? " Paused." : ""}`}
        </p>
        <p aria-hidden className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-2 lg:block">
          ← → TO MOVE · SPACE TO PAUSE · ESC FOR FULL PASSPORT
        </p>
      </div>
    </StoryMotionContext.Provider>
  );
}

const ambient: Record<string, string> = { porcelain: "#ECE6DC", apricot: "#F6E1D1", sky: "#DFE6F1", butter: "#F3EBCD", mint: "#DCEBE2" };

function DesktopNav({ side, onClick, disabled, label }: { side: "left" | "right"; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-tint="porcelain"
      className={cn(
        "clay-sm clay-press relative z-10 mx-6 hidden size-14 shrink-0 place-items-center rounded-full text-ink transition-opacity disabled:opacity-0 sm:grid [&_svg]:size-6 [&_svg]:stroke-[1.75]",
        side === "left" ? "order-first" : "order-last",
      )}
    >
      {side === "left" ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );
}
