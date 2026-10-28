import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
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
 * For share images (story PNG, Open Graph card): the same public-safe data, cached for
 * 10 minutes per code with a cookie-less client. get_passport_story() also counts a
 * passport view, so crawlers and link previews refetching an image don't inflate
 * passport views (DP-06): at most one count per code per 10 minutes from images.
 */
export const getPassportStoryForImage = (raw: string): Promise<PassportStoryData | null> => {
  const code = normalizePassportCode(decodeURIComponent(raw));
  if (!isValidPassportCode(code)) return Promise.resolve(null);
  return unstable_cache(
    async () => {
      const { data } = await createPublicClient().rpc("get_passport_story", { p_code: code });
      return (data as unknown as PassportStoryData | null) ?? null;
    },
    ["passport-image", code],
    { revalidate: 600 },
  )();
};
