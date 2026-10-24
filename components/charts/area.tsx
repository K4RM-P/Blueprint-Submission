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
          <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="reusedFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#2FBF8A" stopOpacity={0.55} />
                <stop offset="1" stopColor="#2FBF8A" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="month" tickFormatter={fmt} tickLine={false} axisLine={false} tick={{ fill: "var(--ink-2)", fontSize: 12 }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 12 }} />
            <Tooltip
              labelFormatter={(m) => fmt(String(m))}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", boxShadow: "0 8px 24px -12px rgba(90,75,55,.35)", fontSize: 13 }}
            />
            <Area type="monotone" dataKey="received" name="Received" stroke="#9BD8BE" strokeWidth={2} fill="transparent" isAnimationActive={!reduced} />
            <Area type="monotone" dataKey="reused" name="Reused" stroke="var(--loop)" strokeWidth={2.5} fill="url(#reusedFill)" isAnimationActive={!reduced} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 flex gap-4 text-small text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-loop" aria-hidden /> Reused
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-[#9BD8BE]" aria-hidden /> Received
        </span>
        <span className="sr-only">{data.map((d) => `${d.month}: ${d.received} received, ${d.reused} reused`).join("; ")}</span>
      </figcaption>
    </figure>
  );
}
