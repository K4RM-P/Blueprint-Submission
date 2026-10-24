"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

/** Accordion with clay header pebbles that press (§9.3). */
export function Faq({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  const { t, reduced } = useMotionPrefs();
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                data-tint="porcelain"
                className={cn("clay-sm clay-press flex min-h-14 w-full items-center justify-between gap-4 rounded-[22px] px-5 py-3 text-left font-semibold", isOpen && "clay-sunk")}
              >
                {item.q}
                <Plus className={cn("size-5 shrink-0 text-loop-deep transition-transform", isOpen && "rotate-45")} aria-hidden />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={`${id}-${i}`}
                  initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={t("soft")}
                  className="overflow-hidden"
                >
                  <div className="measure px-5 pb-2 pt-4 text-ink-2">{item.a}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
