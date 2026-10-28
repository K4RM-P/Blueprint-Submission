import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isValidPassportCode, normalizePassportCode } from "@/lib/passport-code";
import type { PassportStoryData } from "@/lib/passport-story";

/** The public-safe passport (DP-05: no serial, report ID, recipient or price). */
export type Passport = PassportStoryData;

/**
 * get_passport_story(): the passport plus its public milestones. Cached per request
 * so metadata + page count one view, not two.
 */
export const getPassportStory = cache(async (raw: string): Promise<PassportStoryData | null> => {
  const code = normalizePassportCode(decodeURIComponent(raw));
  if (!isValidPassportCode(code)) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_passport_story", { p_code: code });
  return (data as unknown as PassportStoryData | null) ?? null;
});

/**
 * The owning Reuse Partner, if the signed-in viewer is a partner whose organization
 * donated this device. partner_devices() is already scoped to the caller's org by RLS,
 * so a match means it is theirs. Anyone else (anon, other partners, staff) gets null.
 */
export const getPassportOwner = cache(async (code: string): Promise<{ orgName: string } | null> => {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return null;
  const { data: me } = await supabase.from("profiles").select("role, organization_id").eq("id", claims.claims.sub).maybeSingle();
  if (me?.role !== "partner" || !me.organization_id) return null;
  const [{ data: org }, { data: mine }] = await Promise.all([
    supabase.from("organizations").select("name").eq("id", me.organization_id).maybeSingle(),
    supabase.rpc("partner_devices"),
  ]);
  if (!org?.name) return null;
  return (mine ?? []).some((d) => d.passport_code === code) ? { orgName: org.name } : null;
});
