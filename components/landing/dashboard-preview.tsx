import { Award, BarChart3, FileCheck2, LayoutGrid, Lock, Package, Plus, Settings, ShieldCheck, Sparkles } from "lucide-react";
import { LoopMark } from "@/components/shell/logo";
import { cn } from "@/lib/utils";
import { CountUp } from "./count-up";

export interface PreviewTotals {
  received: number;
  verified: number;
  reused: number;
  kgDiverted: number;
}

const NAV = [
  { icon: LayoutGrid, label: "Overview", active: true },
  { icon: Package, label: "Batches", badge: "3" },
  { icon: FileCheck2, label: "Certificates" },
  { icon: BarChart3, label: "Impact report" },
  { icon: Award, label: "Membership" },
  { icon: Settings, label: "Settings" },
];

// Illustrative monthly series for the chart (received vs. back in use).
const RECEIVED = [8, 14, 12, 22, 19, 31, 28, 36];
const REUSED = [2, 5, 9, 11, 16, 18, 24, 29];
const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const BATCHES = [
  { id: "FGT-B-0142", what: "24 × ThinkPad T14", stage: "Wiping", tone: "butter", pct: 34 },
  { id: "FGT-B-0139", what: "18 × MacBook Air", stage: "On the bench", tone: "sky", pct: 68 },
  { id: "FGT-B-0131", what: "30 × Dell Latitude", stage: "Certified", tone: "mint", pct: 100 },
] as const;

const HELPS = [
  { label: "Students", n: 46 },
  { label: "Newcomers", n: 31 },
  { label: "Families", n: 22 },
  { label: "Seniors", n: 12 },
];

const chip: Record<(typeof BATCHES)[number]["tone"], string> = {
  butter: "bg-butter text-[#6b4e00]",
  sky: "bg-sky text-[#1d4f9a]",
  mint: "bg-mint text-loop-deep",
};

function path(series: number[], w: number, h: number, max: number) {
  const step = w / (series.length - 1);
  return series
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      if (i === 0) return `M${x},${y}`;
      const px = (i - 1) * step;
      const py = h - (series[i - 1] / max) * h;
      return `C${px + step / 2},${py} ${x - step / 2},${y} ${x},${y}`;
    })
    .join(" ");
}

