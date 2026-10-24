"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, ClayCard, ClayToggle, FlatCard, Select } from "@/components/clay";
import type { AcceptedItem } from "@/lib/checker";
import type { ImpactFactor } from "@/lib/impact";
import type { BreakdownSlice } from "@/lib/pricing";
import { breakdownTotal } from "@/lib/pricing";
import type { ScoreWeights } from "@/lib/batch-score";
import { labels } from "@/lib/domain";
import { saveSettings } from "@/server/actions/staff";
import { cn } from "@/lib/utils";

interface Initial {
  weeklyCapacity: number;
  refurbUniform: number;
  refurbMixed: number;
  maxAgeYears: number;
  weights: ScoreWeights;
  breakdown: BreakdownSlice[];
  breakdownConfirmed: boolean;
  acceptedItems: AcceptedItem[];
  factors: ImpactFactor[];
}

const cell = "h-11 w-full rounded-[10px] bg-[#f7f4ee] px-3 text-[0.9375rem] shadow-[inset_2px_2px_5px_rgba(90,75,55,.1)]";
const n = (v: string) => (v === "" ? 0 : Number(v));

function NumField({ label, value, onChange, hint, step = 1 }: { label: string; value: number; onChange: (v: number) => void; hint?: string; step?: number }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.9375rem] font-medium">{label}</span>
      {hint ? <span className="-mt-1 text-small text-ink-2">{hint}</span> : null}
      <input type="number" step={step} className="field-input" value={Number.isFinite(value) ? value : ""} onChange={(e) => onChange(n(e.target.value))} />
    </label>
  );
}

