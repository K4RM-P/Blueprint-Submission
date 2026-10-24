"use client";

import { useSyncExternalStore } from "react";
import type { Transition } from "motion/react";

/** Spring presets — the only easings allowed (UI_UX_DESIGN.md §7.1). */
export const springs = {
  soft: { type: "spring", stiffness: 170, damping: 24 },
  press: { type: "spring", stiffness: 520, damping: 30 },
  bouncy: { type: "spring", stiffness: 320, damping: 16 },
  liquid: { type: "spring", stiffness: 90, damping: 20, mass: 1.2 },
  fade: { duration: 0.2, ease: [0.2, 0, 0, 1] },
} as const satisfies Record<string, Transition>;

/** Reduced-motion replacement: a 150ms fade (§7.5). */
export const reducedTransition: Transition = { duration: 0.15, ease: "linear" };

export type Expression = 1 | 2 | 3;

export interface MotionPrefs {
  /** User asked for reduced motion (OS setting or the styleguide override). */
  reduced: boolean;
  /** Weak device or narrow screen: skip blur blobs (§7.5). */
  lowPower: boolean;
  /** Shell expression level from data-expression (§2). */
  expression: Expression;
  /** Pick a spring, or the reduced fade when motion is off. */
  t: (name: keyof typeof springs) => Transition;
}

function readExpression(): Expression {
  const el = document.querySelector("[data-expression]");
  const v = Number(el?.getAttribute("data-expression"));
  return v === 1 || v === 3 ? v : 2;
}

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  window.addEventListener("resize", callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduced-motion"] });
  return () => {
    mq.removeEventListener("change", callback);
    window.removeEventListener("resize", callback);
    observer.disconnect();
  };
}

const getReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reducedMotion === "true";
const getLowPower = () => (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 768;

/**
 * One hook for every animated component: reduced motion, low-power
 * detection and the shell's expression level (§13). Server snapshots are
 * the calm defaults so hydration always matches.
 */
export function useMotionPrefs(): MotionPrefs {
  const reduced = useSyncExternalStore(subscribe, getReduced, () => false);
  const lowPower = useSyncExternalStore(subscribe, getLowPower, () => true);
  const expression = useSyncExternalStore(subscribe, readExpression, () => 2 as Expression);
  return {
    reduced,
    lowPower,
    expression,
    t: (name) => (reduced ? reducedTransition : springs[name]),
  };
}
