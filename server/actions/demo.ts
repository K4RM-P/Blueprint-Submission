"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fail, ok, runAction, type ActionResult } from "@/lib/action";
import { demoStaffClient, resetDemo, type ResetReport } from "@/lib/demo-reset";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

/** Demo mode only: restore work in every queue so the next visitor can try the whole loop. */
export async function resetDemoAction(): Promise<ActionResult<ResetReport>> {
  return runAction(z.undefined(), undefined, async () => {
    if (!env.demoMode) return fail("Reset demo only works in demo mode.");
    if (!(await rateLimit("reset-demo", 3))) return fail("The demo was just reset. Try again in a minute.");
    const db = await demoStaffClient();
    if (!db) return fail("The demo accounts aren't available. Run `pnpm seed` and try again.");
    try {
      const report = await resetDemo(db);
      revalidatePath("/", "layout");
      const added = [report.benchAdded ? `${report.benchAdded} laptops on the volunteer bench` : null, report.batchesAdded ? `${report.batchesAdded} batches for staff to review` : null].filter(Boolean).join(" and ");
      return ok(report, `${added ? `Added ${added}.` : "Every queue already has work."}${report.showcaseIntact ? " Showcase passports are intact." : " A showcase passport changed: run `pnpm seed` to restore it."}`);
    } finally {
      await db.auth.signOut({ scope: "local" });
    }
  });
}
