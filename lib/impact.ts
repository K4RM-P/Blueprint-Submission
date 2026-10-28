import type { DeviceCategory, DeviceStatus, RecipientCategory } from "./domain";

/**
 * Impact engine (PRD §9.6, CI-03). The ONLY place impact numbers are computed —
 * passport, partner dashboard, staff overview, public pages and reports all call this.
 */

export interface ImpactFactor {
  category: DeviceCategory;
  avgWeightKg: number;
  co2eAvoidedKgPerReuse: number;
  sourceTitle?: string;
  sourceUrl?: string | null;
  lastReviewed?: string | null;
}

export interface RefurbMinutes {
  uniform: number;
  mixed: number;
}

export const DEFAULT_REFURB_MINUTES: RefurbMinutes = { uniform: 60, mixed: 120 };

export type Outcome = "reused" | "recycled" | "in_progress";

/** One device, or a group of identical devices (`count`). */
export interface ImpactRow {
  category: DeviceCategory;
  outcome: Outcome;
  weightKg?: number | null;
  /** Came in a uniform line item (5+ of the same model). */
  uniform: boolean;
  /** Passed final QA (counts toward volunteer hours). */
  refurbished: boolean;
  count?: number;
  recipient?: RecipientCategory | null;
}

export interface ImpactTotals {
  devicesReceived: number;
  devicesReused: number;
  devicesRecycled: number;
  devicesInProgress: number;
  kgDiverted: number;
  co2eAvoidedKg: number;
  volunteerHours: number;
  recipients: Partial<Record<RecipientCategory, number>>;
}

/** A device is "reused" once sold, "recycled" once responsibly recycled. */
export function outcomeForStatus(status: DeviceStatus): Outcome {
  if (status === "sold") return "reused";
  if (status === "recycled") return "recycled";
  return "in_progress";
}

/** Devices that have passed final QA (refurbished) — ready or later. */
export function isRefurbishedStatus(status: DeviceStatus): boolean {
  return status === "ready" || status === "listed" || status === "sold";
}

const round = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

/** Estimated bench hours: refurbished devices × refurb minutes (uniform vs mixed) ÷ 60, one decimal. */
export function estimateHours(uniform: number, mixed: number, minutes: RefurbMinutes): number {
  return round((uniform * minutes.uniform + mixed * minutes.mixed) / 60);
}

export function computeImpact(rows: ImpactRow[], factors: ImpactFactor[], minutes: RefurbMinutes = DEFAULT_REFURB_MINUTES): ImpactTotals {
  const byCat = new Map(factors.map((f) => [f.category, f]));
  let received = 0,
    reused = 0,
    recycled = 0,
    inProgress = 0,
    kg = 0,
    co2 = 0,
    uniformRefurbished = 0,
    mixedRefurbished = 0;
  const recipients: Partial<Record<RecipientCategory, number>> = {};

  for (const r of rows) {
    const n = r.count ?? 1;
    if (n <= 0) continue;
    const f = byCat.get(r.category);
    const weight = r.weightKg ?? f?.avgWeightKg ?? 0;
    received += n;
    if (r.outcome === "reused") {
      reused += n;
      kg += weight * n;
      co2 += (f?.co2eAvoidedKgPerReuse ?? 0) * n;
      if (r.recipient) recipients[r.recipient] = (recipients[r.recipient] ?? 0) + n;
    } else if (r.outcome === "recycled") {
      recycled += n;
      kg += weight * n;
    } else {
      inProgress += n;
    }
    if (r.refurbished) {
      if (r.uniform) uniformRefurbished += n;
      else mixedRefurbished += n;
    }
  }

  return {
    devicesReceived: received,
    devicesReused: reused,
    devicesRecycled: recycled,
    devicesInProgress: inProgress,
    kgDiverted: round(kg),
    co2eAvoidedKg: round(co2),
    volunteerHours: estimateHours(uniformRefurbished, mixedRefurbished, minutes),
    recipients,
  };
}

/** Impact of one device for its passport. */
export function deviceImpact(row: Omit<ImpactRow, "count">, factors: ImpactFactor[]): { kg: number; co2eKg: number } {
  const f = factors.find((x) => x.category === row.category);
  const kg = row.weightKg ?? f?.avgWeightKg ?? 0;
  // A passport device is on its way to reuse, so show its reuse impact.
  return { kg: round(kg), co2eKg: round(f?.co2eAvoidedKgPerReuse ?? 0) };
}

/** People helped = devices in someone's hands. */
export function peopleHelped(t: ImpactTotals): number {
  return t.devicesReused;
}

/** Monthly series for charts: devices received and reused per month. */
export function monthlySeries(
  events: { receivedAt: string | null; soldAt: string | null }[],
  months: string[],
): { month: string; received: number; reused: number }[] {
  return months.map((m) => ({
    month: m,
    received: events.filter((e) => e.receivedAt?.slice(0, 7) === m).length,
    reused: events.filter((e) => e.soldAt?.slice(0, 7) === m).length,
  }));
}

/** Running totals at the end of each month (everything up to and including it), for "devices over time" charts. */
export function runningTotals(
  events: { receivedAt: string | null; soldAt: string | null }[],
  months: string[],
): { month: string; received: number; reused: number }[] {
  return months.map((m) => ({
    month: m,
    received: events.filter((e) => e.receivedAt != null && e.receivedAt.slice(0, 7) <= m).length,
    reused: events.filter((e) => e.soldAt != null && e.soldAt.slice(0, 7) <= m).length,
  }));
}

export function lastMonths(today: Date, count: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}
