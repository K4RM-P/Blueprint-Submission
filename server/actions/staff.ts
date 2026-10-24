"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { ActionError, fail, ok, runAction, type ActionResult } from "@/lib/action";
import { generateUniqueCodes } from "@/lib/passport-code";
import { canTransitionBatch, canTransitionDevice, devicePath } from "@/lib/status-machine";
import { DEVICE_CATEGORIES, DEVICE_STATUSES, PARTNER_TIERS, RECIPIENT_CATEGORIES, SALE_CHANNELS, type DeviceStatus } from "@/lib/domain";
import { getCalendar, getSettings } from "@/lib/queries/common";
import { isMonday } from "@/lib/dates";
import { nextOpenWeek, wouldExceed } from "@/lib/capacity";
import { validateBreakdown } from "@/lib/pricing";
import { canApplySubsidy } from "@/lib/ledger";
import { PIF_ELIGIBLE_RECIPIENTS } from "@/lib/domain";

const staff = () => assertRole("staff");
const uuid = z.uuid();
const refresh = (...paths: string[]) => paths.forEach((p) => revalidatePath(p, "layout"));

// ---------------------------------------------------------------- batches (OPS-03, OPS-04)

export async function approveBatch(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ id: uuid }), input, async ({ id }) => {
    const s = await staff();
    const { error } = await s.supabase.from("donation_batches").update({ status: "approved" }).eq("id", id).eq("status", "submitted");
    if (error) throw error;
    refresh("/staff");
    return ok(null, "Batch approved. Schedule it next.");
  });
}

export async function declineBatch(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ id: uuid, reason: z.string().trim().min(10, "Give the partner a helpful reason (10+ characters).").max(600) }), input, async ({ id, reason }) => {
    const s = await staff();
    const check = canTransitionBatch("submitted", "declined", { declineReason: reason });
    if (!check.ok) return fail(check.reason);
    const { error } = await s.supabase.from("donation_batches").update({ status: "declined", decline_reason: reason }).eq("id", id).eq("status", "submitted");
    if (error) throw error;
    refresh("/staff");
    return ok(null, "Batch declined. The partner can see your reason.");
  });
}

const scheduleSchema = z.object({ id: uuid, week: z.string().refine(isMonday, "Choose a week."), overrideNote: z.string().trim().max(300).optional() });

/** Schedules a batch; warns + suggests the next open week if capacity would be exceeded; staff may override with a note. */
export async function scheduleBatch(input: unknown): Promise<ActionResult<{ warning?: string; suggestion?: string | null }>> {
  return runAction(scheduleSchema, input, async ({ id, week, overrideNote }) => {
    const s = await staff();
    const { data: b } = await s.supabase.from("donation_batches").select("status, batch_line_items(quantity)").eq("id", id).single();
    if (!b) return fail("Batch not found.");
    const qty = b.batch_line_items.reduce((a, l) => a + l.quantity, 0);
    const settings = await getSettings(s.supabase);
    const cal = await getCalendar(s.supabase, settings.weeklyCapacity, 12);
    const loads = cal.map((w) => ({ week: w.week, devices: w.load }));
    if (wouldExceed(week, qty, loads, settings.weeklyCapacity) && !overrideNote) {
      const suggestion = nextOpenWeek(cal.map((w) => w.week), qty, loads, settings.weeklyCapacity);
      return ok({ warning: `That week would be over capacity (${settings.weeklyCapacity} devices).`, suggestion });
    }
    if (b.status === "submitted") {
      const { error } = await s.supabase.from("donation_batches").update({ status: "approved" }).eq("id", id);
      if (error) throw error;
    } else if (b.status !== "approved") return fail("Only approved batches can be scheduled.");
    const { error } = await s.supabase
      .from("donation_batches")
      .update({ status: "scheduled", scheduled_week: week, schedule_override_note: overrideNote || null })
      .eq("id", id);
    if (error) throw error;
    refresh("/staff");
    return ok({}, "Batch scheduled. The partner sees the new week.");
  });
}

