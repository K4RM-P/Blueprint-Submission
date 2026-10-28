"use client";

import type { SlideKey } from "@/lib/passport-story";
import { useStoryMotion } from "./story-context";

/**
 * Relay Wrapped backdrop: the bold, moving geometry behind each slide (ticker
 * tapes, rings, speed lines, an aura), plus a giant outlined slide number.
 * Pure decoration: aria-hidden, no pointer events, CSS-only animation that
 * stops under reduced motion and on low-power devices.
 */
export function SlideBackdrop({ k, index }: { k: SlideKey; index: number }) {
  const { reduced, lowPower } = useStoryMotion();
  const still = reduced || lowPower;
  const showNumber = k !== "cover" && k !== "finale";
  return (
    <div aria-hidden className="story-backdrop" data-still={still ? "true" : undefined}>
      {shapes(k)}
      {showNumber ? (
<span className="story-ghost-num">{String(index + 1).padStart(2, "0")}</span>
      ) : null}
    </div>
  );
}

function shapes(k: SlideKey) {
  switch (k) {
    case "cover":
      return (
        <>
          <Ticker text="DONATED · WIPED · REFURBISHED · PASSED ON · " className="story-ticker-top" />
          <Ticker text="EVERY DEVICE DESERVES A SECOND LEG · " className="story-ticker-bottom" reverse />
        </>
      );
    case "origin":
    case "your_turn":
    case "next_leg":
      return (
        <>
          <span className="story-ring story-ring-a" />
          <span className="story-ring story-ring-b" />
        </>
      );
    case "handoff":
    case "money":
      return <span className="story-stripes" />;
    case "erased":
      return (
        <>
          <span className="story-scan" />
          <Ticker text="0 0 0 0 0 0 0 0 · WIPED · VERIFIED · " className="story-ticker-bottom" />
        </>
      );
    case "bench":
      return (
        <>
          <span className="story-gear story-gear-a" />
          <span className="story-gear story-gear-b" />
        </>
      );
    case "speed":
      return (
        <span className="story-speed">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} style={{ ["--i" as string]: i }} />
          ))}
        </span>
      );
    case "software":
    case "why":
      return <span className="story-dots" />;
    case "numbers":
    case "recycled":
      return (
        <>
          <span className="story-aura" />
          <span className="story-ring story-ring-b" />
        </>
      );
    case "persona":
      return (
        <>
          <span className="story-aura story-aura-lg" />
          <span className="story-sparkles">
            {SPARKLES.map(([x, y], i) => (
              <span key={i} style={{ left: `${x}%`, top: `${y}%`, ["--i" as string]: i }} />
            ))}
          </span>
        </>
      );
    case "finale":
      return <span className="story-aura story-aura-soft" />;
  }
}

const SPARKLES = [
  [10, 30],
  [84, 22],
  [22, 58],
  [70, 46],
  [50, 18],
  [88, 70],
  [14, 82],
] as const;

function Ticker({ text, className, reverse = false }: { text: string; className: string; reverse?: boolean }) {
  return (
    <span className={`story-ticker ${className}`} data-reverse={reverse ? "true" : undefined}>
      <span className="story-ticker-track">
        {text.repeat(6)}
        {text.repeat(6)}
      </span>
    </span>
  );
}