function Spark({ series, className }: { series: number[]; className?: string }) {
  const max = Math.max(...series);
  return (
    <svg viewBox="0 0 80 24" className={cn("h-6 w-20", className)} preserveAspectRatio="none" aria-hidden>
      <path d={path(series, 80, 22, max)} transform="translate(0 1)" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * A believable, illustrative Partner Portal: window chrome, sidebar, KPI tiles,
 * a chart, recipient bars and recent batches. Presented on the landing page the
 * way Apple/Vercel show their product. Static and decorative; the KPI numbers
 * are the live public totals, everything else is example data.
 */
export function DashboardPreview({ totals }: { totals: PreviewTotals }) {
  const W = 560;
  const H = 190;
  const max = Math.max(...RECEIVED) * 1.1;
  const reusedLine = path(REUSED, W, H, max);
  const kpis = [
    { label: "Devices received", value: totals.received, delta: "+24 this month", series: RECEIVED },
    { label: "Wiped & verified", value: totals.verified, delta: "100% certified", series: [3, 7, 10, 15, 18, 24, 27, 33] },
    { label: "Back in use", value: totals.reused, delta: "+11 this month", series: REUSED, accent: true },
    { label: "Kept out of landfill", value: totals.kgDiverted, suffix: "kg", delta: "est. 2.3 kg / device", series: [4, 9, 12, 20, 24, 33, 38, 46] },
  ];
  const helpsMax = Math.max(...HELPS.map((h) => h.n));

  return (
    <div className="app-window relative overflow-hidden rounded-[18px] text-left md:rounded-[22px]">
      {/* chrome */}
      <div className="app-chrome flex h-11 items-center gap-3 px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-[11px] rounded-full bg-[#ff5f57]" />
          <span className="size-[11px] rounded-full bg-[#febc2e]" />
          <span className="size-[11px] rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-7 w-full max-w-[340px] items-center justify-center gap-1.5 rounded-lg bg-[#ece7de]/80 px-3 text-[0.75rem] text-ink-3">
          <Lock className="size-3" strokeWidth={2.2} aria-hidden />
          <span className="truncate">Relay · Partner Portal</span>
        </div>
        <span className="w-[45px]" />
      </div>

      <div className="flex">
        {/* sidebar */}
        <aside className="app-side hidden w-[212px] shrink-0 flex-col gap-1 p-3 lg:flex">
          <div className="flex items-center gap-2 px-2 pb-4 pt-2">
            <LoopMark className="size-6" />
            <span className="font-display text-[1.0625rem] font-semibold tracking-[-0.03em]">Relay</span>
          </div>
          <div className="mb-3 rounded-xl border border-line/80 bg-white/70 px-3 py-2.5">
            <p className="text-[0.8125rem] font-semibold leading-tight">Northwind Legal</p>
            <p className="mt-0.5 flex items-center gap-1 text-[0.6875rem] text-loop-deep">
              <Sparkles className="size-3" aria-hidden /> Impact Partner
            </p>
          </div>
          {NAV.map(({ icon: Icon, label, active, badge }) => (
            <div key={label} className={cn("flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem]", active ? "bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(60,50,35,0.08),inset_0_0_0_1px_rgba(90,75,55,0.08)]" : "text-ink-2")}>
              <Icon className="size-4" strokeWidth={1.8} aria-hidden />
              {label}
              {badge ? <span className="ml-auto rounded-md bg-[#ece6dc] px-1.5 text-[0.6875rem] font-semibold text-ink-2">{badge}</span> : null}
            </div>
          ))}
          <div className="mt-auto flex items-center gap-2.5 rounded-lg px-2 pt-6">
            <span className="grid size-7 place-items-center rounded-full bg-apricot text-[0.6875rem] font-bold text-ember-ink">MC</span>
            <span className="leading-tight">
              <span className="block text-[0.8125rem] font-semibold">Maya Chen</span>
              <span className="block text-[0.6875rem] text-ink-3">IT Operations</span>
            </span>
          </div>
        </aside>

        {/* main */}
        <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-3">Overview · Oct 2026</p>
              <p className="font-display mt-1 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] sm:text-[1.875rem]">Hi Maya.</p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-full border border-line bg-white px-3.5 py-2 text-[0.75rem] font-semibold text-ink-2">Share impact story</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-[0.75rem] font-semibold text-white">
                <Plus className="size-3.5" aria-hidden /> New batch
              </span>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className={cn("app-card p-3.5 sm:p-4", k.accent && "app-card-accent")}>
                <p className="text-[0.6875rem] font-medium text-ink-3 sm:text-[0.75rem]">{k.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="font-display text-[1.5rem] font-semibold leading-none tracking-[-0.04em] sm:text-[1.875rem]">
                    <CountUp value={k.value} />
                    {k.suffix ? <span className="ml-0.5 font-sans text-[0.45em] font-medium tracking-normal text-ink-3">{k.suffix}</span> : null}
                  </p>
                  <Spark series={k.series} className={cn("hidden sm:block", k.accent ? "text-loop" : "text-[#9fb5aa]")} />
                </div>
                <p className={cn("mt-2 text-[0.6875rem]", k.accent ? "font-semibold text-loop-deep" : "text-ink-3")}>{k.delta}</p>
              </div>
            ))}
          </div>

          {/* chart + who it helps */}
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
            <div className="app-card p-4 sm:p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[0.8125rem] font-semibold">Devices over time</p>
                <p className="flex items-center gap-3 text-[0.6875rem] text-ink-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-3 rounded bg-loop" /> Back in use
                  </span>
                  <span className="hidden items-center gap-1.5 sm:flex">
                    <span className="h-0 w-3 border-t border-dashed border-[#7fcba9]" /> Received
                  </span>
                </p>
              </div>
              <svg viewBox={`0 -6 ${W} ${H + 26}`} className="mt-4 h-auto w-full" aria-hidden>
                <defs>
                  <linearGradient id="dp-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#2FBF8A" stopOpacity="0.32" />
                    <stop offset="1" stopColor="#2FBF8A" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((i) => (
                  <line key={i} x1="0" x2={W} y1={(H / 3) * i} y2={(H / 3) * i} stroke="var(--line)" strokeDasharray="2 5" />
                ))}
                <path d={`${reusedLine} L${W},${H} L0,${H} Z`} fill="url(#dp-fill)" />
                <path d={path(RECEIVED, W, H, max)} fill="none" stroke="#7FCBA9" strokeWidth="2" strokeDasharray="4 5" />
                <path d={reusedLine} fill="none" stroke="var(--loop)" strokeWidth="2.75" strokeLinecap="round" />
                <circle cx={W} cy={H - (REUSED[REUSED.length - 1] / max) * H} r="5" fill="#fff" stroke="var(--loop)" strokeWidth="2.5" />
                {MONTHS.map((m, i) => (
                  <text key={m} x={(W / (MONTHS.length - 1)) * i} y={H + 18} textAnchor={i === 0 ? "start" : i === MONTHS.length - 1 ? "end" : "middle"} fontSize="11" fill="var(--ink-3)">
                    {m}
                  </text>
                ))}
              </svg>
            </div>
            <div className="app-card hidden flex-col p-4 sm:p-5 md:flex">
              <p className="text-[0.8125rem] font-semibold">Who your laptops help</p>
              <ul className="mt-4 flex flex-1 flex-col justify-between gap-3">
                {HELPS.map((h, i) => (
                  <li key={h.label}>
                    <div className="flex justify-between text-[0.75rem]">
                      <span className="text-ink-2">{h.label}</span>
                      <span className="font-semibold tnum">{h.n}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#efe9df]">
                      <div className={cn("h-full rounded-full", i === 0 ? "bg-gradient-to-r from-loop to-loop-light" : "bg-[#9fd6bd]")} style={{ width: `${(h.n / helpsMax) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.6875rem] text-ink-3">Categories only. Never names.</p>
            </div>
          </div>

          {/* recent batches */}
          <div className="app-card mt-3 hidden overflow-hidden sm:block">
            <div className="flex items-center justify-between px-5 py-3.5">
              <p className="text-[0.8125rem] font-semibold">Recent batches</p>
              <p className="text-[0.75rem] font-semibold text-loop-deep">View all</p>
            </div>
            {BATCHES.map((b) => (
              <div key={b.id} className="grid grid-cols-[7.5rem_minmax(0,1fr)_7.5rem_minmax(0,9rem)_1.25rem] items-center gap-4 border-t border-line/70 px-5 py-3 text-[0.75rem]">
                <span className="font-mono text-ink-2">{b.id}</span>
                <span className="truncate font-medium">{b.what}</span>
                <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold", chip[b.tone])}>{b.stage}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-[#efe9df]">
                  <span className="block h-full rounded-full bg-loop" style={{ width: `${b.pct}%` }} />
                </span>
                {b.pct === 100 ? <ShieldCheck className="size-4 text-loop" aria-hidden /> : <span />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
