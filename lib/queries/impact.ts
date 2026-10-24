import "server-only";
import type { DB } from "./common";
import { computeImpact, isRefurbishedStatus, outcomeForStatus, type ImpactRow } from "@/lib/impact";
import type { DeviceCategory, DeviceStatus, RecipientCategory } from "@/lib/domain";
import { isUniformQuantity } from "@/lib/batch-score";
import { getFactors, getSettings } from "./common";

interface DeviceLike {
  category: DeviceCategory;
  status: DeviceStatus;
  weight_kg?: number | string | null;
  recipient_category?: RecipientCategory | null;
  line_quantity?: number | null;
  refurbished_at?: string | null;
}

/** Map device rows (from any role's query) to impact rows for lib/impact.ts. */
export function toImpactRows(devices: DeviceLike[]): ImpactRow[] {
  return devices.map((d) => ({
    category: d.category,
    outcome: outcomeForStatus(d.status),
    weightKg: d.weight_kg == null ? null : Number(d.weight_kg),
    uniform: isUniformQuantity(d.line_quantity),
    refurbished: Boolean(d.refurbished_at) || isRefurbishedStatus(d.status),
    recipient: d.status === "sold" ? (d.recipient_category ?? null) : null,
  }));
}

/** Public totals from the anonymous RPC — same formula as everywhere else (CI-03). */
export async function getPublicImpact(db: DB) {
  const [{ data }, factors, settings] = await Promise.all([db.rpc("public_impact_totals"), getFactors(db), getSettings(db)]);
  const payload = (data ?? { rows: [] }) as {
    rows: { category: DeviceCategory; status: DeviceStatus; weight_kg: number | null; uniform: boolean; refurbished: boolean; recipient: RecipientCategory | null; count: number }[];
    active_partners?: number;
    active_volunteers?: number;
    passport_views?: number;
  };
  const rows: ImpactRow[] = payload.rows.map((r) => ({
    category: r.category,
    outcome: outcomeForStatus(r.status),
    weightKg: r.weight_kg,
    uniform: r.uniform,
    refurbished: r.refurbished,
    recipient: r.recipient,
    count: Number(r.count),
  }));
  return {
    totals: computeImpact(rows, factors, settings.refurbMinutes),
    factors,
    activePartners: payload.active_partners ?? 0,
    activeVolunteers: payload.active_volunteers ?? 0,
    passportViews: payload.passport_views ?? 0,
  };
}

/** A partner's own impact (PP-09) from partner_devices(). */
export async function getPartnerImpact(db: DB) {
  const [{ data: devices }, factors, settings] = await Promise.all([db.rpc("partner_devices", {}), getFactors(db), getSettings(db)]);
  const list = devices ?? [];
  return { totals: computeImpact(toImpactRows(list), factors, settings.refurbMinutes), devices: list, factors };
}
