import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { DeviceCategory, DeviceStatus } from "@/lib/domain";
import type { BreakdownSlice } from "@/lib/pricing";
import { isValidPassportCode, normalizePassportCode } from "@/lib/passport-code";

/** Exactly the public-safe fields get_passport() returns (DP-05: no serial, report ID, recipient or price). */
export interface Passport {
  code: string;
  category: DeviceCategory;
  make: string;
  model: string;
  cpu: string | null;
  ram_gb: number | null;
  storage_gb: number | null;
  approx_year: number | null;
  status: DeviceStatus;
  os_installed: string | null;
  is_open_source_os: boolean | null;
  weight_kg: number | null;
  uniform: boolean;
  pif_subsidized: boolean;
  donor: { type: "partner" | "household"; name: string | null; logo_path: string | null };
  volunteer_first_name: string | null;
  timeline: { donated_at: string; wipe_verified_at: string | null; refurbished_at: string | null; ready_at: string | null; in_new_home: boolean };
  factor: { category: DeviceCategory; avg_weight_kg: number; co2e_avoided_kg_per_reuse: number; source_title: string; source_url: string | null } | null;
  price_breakdown: BreakdownSlice[];
  price_breakdown_confirmed: boolean;
}

/** Cached per request so metadata + page count one view, not two. */
export const getPassport = cache(async (raw: string): Promise<Passport | null> => {
  const code = normalizePassportCode(decodeURIComponent(raw));
  if (!isValidPassportCode(code)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_passport", { p_code: code });
  return (data as Passport | null) ?? null;
});