/** OPS-04: mark received and bulk-add N devices per line item, each with a unique passport code. */
export async function receiveBatch(input: unknown): Promise<ActionResult<{ added: number }>> {
  return runAction(z.object({ id: uuid }), input, async ({ id }) => {
    const s = await staff();
    const { data: b } = await s.supabase.from("donation_batches").select("status, batch_line_items(*)").eq("id", id).single();
    if (!b) return fail("Batch not found.");
    if (b.status === "approved") {
      const { error } = await s.supabase.from("donation_batches").update({ status: "scheduled" }).eq("id", id);
      if (error) throw error;
    } else if (b.status !== "scheduled") return fail("Only approved or scheduled batches can be received.");
    const { error } = await s.supabase.from("donation_batches").update({ status: "received" }).eq("id", id);
    if (error) throw error;
    const added = await addDevicesForLines(s.supabase, id, b.batch_line_items);
    refresh("/staff");
    return ok({ added }, `Received. ${added} devices added with passport codes.`);
  });
}

type LineRow = { id: string; category: (typeof DEVICE_CATEGORIES)[number]; make: string; model: string; approx_year: number | null; quantity: number };

async function addDevicesForLines(db: Awaited<ReturnType<typeof staff>>["supabase"], batchId: string, lines: LineRow[]) {
  const { data: existing } = await db.from("devices").select("line_item_id").eq("batch_id", batchId);
  const have = new Map<string, number>();
  for (const d of existing ?? []) if (d.line_item_id) have.set(d.line_item_id, (have.get(d.line_item_id) ?? 0) + 1);
  const rows = lines.flatMap((l) =>
    Array.from({ length: Math.max(0, l.quantity - (have.get(l.id) ?? 0)) }, () => ({
      batch_id: batchId,
      line_item_id: l.id,
      source: "partner" as const,
      category: l.category,
      make: l.make,
      model: l.model,
      approx_year: l.approx_year,
    })),
  );
  if (rows.length === 0) return 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const codes = generateUniqueCodes(rows.length);
    const { error } = await db.from("devices").insert(rows.map((r, i) => ({ ...r, passport_code: codes[i] })));
    if (!error) return rows.length;
    if (!/duplicate/i.test(error.message)) throw error;
  }
  throw new ActionError("Couldn't generate unique passport codes. Try again.");
}

const deviceEdit = z.object({
  id: uuid,
  serial: z.string().trim().max(80).optional(),
  cpu: z.string().trim().max(80).optional(),
  ramGb: z.number().int().min(0).max(1024).nullable().optional(),
  storageGb: z.number().int().min(0).max(100000).nullable().optional(),
  weightKg: z.number().positive().max(100).nullable().optional(),
});

export async function saveDeviceSpecs(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ rows: z.array(deviceEdit).min(1).max(500) }), input, async ({ rows }) => {
    const s = await staff();
    for (const r of rows) {
      const { error } = await s.supabase
        .from("devices")
        .update({ serial_number: r.serial || null, cpu: r.cpu || null, ram_gb: r.ramGb ?? null, storage_gb: r.storageGb ?? null, weight_kg: r.weightKg ?? null })
        .eq("id", r.id);
      if (error) throw error;
    }
    refresh("/staff");
    return ok(null, `Saved ${rows.length} device${rows.length === 1 ? "" : "s"}.`);
  });
}

// ---------------------------------------------------------------- devices (OPS-05..07, OPS-13)

async function loadDevice(db: Awaited<ReturnType<typeof staff>>["supabase"], id: string) {
  const { data } = await db.from("devices").select("id, status, wipe_verified_at, os_installed, refurbished_at, price_cents, wipe_report_ref").eq("id", id).single();
  if (!data) throw new ActionError("Device not found.");
  return data;
}

