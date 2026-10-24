"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMotionPrefs } from "@/lib/motion";

interface Datum {
  label: string;
  value: number;
  highlight?: boolean;
}

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] border border-line bg-surface-flat px-3 py-2 text-small shadow-[0_8px_24px_-12px_rgba(90,75,55,.35)]">
      <p className="text-ink-2">{label}</p>
      <p className="font-semibold tnum text-ink">
        {payload[0].value.toLocaleString("en-CA")} {unit}
      </p>
    </div>
  );
}

/** Loop-green bars, hairline grid, rounded ends, flat tooltip (UI §13). */
export function BarsChart({ data, unit = "devices", height = 240, label }: { data: Datum[]; unit?: string; height?: number; label: string }) {
  const { reduced } = useMotionPrefs();
  return (
    <figure aria-label={label} className="w-full">
      <div style={{ height }} aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--ink-2)", fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={52} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 12 }} />
            <Tooltip cursor={{ fill: "rgba(19,138,97,.06)" }} content={<ChartTooltip unit={unit} />} />
            <Bar dataKey="value" radius={[8, 8, 3, 3]} isAnimationActive={!reduced} maxBarSize={44}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.highlight === false ? "#9BD8BE" : "var(--loop)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {data.map((d) => `${d.label}: ${d.value} ${unit}`).join("; ")}
      </figcaption>
    </figure>
  );
}
