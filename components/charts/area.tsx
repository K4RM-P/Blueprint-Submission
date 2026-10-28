"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMotionPrefs } from "@/lib/motion";

/** Devices over time: green area with a soft liquid gradient (UI §9.4). */
export function DevicesAreaChart({ data, label }: { data: { month: string; received: number; reused: number }[]; label: string }) {
  const { reduced } = useMotionPrefs();
  const fmt = (m: string) => new Date(`${m}-15`).toLocaleDateString("en-CA", { month: "short" });
  return (
    <figure aria-label={label}>
      <div className="h-60" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }} accessibilityLayer={false}>
            <defs>
              <linearGradient id="reusedFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#2FBF8A" stopOpacity={0.55} />
                <stop offset="1" stopColor="#2FBF8A" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 4" />
            <XAxis dataKey="month" tickFormatter={fmt} tickLine={false} axisLine={false} tick={{ fill: "var(--ink-2)", fontSize: 12 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 12 }} />
            <Tooltip cursor={{ stroke: "var(--loop)", strokeOpacity: 0.25, strokeWidth: 24 }} content={<AreaTooltip fmt={fmt} />} />
            <Area type="monotoneX" dataKey="received" name="Received" stroke="#7FCBA9" strokeWidth={2} strokeDasharray="4 4" fill="transparent" dot={false} activeDot={{ r: 4, fill: "#fff", stroke: "#7FCBA9", strokeWidth: 2 }} isAnimationActive={!reduced} />
            <Area type="monotoneX" dataKey="reused" name="Back in use" stroke="var(--loop)" strokeWidth={3} fill="url(#reusedFill)" dot={false} activeDot={{ r: 5, fill: "#fff", stroke: "var(--loop)", strokeWidth: 2.5 }} isAnimationActive={!reduced} animationDuration={1100} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 flex gap-4 text-small text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-[3px] w-4 rounded bg-loop" aria-hidden /> Back in use
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-[#7FCBA9]" aria-hidden /> Received
        </span>
        <span className="sr-only">{data.map((d) => `${d.month}: ${d.received} received, ${d.reused} back in use`).join("; ")}</span>
      </figcaption>
    </figure>
  );
}

function AreaTooltip({ active, payload, label, fmt }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string; fmt: (m: string) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] border border-line bg-surface-flat px-3 py-2 text-small shadow-[0_8px_24px_-12px_rgba(90,75,55,.35)]">
      <p className="text-ink-2">{fmt(String(label))}</p>
      {payload.map((p) => (
        <p key={p.name} className="tnum text-ink">
          <span className="font-semibold">{p.value}</span> {p.name.toLowerCase()}
        </p>
      ))}
    </div>
  );
}
