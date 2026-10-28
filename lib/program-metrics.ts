import { isUniformQuantity } from "./batch-score";
import type { DeviceCategory, DeviceStatus } from "./domain";

export type DeviceSource = "partner" | "household";

/**
 * Reuse Partnership program metrics for the staff overview (OPS-01). Pure and
 * tested; computed only from data Relay already records (devices, batches and
 * the append-only device_events timestamps).
 */

export interface MetricDevice {
  id: string;
  source: DeviceSource;
  category: DeviceCategory;
  status: DeviceStatus;
  batchId: string | null;
  /** Quantity of the batch line the device came from (uniform = 5+ identical). */
  lineQuantity: number | null;
  /** Intake: when the device record was created (its "received" event). */
  receivedAt: string;
  soldAt: string | null;
  priceCents: number | null;
  passportViews: number;
}

export interface MetricBatch {
  id: string;
  organizationId: string;
  status: string;
  receivedAt: string | null;
}

export interface MonthCount {
  month: string; // YYYY-MM
  label: string; // "Jun"
  laptops: number;
}

export interface ProgramMetrics {
  partnerLaptopsByMonth: MonthCount[];
  activePartners: number;
  /** Partners with a second (non-declined) batch. */
  returningPartners: number;
  /** returningPartners / activePartners, 0–1; null with no partners. */
  retention: number | null;
  /** Average whole days from intake to the device's first "ready" event. */
  daysToReady: { partnerUniform: number | null; household: number | null; partnerUniformN: number; householdN: number };
  sales: {
    partner: { count: number; revenueCents: number; priced: number };
    household: { count: number; revenueCents: number; priced: number };
  };
  partnerPassportViews: number;
}

const DAY = 86_400_000;
const ym = (iso: string) => iso.slice(0, 7);

/** The last `n` calendar months ending with `today`'s month, oldest first. */
export function recentMonths(today: Date, n: number): { month: string; label: string }[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (n - 1 - i), 1));
    return { month: d.toISOString().slice(0, 7), label: d.toLocaleDateString("en-CA", { month: "short", timeZone: "UTC" }) };
  });
}

function avg(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10;
}

export function computeProgramMetrics(input: {
  devices: MetricDevice[];
  batches: MetricBatch[];
  /** device id → first time it reached "ready" (from device_events). */
  readyAt: Map<string, string>;
  today: Date;
  months?: number;
}): ProgramMetrics {
  const { devices, batches, readyAt, today } = input;
  const batchById = new Map(batches.map((b) => [b.id, b]));

  const months = recentMonths(today, input.months ?? 6);
  const partnerLaptops = devices.filter((d) => d.source === "partner" && d.category === "laptop");
  const partnerLaptopsByMonth = months.map((m) => ({
    ...m,
    laptops: partnerLaptops.filter((d) => ym((d.batchId && batchById.get(d.batchId)?.receivedAt) || d.receivedAt) === m.month).length,
  }));

  const perOrg = new Map<string, number>();
  for (const b of batches) if (b.status !== "declined") perOrg.set(b.organizationId, (perOrg.get(b.organizationId) ?? 0) + 1);
  const activePartners = perOrg.size;
  const returningPartners = [...perOrg.values()].filter((n) => n >= 2).length;

  const days = (d: MetricDevice) => {
    const r = readyAt.get(d.id);
    if (!r) return null;
    const ms = new Date(r).getTime() - new Date(d.receivedAt).getTime();
    return Number.isFinite(ms) && ms >= 0 ? ms / DAY : null;
  };
  const uniformDays = devices.filter((d) => d.source === "partner" && isUniformQuantity(d.lineQuantity)).map(days).filter((x): x is number => x !== null);
  const householdDays = devices.filter((d) => d.source === "household").map(days).filter((x): x is number => x !== null);

  const salesOf = (source: DeviceSource) => {
    const sold = devices.filter((d) => d.source === source && d.status === "sold");
    const priced = sold.filter((d) => typeof d.priceCents === "number");
    return { count: sold.length, revenueCents: priced.reduce((s, d) => s + (d.priceCents ?? 0), 0), priced: priced.length };
  };

  return {
    partnerLaptopsByMonth,
    activePartners,
    returningPartners,
    retention: activePartners ? returningPartners / activePartners : null,
    daysToReady: { partnerUniform: avg(uniformDays), household: avg(householdDays), partnerUniformN: uniformDays.length, householdN: householdDays.length },
    sales: { partner: salesOf("partner"), household: salesOf("household") },
    partnerPassportViews: devices.filter((d) => d.source === "partner").reduce((s, d) => s + (d.passportViews || 0), 0),
  };
}
