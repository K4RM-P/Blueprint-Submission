"use client";

import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ClayBaton } from "@/components/illustrations/clay-baton";

/** Event the app shell's nav items listen for to bulge and show a short "+1". */
export const NAV_BUMP_EVENT = "relay:nav-bump";
export interface NavBumpDetail {
  href: string;
  label: string;
}

export function bumpNav(detail: NavBumpDetail) {
  window.dispatchEvent(new CustomEvent<NavBumpDetail>(NAV_BUMP_EVENT, { detail }));
}

interface Point {
  x: number;
  y: number;
}

/** Find the visible nav item for `href` (desktop sidebar or mobile dock). Call from an event or timer. */
export function navTarget(href: string): Point | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-nav-href="${href}"]`));
  const el = els.find((e) => e.getBoundingClientRect().width > 0);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + Math.min(r.width / 2, 28), y: r.top + r.height / 2 };
}

/**
 * Baton pass (Signature Moment 7): a clay baton leaves `from`, arcs across the
 * screen and lands on `to` (a nav item, see `navTarget`), which then bulges.
 * Fixed-position, transform/opacity only, 1s.
 */
export function BatonFlight({ from, to, href, label = "+1", onDone }: { from: Point; to: Point; href: string; label?: string; onDone?: () => void }) {
  const mid = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - 140 };
  const W = 72;
  const H = 30;

  return createPortal(
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80]"
      style={{ width: W, height: H }}
      initial={{ x: from.x - W / 2, y: from.y - H / 2, scale: 1, rotate: 0, opacity: 1 }}
      animate={{
        x: [from.x - W / 2, mid.x - W / 2, to.x - W / 2],
        y: [from.y - H / 2, mid.y - H / 2, to.y - H / 2],
        scale: [1, 0.85, 0.3],
        rotate: [0, 14, 0],
        opacity: [1, 1, 0.85],
      }}
      transition={{ duration: 0.95, times: [0, 0.5, 1], ease: [0.3, 0, 0.2, 1] }}
      onAnimationComplete={() => {
        bumpNav({ href, label });
        onDone?.();
      }}
    >
      <ClayBaton className="size-full" />
    </motion.div>,
    document.body,
  );
}

/**
 * For nav items: bulge like a drop landing in liquid when a baton arrives for
 * `href`, and show the short label (e.g. "+1") for a moment.
 */
export function useNavBump(href: string) {
  const controls = useAnimationControls();
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    let timer: number | undefined;
    const on = (e: Event) => {
      const d = (e as CustomEvent<NavBumpDetail>).detail;
      if (d.href !== href) return;
      void controls.start({ scale: [1, 1.14, 0.96, 1], transition: { duration: 0.55, times: [0, 0.35, 0.7, 1], ease: "easeOut" } });
      setLabel(d.label);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setLabel(null), 2200);
    };
    window.addEventListener(NAV_BUMP_EVENT, on);
    return () => {
      window.removeEventListener(NAV_BUMP_EVENT, on);
      window.clearTimeout(timer);
    };
  }, [href, controls]);
  return { controls, label };
}

/** The little "+1" pill that rides on a bumped nav item. */
export function NavBumpChip({ label }: { label: string | null }) {
  return (
    <AnimatePresence>
      {label ? (
        <motion.span
          key="bump"
          role="status"
          className="pointer-events-none absolute -top-1.5 right-2 z-10 rounded-full bg-loop px-2 py-0.5 text-[0.6875rem] font-semibold text-white shadow-[0_4px_10px_-4px_rgba(11,94,66,.6)]"
          initial={{ scale: 0.4, opacity: 0, y: 6 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
        >
          {label}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}
