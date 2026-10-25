"use client";

import { motion } from "motion/react";
import { useMotionPrefs } from "@/lib/motion";
import type { BreakdownSlice } from "@/lib/pricing";

// One green family, dark → light, every step distinct on the well (the lightest still reads as a band).
const SHADES = ["#0B5E42", "#138A61", "#2FBF8A", "#6CCDA4", "#A6E0C6", "#5BC398", "#9BD8BE", "#0F7350"];

/** "Where your money goes": one clay bar split into liquid segments that flow in left-to-right (§9.2.4). */
export function MoneyBar({ slices }: { slices: BreakdownSlice[] }) {
  const { reduced, t } = useMotionPrefs();
  return (
    <div>
      <div className="well h-12 overflow-hidden rounded-full p-1.5" role="img" aria-label={slices.map((s) => `${s.label} ${s.percent}%`).join(", ")}>
        {/* the whole bar pours in left-to-right as one liquid body, then each segment settles */}
        <motion.div
          className="flex h-full origin-left overflow-hidden rounded-full"
          initial={reduced ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={t("liquid")}
        >
          {slices.map((s, i) => (
            <div key={s.label} className="h-full border-r-2 border-[#F7F4EE] last:border-r-0" style={{ background: SHADES[i % SHADES.length], width: `${s.percent}%` }} />
          ))}
        </motion.div>
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
