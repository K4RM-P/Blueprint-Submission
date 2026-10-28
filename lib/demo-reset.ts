import "server-only";
import { createClient as createSupabase, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { computeBatchScore } from "@/lib/batch-score";
import { addDays, mondayOf, toISODate } from "@/lib/dates";
import { env } from "@/lib/env";
import { generateUniqueCodes } from "@/lib/passport-code";
import { SHOWCASE_PASSPORTS } from "@/lib/showcase-passports";

type DB = SupabaseClient<Database>;

/** What every judge should find, however many are using the demo at once. */
export const DEMO_MINIMUMS = { benchQueue: 6, staffQueue: 2 } as const;

/** Statuses the four showcase passports are seeded with (supabase/seed.ts). */
export const SHOWCASE_EXPECTED: Record<string, string> = {
  "FGT-WRAPPED2": "sold",
  "FGT-QUEEN7WD": "sold",
  "FGT-BENCH24Z": "refurbishing",
  "FGT-PARTS4RC": "recycled",
};

export interface ResetReport {
  benchAdded: number;
  batchesAdded: number;
  claimsReleased: number;
  showcaseIntact: boolean;
}

/**
 * Signs in as the demo staff account with its own, cookie-less client. This is the
 * same account /demo already signs people into; no service-role key is involved,
 * so RLS and every status-machine trigger still apply to the reset itself.
 */
export async function demoStaffClient(): Promise<DB | null> {
  const password = process.env.DEMO_PASSWORD;
  if (!env.demoMode || !password) return null;
  const db = createSupabase<Database>(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await db.auth.signInWithPassword({ email: "demo-staff@geekloop.test", password });
  return error ? null : db;
}

const BENCH_LINE = { category: "laptop" as const, make: "Lenovo", model: "ThinkPad T490", approx_year: 2020, condition: "working" as const };
const QUEUE_LINES = [
  { category: "laptop" as const, make: "Dell", model: "Latitude 5410", approx_year: 2020, quantity: 12, condition: "working" as const },
  { category: "laptop" as const, make: "HP", model: "EliteBook 840 G7", approx_year: 2021, quantity: 10, condition: "working" as const },
];
const DEMO_NOTE = "Demo data: added by Reset demo so every visitor finds work in the queue.";

async function demoOrg(db: DB, slug: string): Promise<string | null> {
  const { data } = await db.from("organizations").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

function score(lines: { category: "laptop"; make: string; model: string; approx_year: number; quantity: number }[]) {
  return computeBatchScore(lines.map((l) => ({ category: l.category, make: l.make, model: l.model, approxYear: l.approx_year, quantity: l.quantity })), { currentYear: new Date().getFullYear() }).score;
}

/**
 * Restores work safely: tops up the volunteer queue and the staff review queue,
 * releases unstarted claims, and checks the showcase passports. It only ever adds
 * records or makes normal forward moves; it never edits or deletes history.
 */
export async function resetDemo(db: DB, today = new Date()): Promise<ResetReport> {
  const report: ResetReport = { benchAdded: 0, batchesAdded: 0, claimsReleased: 0, showcaseIntact: true };
  const nextMonday = toISODate(addDays(mondayOf(today), 7));

  // 1 · Claims nobody started within 30 minutes (still "received") go back to the queue.
  const stale = new Date(today.getTime() - 30 * 60_000).toISOString();
  const { data: claimed } = await db.from("devices").select("id").eq("status", "received").not("assigned_volunteer_id", "is", null).lt("updated_at", stale);
  if (claimed?.length) {
    const ids = claimed.map((d) => d.id);
    const { error } = await db.from("devices").update({ assigned_volunteer_id: null }).in("id", ids);
    if (!error) report.claimsReleased = ids.length;
  }

  // 2 · Volunteer bench: a fresh uniform partner batch when the queue runs low.
  const { count: queue } = await db.from("devices").select("id", { count: "exact", head: true }).eq("status", "received").is("assigned_volunteer_id", null);
  const need = DEMO_MINIMUMS.benchQueue - (queue ?? 0);
  const benchOrg = await demoOrg(db, "brightpath-logistics");
  if (need > 0 && benchOrg) {
    const qty = Math.max(need, 8);
    const { data: batch, error } = await db
      .from("donation_batches")
      .insert({ organization_id: benchOrg, status: "submitted", logistics: "dropoff", preferred_week: nextMonday, data_handling_ack: true, value_score: score([{ ...BENCH_LINE, quantity: qty }]), notes: DEMO_NOTE })
      .select("id")
      .single();
    if (error || !batch) throw error ?? new Error("Couldn't add a demo batch.");
    const { data: line, error: le } = await db.from("batch_line_items").insert({ batch_id: batch.id, ...BENCH_LINE, quantity: qty }).select("id").single();
    if (le || !line) throw le ?? new Error("Couldn't add a demo line item.");
    // Normal forward moves through the batch status machine.
    for (const status of ["approved", "scheduled", "received"] as const) {
      const { error: se } = await db.from("donation_batches").update({ status }).eq("id", batch.id);
      if (se) throw se;
    }
    const codes = generateUniqueCodes(qty);
    const { error: de } = await db.from("devices").insert(
      codes.map((passport_code) => ({ passport_code, batch_id: batch.id, line_item_id: line.id, source: "partner" as const, category: BENCH_LINE.category, make: BENCH_LINE.make, model: BENCH_LINE.model, approx_year: BENCH_LINE.approx_year })),
    );
    if (de) throw de;
    report.benchAdded = qty;
  }

  // 3 · Staff review queue: at least two submitted partner batches.
  const { count: submitted } = await db.from("donation_batches").select("id", { count: "exact", head: true }).eq("status", "submitted");
  const queueOrg = await demoOrg(db, "danforth-legal-llp");
  for (let i = 0; i < DEMO_MINIMUMS.staffQueue - (submitted ?? 0) && queueOrg; i++) {
    const l = QUEUE_LINES[i % QUEUE_LINES.length];
    const { data: batch, error } = await db
      .from("donation_batches")
      .insert({ organization_id: queueOrg, status: "submitted", logistics: "dropoff", preferred_week: toISODate(addDays(mondayOf(today), 14 + i * 7)), data_handling_ack: true, value_score: score([l]), notes: DEMO_NOTE })
      .select("id")
      .single();
    if (error || !batch) throw error ?? new Error("Couldn't add a demo batch.");
    const { error: le } = await db.from("batch_line_items").insert({ batch_id: batch.id, ...l });
    if (le) throw le;
    report.batchesAdded++;
  }

  // 4 · Showcase passports are locked in demo mode; confirm they still tell their story.
  const { data: showcase } = await db.from("devices").select("passport_code, status").in("passport_code", SHOWCASE_PASSPORTS.map((p) => p.code));
  report.showcaseIntact = SHOWCASE_PASSPORTS.every((p) => showcase?.some((d) => d.passport_code === p.code && d.status === SHOWCASE_EXPECTED[p.code]));
  return report;
}
