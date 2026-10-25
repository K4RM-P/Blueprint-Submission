"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMotionPrefs } from "@/lib/motion";

interface Datum {
  label: string;
  value: number;
  highlight?: boolean;
}

export function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: string }) {
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

/** Category tick that wraps onto two lines instead of the default 35° slant. */
function WrapTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const words = String(payload?.value ?? "").split(" ");
  const lines = words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : words;
  return (
    <text x={x} y={(y ?? 0) + 14} textAnchor="middle" fill="var(--ink-2)" fontSize={11.5}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 13}>
          {l}
        </tspan>
      ))}
    </text>
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
            <defs>
              {/* liquid two-stop green (§3.3), lighter at the meniscus */}
              <linearGradient id="bar-liquid" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#2FBF8A" />
                <stop offset="1" stopColor="#138A61" />
              </linearGradient>
              <linearGradient id="bar-soft" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#BFE9D4" />
                <stop offset="1" stopColor="#9BD8BE" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 4" />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "var(--line)" }} tick={<WrapTick />} interval={0} height={40} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "var(--ink-3)", fontSize: 11.5 }} width={44} />
            <Tooltip cursor={{ fill: "rgba(19,138,97,.06)" }} content={<ChartTooltip unit={unit} />} />
            <Bar dataKey="value" radius={[10, 10, 4, 4]} isAnimationActive={!reduced} animationDuration={900} animationEasing="ease-out" maxBarSize={44}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.highlight === false ? "url(#bar-soft)" : "url(#bar-liquid)"} />
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