/** Walk a device to `to` through every intermediate state, so each step is logged. */
async function walkTo(db: Awaited<ReturnType<typeof staff>>["supabase"], id: string, from: DeviceStatus, to: DeviceStatus, extra: Record<string, unknown> = {}) {
  const path = devicePath(from, to);
  if (!path) throw new ActionError(`A device can't go from ${from.replaceAll("_", " ")} to ${to.replaceAll("_", " ")}.`);
  for (const [i, next] of path.entries()) {
    const { error } = await db.from("devices").update({ status: next, ...(i === path.length - 1 ? extra : {}) } as never).eq("id", id);
    if (error) throw error;
  }
}

const verifySchema = z.object({
  ids: z.array(uuid).min(1).max(500),
  method: z.string().trim().min(3, "Enter the sanitization method.").max(120),
  reference: z.string().trim().max(120).optional(),
});

/** OPS-07: staff-only wipe verification (single or bulk). Devices whose OS/QA were already done advance automatically. */
export async function verifyWipes(input: unknown): Promise<ActionResult<{ verified: number }>> {
  return runAction(verifySchema, input, async ({ ids, method, reference }) => {
    const s = await staff();
    let verified = 0;
    const skipped: string[] = [];
    for (const id of ids) {
      const d = await loadDevice(s.supabase, id);
      if (d.status !== "wipe_pending_verification") {
        skipped.push(id);
        continue;
      }
      const ref = reference || d.wipe_report_ref;
      if (!ref) {
        skipped.push(id);
        continue;
      }
      const { error } = await s.supabase.from("devices").update({ status: "wipe_verified", wipe_method: method, wipe_report_ref: ref }).eq("id", id);
      if (error) throw error;
      verified++;
      if (d.os_installed) await walkTo(s.supabase, id, "wipe_verified", d.refurbished_at ? "ready" : "refurbishing");
    }
    refresh("/staff");
    if (verified === 0) return fail("None of those devices were waiting for wipe verification with a report ID.");
    return ok({ verified }, `${verified} wipe${verified === 1 ? "" : "s"} verified${skipped.length ? ` · ${skipped.length} skipped` : ""}.`);
  });
}

export async function changeStatus(input: unknown): Promise<ActionResult<{ changed: number }>> {
  return runAction(z.object({ ids: z.array(uuid).min(1).max(500), to: z.enum(DEVICE_STATUSES), reason: z.string().trim().max(300).optional() }), input, async ({ ids, to, reason }) => {
    const s = await staff();
    if (to === "wipe_verified") return fail("Use “Verify wipe” so the method and report ID are recorded.");
    if (to === "sold") return fail("Use “Record sale” so the sale details are recorded.");
    let changed = 0;
    const errors: string[] = [];
    for (const id of ids) {
      const d = await loadDevice(s.supabase, id);
      const check = canTransitionDevice(d.status, to, { actor: "staff", wipeVerifiedAt: d.wipe_verified_at, recycledReason: reason });
      if (!check.ok) {
        errors.push(check.reason);
        continue;
      }
      const { error } = await s.supabase.from("devices").update({ status: to, recycled_reason: to === "recycled" ? reason : undefined, assigned_volunteer_id: to === "recycled" ? null : undefined }).eq("id", id);
      if (error) errors.push(error.message);
      else changed++;
    }
    refresh("/staff");
    if (changed === 0) return fail(errors[0] ?? "Nothing changed.");
    return ok({ changed }, `${changed} device${changed === 1 ? "" : "s"} updated${errors.length ? ` · ${errors.length} blocked: ${errors[0]}` : ""}.`);
  });
}

export async function assignVolunteer(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ ids: z.array(uuid).min(1).max(500), volunteerId: uuid.nullable() }), input, async ({ ids, volunteerId }) => {
    const s = await staff();
    const { error } = await s.supabase.from("devices").update({ assigned_volunteer_id: volunteerId }).in("id", ids);
    if (error) throw error;
    refresh("/staff");
    return ok(null, volunteerId ? "Assigned." : "Unassigned.");
  });
}

export async function setPrice(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ id: uuid, priceCents: z.number().int().min(0).max(1_000_000) }), input, async ({ id, priceCents }) => {
    const s = await staff();
    const { error } = await s.supabase.from("devices").update({ price_cents: priceCents }).eq("id", id);
    if (error) throw error;
    refresh("/staff");
    return ok(null, "Price saved. Relay only displays the prices FGT sets.");
  });
}

