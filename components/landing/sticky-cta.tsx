"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ClayButton } from "@/components/clay";
import { useMotionPrefs } from "@/lib/motion";

/**
 * Floating CTA pill: appears once the hero (and its own primary button) has
 * scrolled away, hides again over the footer, so there's never more than one
 * primary in view.
 */
export function StickyCta({ heroId, endSelector = "footer" }: { heroId: string; endSelector?: string }) {
  const [heroGone, setHeroGone] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const { t } = useMotionPrefs();

  useEffect(() => {
    const hero = document.getElementById(heroId);
    const end = document.querySelector(endSelector);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) setHeroGone(!e.isIntersecting && e.boundingClientRect.top < 0);
        if (e.target === end) setAtEnd(e.isIntersecting || e.boundingClientRect.top < 0);
      }
    });
    if (hero) io.observe(hero);
    if (end) io.observe(end);
    return () => io.disconnect();
  }, [heroId, endSelector]);

  const show = heroGone && !atEnd;
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={t("soft")}
          className="glass-ink fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-4 rounded-full py-1.5 pl-5 pr-1.5 sm:inset-x-auto sm:bottom-6 sm:right-6"
        >
          <p className="text-small leading-tight">
            <span className="font-semibold">Free to start.</span> <span className="hidden text-white/70 sm:inline">A wipe certificate with every batch.</span>
          </p>
          <ClayButton href="/login?mode=signup" variant="primary" size="sm">
            Become a partner
          </ClayButton>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
