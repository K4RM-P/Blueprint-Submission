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
