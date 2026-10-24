"use server";

import { z } from "zod";
import { fail, ok, runAction, type ActionResult } from "@/lib/action";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { AGE_BUCKETS, DEFAULT_ACCEPTED_ITEMS, evaluateDonation, type AcceptedItem, type CheckerResult } from "@/lib/checker";
import { DEVICE_CATEGORIES } from "@/lib/domain";

const answersSchema = z.object({
  category: z.enum(DEVICE_CATEGORIES),
  age: z.enum(AGE_BUCKETS.map((a) => a.value) as [string, ...string[]]),
  working: z.enum(["yes", "partly", "no", "unsure"]),
  isBusiness: z.boolean(),
  quantity: z.number().int().min(1).max(10_000),
});

/**
 * HC-02…HC-04: evaluate a donation against the staff-configured rules and log the
 * outcome anonymously (category, outcome, business yes/no — nothing else).
 */
export async function checkDonation(input: unknown): Promise<ActionResult<CheckerResult>> {
  return runAction(answersSchema, input, async (a) => {
    if (!(await rateLimit("checker", 20))) return fail("That's a lot of checks in a minute. Please wait a moment and try again.");
    const supabase = await createClient();
    const { data } = await supabase.rpc("public_settings");
    const stored = (data as { accepted_items?: AcceptedItem[] } | null)?.accepted_items ?? [];
    const rules = stored.length ? stored : DEFAULT_ACCEPTED_ITEMS;
    const ageYears = AGE_BUCKETS.find((b) => b.value === a.age)?.years ?? null;
    const result = evaluateDonation({ category: a.category, ageYears, working: a.working, isBusiness: a.isBusiness, quantity: a.isBusiness ? a.quantity : 1 }, rules);
    // Logging is best-effort analytics; never block the answer on it.
    await supabase.rpc("log_checker", { p_category: a.category, p_outcome: result.outcome, p_is_business: a.isBusiness });
    return ok(result);
  });
}
