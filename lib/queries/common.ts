import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { buildCalendar, upcomingWeeks, type CapacityWeek } from "@/lib/capacity";
import type { ImpactFactor } from "@/lib/impact";
import { DEFAULT_WEIGHTS, type ScoreWeights } from "@/lib/batch-score";
import type { BreakdownSlice } from "@/lib/pricing";
import type { AcceptedItem } from "@/lib/checker";
import { env } from "@/lib/env";
import { certificateWording, safeStoreUrl, type CertificateWording } from "@/lib/certificate-wording";

export type DB = SupabaseClient<Database>;

export interface AppSettings {
  weeklyCapacity: number;
  refurbMinutes: { uniform: number; mixed: number };
  weights: ScoreWeights;
  maxAgeYears: number;
  priceBreakdown: BreakdownSlice[];
  priceBreakdownConfirmed: boolean;
  acceptedItems: AcceptedItem[];
  /** Certificate wording (optional standard, process, disclaimer). Defaults until staff edit it. */
  certificate: CertificateWording;
  /** FGT's existing online store; passports of ready/listed devices link to it. */
  storeUrl: string | null;
  /** False until migration 20261027000001 is applied (the new settings columns are missing). */
  alignmentColumns: boolean;
}

export async function getSettings(db: DB): Promise<AppSettings> {
  const { data } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
  return {
    weeklyCapacity: data?.weekly_capacity_devices ?? 20,
    refurbMinutes: { uniform: data?.refurb_minutes_uniform ?? 60, mixed: data?.refurb_minutes_mixed ?? 120 },
    weights: { ...DEFAULT_WEIGHTS, ...((data?.batch_score_weights as Partial<ScoreWeights> | null) ?? {}) },
    maxAgeYears: data?.max_device_age_years ?? 8,
    priceBreakdown: (data?.price_breakdown as unknown as BreakdownSlice[] | null) ?? [],
    priceBreakdownConfirmed: data?.price_breakdown_confirmed ?? false,
    acceptedItems: (data?.accepted_items as unknown as AcceptedItem[] | null) ?? [],
    certificate: certificateWording(data),
    storeUrl: safeStoreUrl(data?.store_url),
    alignmentColumns: Boolean(data && "store_url" in data),
  };
}

export async function getFactors(db: DB): Promise<ImpactFactor[]> {
  const { data } = await db.from("impact_factors").select("*").order("category");
  return (data ?? []).map((f) => ({
    category: f.category,
    avgWeightKg: Number(f.avg_weight_kg),
    co2eAvoidedKgPerReuse: Number(f.co2e_avoided_kg_per_reuse),
    sourceTitle: f.source_title,
    sourceUrl: f.source_url,
    lastReviewed: f.last_reviewed,
  }));
}

/** Next 8 weeks with load from every partner's approved/scheduled batches (PP-04). */
export async function getCalendar(db: DB, capacity: number, count = 8, today = new Date()): Promise<CapacityWeek[]> {
  const weeks = upcomingWeeks(today, count);
  const { data } = await db.rpc("week_loads", { p_from: weeks[0], p_to: weeks[weeks.length - 1] });
  const loads = (data ?? []).map((r) => ({ week: r.week, devices: Number(r.devices) }));
  return buildCalendar(weeks, loads, capacity);
}

export function logoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${env.supabaseUrl}/storage/v1/object/public/logos/${path}`;
}

/** Public, anon-safe settings (store link + certificate wording). Missing keys fall back to defaults. */
export async function getPublicSettings(db: DB): Promise<{ storeUrl: string | null; certificate: CertificateWording }> {
  const { data } = await db.rpc("public_settings");
  const row = (data ?? null) as { store_url?: string | null; sanitization_standard?: string | null; sanitization_process?: string | null; certificate_disclaimer?: string | null } | null;
  return { storeUrl: safeStoreUrl(row?.store_url), certificate: certificateWording(row) };
}