const saleSchema = z.object({
  id: uuid,
  soldAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the sale date."),
  channel: z.enum(SALE_CHANNELS),
  recipient: z.enum(RECIPIENT_CATEGORIES).nullable(),
  subsidyCents: z.number().int().min(0).max(1_000_000).default(0),
});

/** OPS-06 record sale; PIF-03 optional subsidy (only for digital-inclusion recipients, never negative). */
export async function recordSale(input: unknown): Promise<ActionResult<null>> {
  return runAction(saleSchema, input, async ({ id, soldAt, channel, recipient, subsidyCents }) => {
    const s = await staff();
    const d = await loadDevice(s.supabase, id);
    if (d.status !== "ready" && d.status !== "listed") return fail("Only ready or listed devices can be sold.");
    if (subsidyCents > 0) {
      if (!recipient || !PIF_ELIGIBLE_RECIPIENTS.includes(recipient)) return fail("Pay-It-Forward subsidies are only for digital-inclusion recipients.");
      const { data: summary } = await s.supabase.rpc("public_fund_summary");
      const balance = Number((summary as { balance_cents?: number } | null)?.balance_cents ?? 0);
      const err = canApplySubsidy(balance, subsidyCents, d.price_cents);
      if (err) return fail(err);
    }
    if (d.status === "ready") await walkTo(s.supabase, id, "ready", "listed");
    const soldIso = new Date(`${soldAt}T12:00:00-05:00`).toISOString();
    const { error } = await s.supabase
      .from("devices")
      .update({ status: "sold", sold_at: soldIso, sale_channel: channel, recipient_category: recipient ?? "undisclosed", pif_subsidy_cents: subsidyCents })
      .eq("id", id);
    if (error) throw error;
    await s.supabase.from("device_events").insert({ device_id: id, actor_id: s.user.id, event_type: "sale", note: `Sold ${channel.replace("_", " ")}`, metadata: { recipient_category: recipient } });
    if (subsidyCents > 0) {
      const { error: fe } = await s.supabase.from("fund_transactions").insert({ type: "subsidy", amount_cents: -subsidyCents, device_id: id, provider: "manual", note: "Subsidy applied at sale" });
      if (fe) throw fe;
      await s.supabase.from("device_events").insert({ device_id: id, actor_id: s.user.id, event_type: "subsidy", note: "Pay-It-Forward subsidy applied", metadata: { amount_cents: subsidyCents } });
    }
    refresh("/staff");
    return ok(null, "Sale recorded. The passport now shows its new home.");
  });
}

export async function addNote(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ id: uuid, note: z.string().trim().min(2).max(500) }), input, async ({ id, note }) => {
    const s = await staff();
    const { error } = await s.supabase.from("device_events").insert({ device_id: id, actor_id: s.user.id, event_type: "note", note });
    if (error) throw error;
    refresh("/staff");
    return ok(null, "Note added to the timeline.");
  });
}

const householdSchema = z.object({
  category: z.enum(DEVICE_CATEGORIES),
  make: z.string().trim().min(1, "Enter the make.").max(60),
  model: z.string().trim().min(1, "Enter the model.").max(80),
  approxYear: z.number().int().min(1990).max(2100).nullable(),
  serial: z.string().trim().max(80).optional(),
  quantity: z.number().int().min(1).max(50),
});

/** OPS-13: household (non-partner) intake. */
export async function addHouseholdDevices(input: unknown): Promise<ActionResult<{ added: number }>> {
  return runAction(householdSchema, input, async (d) => {
    const s = await staff();
    const codes = generateUniqueCodes(d.quantity);
    const { error } = await s.supabase.from("devices").insert(
      codes.map((c) => ({ passport_code: c, source: "household" as const, category: d.category, make: d.make, model: d.model, approx_year: d.approxYear, serial_number: d.quantity === 1 ? d.serial || null : null })),
    );
    if (error) throw error;
    refresh("/staff");
    return ok({ added: d.quantity }, `${d.quantity} household device${d.quantity === 1 ? "" : "s"} added.`);
  });
}