/** OPS-12: one page for every setting that drives the formulas. */
export function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const total = breakdownTotal(v.breakdown);
  const wSum = v.weights.uniformity + v.weights.youth + v.weights.volume + v.weights.laptopShare;

  const save = async () => {
    setBusy(true);
    const res = await saveSettings({
      weeklyCapacity: v.weeklyCapacity,
      refurbUniform: v.refurbUniform,
      refurbMixed: v.refurbMixed,
      maxAgeYears: v.maxAgeYears,
      weights: v.weights,
      breakdown: v.breakdown,
      breakdownConfirmed: v.breakdownConfirmed,
      acceptedItems: v.acceptedItems,
      factors: v.factors.map((f) => ({ category: f.category, avgWeightKg: f.avgWeightKg, co2e: f.co2eAvoidedKgPerReuse, sourceTitle: f.sourceTitle ?? "TO VERIFY", sourceUrl: f.sourceUrl ?? "", lastReviewed: f.lastReviewed ?? "" })),
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Saved.");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <FlatCard className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <h2 className="text-title font-semibold sm:col-span-2 lg:col-span-4">Capacity &amp; refurbishment time</h2>
        <NumField label="Weekly capacity" hint="Devices per week" value={v.weeklyCapacity} onChange={(x) => setV({ ...v, weeklyCapacity: x })} />
        <NumField label="Uniform batch device" hint="Minutes to refurbish" value={v.refurbUniform} onChange={(x) => setV({ ...v, refurbUniform: x })} />
        <NumField label="Mixed donation device" hint="Minutes to refurbish" value={v.refurbMixed} onChange={(x) => setV({ ...v, refurbMixed: x })} />
        <NumField label="Max device age" hint="Years (score youth)" value={v.maxAgeYears} onChange={(x) => setV({ ...v, maxAgeYears: x })} />
      </FlatCard>

      <FlatCard className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <h2 className="text-title font-semibold">Batch Value Score weights</h2>
          <p className={cn("text-small", Math.abs(wSum - 1) > 0.001 ? "font-semibold text-danger-ink" : "text-ink-2")}>Must add up to 1. Now {wSum.toFixed(2)}.</p>
        </div>
        {(["uniformity", "youth", "volume", "laptopShare"] as const).map((k) => (
          <NumField key={k} step={0.05} label={k === "laptopShare" ? "Laptop share" : k[0].toUpperCase() + k.slice(1)} value={v.weights[k]} onChange={(x) => setV({ ...v, weights: { ...v.weights, [k]: x } })} />
        ))}
      </FlatCard>

      <FlatCard>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-title font-semibold">“Where your money goes”</h2>
            <p className={cn("text-small", Math.abs(total - 100) > 0.001 ? "font-semibold text-danger-ink" : "text-ink-2")}>Shown on every passport. Must total 100% — now {total}%.</p>
          </div>
          <ClayButton variant="secondary" size="sm" icon={<Plus />} onClick={() => setV({ ...v, breakdown: [...v.breakdown, { label: "", percent: 0 }] })} disabled={v.breakdown.length >= 8}>
            Add slice
          </ClayButton>
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {v.breakdown.map((s, i) => (
            <li key={i} className="grid gap-2 sm:grid-cols-[1.2fr_90px_2fr_auto]">
              <input aria-label="Label" className={cell} value={s.label} onChange={(e) => setV({ ...v, breakdown: v.breakdown.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              <input aria-label="Percent" type="number" className={cell} value={s.percent} onChange={(e) => setV({ ...v, breakdown: v.breakdown.map((x, j) => (j === i ? { ...x, percent: n(e.target.value) } : x)) })} />
              <input aria-label="Plain-language description" className={cell} value={s.description ?? ""} onChange={(e) => setV({ ...v, breakdown: v.breakdown.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })} />
              <button type="button" aria-label={`Remove ${s.label || "slice"}`} className="grid size-11 place-items-center rounded-full text-danger-ink hover:bg-[#fbe0e0]" onClick={() => setV({ ...v, breakdown: v.breakdown.filter((_, j) => j !== i) })}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-line pt-5">
          <ClayToggle
            checked={v.breakdownConfirmed}
            onCheckedChange={(c) => setV({ ...v, breakdownConfirmed: c })}
            label="Confirmed by Free Geek Toronto"
            description={'While off, passports label the breakdown "Illustrative — to be confirmed by Free Geek Toronto".'}
          />
        </div>
      </FlatCard>

      <FlatCard className="overflow-x-auto">
        <h2 className="text-title font-semibold">Impact factors</h2>
        <p className="text-small text-ink-2">Used by every impact number in GeekLoop. Replace “TO VERIFY” with a cited source before publishing.</p>
        <table className="data-table mt-4 min-w-[860px]">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Avg. kg</th>
              <th scope="col">kg CO₂e avoided / reuse</th>
              <th scope="col">Source title</th>
              <th scope="col">Source URL</th>
              <th scope="col">Last reviewed</th>
            </tr>
          </thead>
          <tbody>
            {v.factors.map((f, i) => {
              const upd = (patch: Partial<ImpactFactor>) => setV({ ...v, factors: v.factors.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
              return (
                <tr key={f.category}>
                  <td className="font-medium">{labels.category[f.category]}</td>
                  <td className="w-24"><input aria-label={`Weight for ${f.category}`} type="number" step="0.1" className={cell} value={f.avgWeightKg} onChange={(e) => upd({ avgWeightKg: n(e.target.value) })} /></td>
                  <td className="w-32"><input aria-label={`CO2e for ${f.category}`} type="number" className={cell} value={f.co2eAvoidedKgPerReuse} onChange={(e) => upd({ co2eAvoidedKgPerReuse: n(e.target.value) })} /></td>
                  <td><input aria-label={`Source for ${f.category}`} className={cn(cell, f.sourceTitle === "TO VERIFY" && "text-ember-ink")} value={f.sourceTitle ?? ""} onChange={(e) => upd({ sourceTitle: e.target.value })} /></td>
                  <td><input aria-label={`Source URL for ${f.category}`} className={cell} value={f.sourceUrl ?? ""} onChange={(e) => upd({ sourceUrl: e.target.value })} /></td>
                  <td className="w-40"><input aria-label={`Last reviewed for ${f.category}`} type="date" className={cell} value={f.lastReviewed ?? ""} onChange={(e) => upd({ lastReviewed: e.target.value })} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </FlatCard>

      <FlatCard className="overflow-x-auto">
        <h2 className="text-title font-semibold">Accepted items (household checker)</h2>
        <p className="text-small text-ink-2">Rules behind the public “Can I donate this?” page.</p>
        <table className="data-table mt-4 min-w-[860px]">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Decision</th>
              <th scope="col">Max age (yrs)</th>
              <th scope="col">Must work</th>
              <th scope="col">Note shown to the public</th>
            </tr>
          </thead>
          <tbody>
            {v.acceptedItems.map((a, i) => {
              const upd = (patch: Partial<AcceptedItem>) => setV({ ...v, acceptedItems: v.acceptedItems.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
              return (
                <tr key={a.category}>
                  <td className="font-medium">{a.label}</td>
                  <td className="w-48">
                    <Select aria-label={`Decision for ${a.label}`} className="!min-h-11" value={a.decision} onChange={(e) => upd({ decision: e.target.value as AcceptedItem["decision"] })}>
                      <option value="accepted">Accepted</option>
                      <option value="recycling_only">Recycling only</option>
                      <option value="not_accepted">Not accepted</option>
                    </Select>
                  </td>
                  <td className="w-28"><input aria-label={`Max age for ${a.label}`} type="number" className={cell} value={a.maxAgeYears ?? ""} onChange={(e) => upd({ maxAgeYears: e.target.value === "" ? null : n(e.target.value) })} /></td>
                  <td className="w-24 text-center"><input aria-label={`${a.label} must work`} type="checkbox" className="size-5 accent-[var(--loop)]" checked={a.requiresWorking} onChange={(e) => upd({ requiresWorking: e.target.checked })} /></td>
                  <td><input aria-label={`Note for ${a.label}`} className={cell} value={a.note} onChange={(e) => upd({ note: e.target.value })} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </FlatCard>

      <ClayCard material="glass" className="sticky bottom-24 z-20 flex items-center justify-between gap-4 !rounded-full !py-3 !pl-6 !pr-3 lg:bottom-6">
        <p className="text-small text-ink-2">Changes apply everywhere as soon as you save.</p>
        <ClayButton variant="primary" icon={<Save />} loading={busy} onClick={save}>
          Save settings
        </ClayButton>
      </ClayCard>
    </div>
  );
}
