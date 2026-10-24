"use client";

import { motion } from "motion/react";
import { useMotionPrefs } from "@/lib/motion";
import type { BreakdownSlice } from "@/lib/pricing";

const SHADES = ["#0B5E42", "#138A61", "#2FBF8A", "#7FD4AF", "#BFE9D4", "#E0F4EA", "#9BD8BE", "#5BC398"];

/** "Where your money goes": one clay bar split into liquid segments that flow in left-to-right (§9.2.4). */
export function MoneyBar({ slices }: { slices: BreakdownSlice[] }) {
  const { reduced, t } = useMotionPrefs();
  return (
    <div>
      <div className="well flex h-12 overflow-hidden rounded-full p-1.5" role="img" aria-label={slices.map((s) => `${s.label} ${s.percent}%`).join(", ")}>
        {slices.map((s, i) => (
          <motion.div
            key={s.label}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ background: SHADES[i % SHADES.length], width: `${s.percent}%`, transformOrigin: "left" }}
            initial={reduced ? false : { scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ ...t("liquid"), delay: reduced ? 0 : i * 0.12 }}
          />
        ))}
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {slices.map((s, i) => (
          <li key={s.label} className="flex gap-3">
            <span aria-hidden className="mt-1.5 size-3 shrink-0 rounded-full" style={{ background: SHADES[i % SHADES.length] }} />
            <div>
              <p className="font-semibold">
                <span className="tnum">{s.percent}%</span> · {s.label}
              </p>
              {s.description ? <p className="text-small text-ink-2">{s.description}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