// ---------------------------------------------------------------- partners (OPS-10)

export async function changeTier(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ orgId: uuid, tier: z.enum(PARTNER_TIERS) }), input, async ({ orgId, tier }) => {
    const s = await staff();
    const now = new Date();
    const expires = new Date(now);
    expires.setFullYear(expires.getFullYear() + 1);
    const { error } = await s.supabase
      .from("organizations")
      .update({ tier, membership_started_at: tier === "community" ? null : now.toISOString(), membership_expires_at: tier === "community" ? null : expires.toISOString() })
      .eq("id", orgId);
    if (error) throw error;
    refresh("/staff");
    return ok(null, "Tier updated.");
  });
}

// ---------------------------------------------------------------- settings (OPS-12)

const settingsSchema = z.object({
  weeklyCapacity: z.number().int().min(1).max(1000),
  refurbUniform: z.number().int().min(1).max(1000),
  refurbMixed: z.number().int().min(1).max(1000),
  maxAgeYears: z.number().int().min(1).max(30),
  weights: z.object({ uniformity: z.number().min(0).max(1), youth: z.number().min(0).max(1), volume: z.number().min(0).max(1), laptopShare: z.number().min(0).max(1) }),
  breakdown: z.array(z.object({ label: z.string().trim().min(1).max(60), percent: z.number().min(0).max(100), description: z.string().trim().max(160).optional() })).min(1).max(8),
  breakdownConfirmed: z.boolean(),
  acceptedItems: z
    .array(
      z.object({
        category: z.enum(DEVICE_CATEGORIES),
        label: z.string().trim().min(1).max(80),
        decision: z.enum(["accepted", "recycling_only", "not_accepted"]),
        maxAgeYears: z.number().int().min(1).max(50).nullable(),
        requiresWorking: z.boolean(),
        note: z.string().trim().max(300),
      }),
    )
    .max(12),
  factors: z.array(
    z.object({
      category: z.enum(DEVICE_CATEGORIES),
      avgWeightKg: z.number().min(0).max(200),
      co2e: z.number().min(0).max(5000),
      sourceTitle: z.string().trim().min(1).max(200),
      sourceUrl: z.string().trim().max(400).optional(),
      lastReviewed: z.string().optional(),
    }),
  ),
});

export async function saveSettings(input: unknown): Promise<ActionResult<null>> {
  return runAction(settingsSchema, input, async (d) => {
    const s = await staff();
    const bErr = validateBreakdown(d.breakdown);
    if (bErr) return fail(bErr, { breakdown: bErr });
    const wSum = d.weights.uniformity + d.weights.youth + d.weights.volume + d.weights.laptopShare;
    if (Math.abs(wSum - 1) > 0.001) return fail(`Score weights must add up to 1 (now ${wSum.toFixed(2)}).`);
    const { error } = await s.supabase
      .from("settings")
      .update({
        weekly_capacity_devices: d.weeklyCapacity,
        refurb_minutes_uniform: d.refurbUniform,
        refurb_minutes_mixed: d.refurbMixed,
        max_device_age_years: d.maxAgeYears,
        batch_score_weights: d.weights,
        price_breakdown: d.breakdown,
        price_breakdown_confirmed: d.breakdownConfirmed,
        accepted_items: d.acceptedItems,
      })
      .eq("id", 1);
    if (error) throw error;
    for (const f of d.factors) {
      const { error: fe } = await s.supabase
        .from("impact_factors")
        .update({ avg_weight_kg: f.avgWeightKg, co2e_avoided_kg_per_reuse: f.co2e, source_title: f.sourceTitle, source_url: f.sourceUrl || null, last_reviewed: f.lastReviewed || null })
        .eq("category", f.category);
      if (fe) throw fe;
    }
    revalidatePath("/", "layout");
    return ok(null, "Settings saved. Every page now uses the new values.");
  });
}
