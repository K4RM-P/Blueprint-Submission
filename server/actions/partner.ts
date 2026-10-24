"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { ActionError, fail, ok, runAction, type ActionResult } from "@/lib/action";
import { batchSchema, idSchema, type BatchInput } from "@/lib/validation/batch";
import { colleagueSchema, LOGO_MAX_BYTES, LOGO_TYPES, organizationSchema } from "@/lib/validation/organization";
import { computeBatchScore } from "@/lib/batch-score";
import { canRequestPickup } from "@/lib/pricing";
import { getCalendar, getSettings } from "@/lib/queries/common";
import type { PartnerTier } from "@/lib/domain";

async function partnerOrg() {
  const s = await assertRole("partner");
  if (!s.profile.organization_id) throw new ActionError("Finish your organization profile first.");
  const { data: org } = await s.supabase.from("organizations").select("id, tier").eq("id", s.profile.organization_id).single();
  if (!org) throw new ActionError("We couldn't find your organization.");
  return { ...s, org };
}

/** Server-side checks shared by create and edit (PP-03, PP-04): tier, capacity, score. */
async function prepareBatch(s: Awaited<ReturnType<typeof partnerOrg>>, input: BatchInput, editingWeek?: { week: string; devices: number }) {
  if (input.logistics === "pickup" && !canRequestPickup(s.org.tier as PartnerTier)) {
    throw new ActionError("Pickup is included with Impact and Champion memberships. Choose drop-off, or upgrade your membership.");
  }
  const settings = await getSettings(s.supabase);
  const calendar = await getCalendar(s.supabase, settings.weeklyCapacity);
  const week = calendar.find((w) => w.week === input.preferredWeek);
  if (!week) throw new ActionError("Choose one of the next 8 weeks.");
  // When editing an approved-but-not-yet-scheduled batch our own devices are already counted; submitted batches are not.
  const ownLoad = editingWeek && editingWeek.week === week.week ? editingWeek.devices : 0;
  if (week.load - ownLoad > week.capacity) {
    const next = calendar.find((w) => w.status !== "full");
    throw new ActionError(`That week's bench is full${next ? ` — the next open week is ${next.label}` : ""}.`);
  }
  const score = computeBatchScore(
    input.lineItems.map((l) => ({ category: l.category, make: l.make, model: l.model, approxYear: l.approxYear, quantity: l.quantity })),
    { weights: settings.weights, maxAgeYears: settings.maxAgeYears },
  );
  return score.score;
}

function lineRows(batchId: string, input: BatchInput) {
  return input.lineItems.map((l) => ({
    batch_id: batchId,
    category: l.category,
    make: l.make,
    model: l.model,
    approx_year: l.approxYear,
    quantity: l.quantity,
    condition: l.condition,
  }));
}

/** PP-03: submit a new batch. The score is always recomputed here, never trusted from the client. */
export async function submitBatch(input: unknown): Promise<ActionResult<{ id: string; score: number }>> {
  return runAction(batchSchema, input, async (data) => {
    const s = await partnerOrg();
    const score = await prepareBatch(s, data);
    const { data: batch, error } = await s.supabase
      .from("donation_batches")
      .insert({
        organization_id: s.org.id,
        submitted_by: s.user.id,
        status: "submitted",
        logistics: data.logistics,
        preferred_week: data.preferredWeek,
        pickup_address: data.logistics === "pickup" ? data.pickupAddress || null : null,
        notes: data.notes || null,
        data_handling_ack: true,
        value_score: score,
      })
      .select("id")
      .single();
    if (error || !batch) throw error ?? new ActionError("We couldn't save your batch.");
    const { error: liError } = await s.supabase.from("batch_line_items").insert(lineRows(batch.id, data));
    if (liError) {
      await s.supabase.from("donation_batches").delete().eq("id", batch.id);
      throw liError;
    }
    revalidatePath("/partner", "layout");
    return ok({ id: batch.id, score }, "Batch sent. We'll confirm your drop-off week within 2 business days.");
  });
}

const updateSchema = z.object({ id: z.uuid(), batch: batchSchema });

/** Edit is allowed only while the batch is `submitted` (RLS enforces this too). */
export async function updateBatch(input: unknown): Promise<ActionResult<{ id: string; score: number }>> {
  return runAction(updateSchema, input, async ({ id, batch: data }) => {
    const s = await partnerOrg();
    const { data: existing } = await s.supabase.from("donation_batches").select("id, status").eq("id", id).maybeSingle();
    if (!existing) return fail("We couldn't find that batch.");
    if (existing.status !== "submitted") return fail("This batch has already been reviewed, so it can't be edited. Contact Free Geek Toronto to make changes.");
    const score = await prepareBatch(s, data);
    const { error } = await s.supabase
      .from("donation_batches")
      .update({
        logistics: data.logistics,
        preferred_week: data.preferredWeek,
        pickup_address: data.logistics === "pickup" ? data.pickupAddress || null : null,
        notes: data.notes || null,
        value_score: score,
      })
      .eq("id", id);
    if (error) throw error;
    const { error: delErr } = await s.supabase.from("batch_line_items").delete().eq("batch_id", id);
    if (delErr) throw delErr;
    const { error: liErr } = await s.supabase.from("batch_line_items").insert(lineRows(id, data));
    if (liErr) throw liErr;
    revalidatePath("/partner", "layout");
    return ok({ id, score }, "Batch updated.");
  });
}

export async function withdrawBatch(input: unknown): Promise<ActionResult<null>> {
  return runAction(idSchema, input, async ({ id }) => {
    const s = await partnerOrg();
    const { data: existing } = await s.supabase.from("donation_batches").select("status").eq("id", id).maybeSingle();
    if (!existing) return fail("We couldn't find that batch.");
    if (existing.status !== "submitted") return fail("Only batches that haven't been reviewed yet can be withdrawn.");
    const { error } = await s.supabase.from("donation_batches").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/partner", "layout");
    return ok(null, "Batch withdrawn.");
  });
}

/** PP-02 / PP-13: organization profile and recognition opt-ins. */
export async function saveOrganization(input: unknown): Promise<ActionResult<null>> {
  return runAction(organizationSchema, input, async (d) => {
    const s = await partnerOrg();
    const { error } = await s.supabase
      .from("organizations")
      .update({
        name: d.name,
        industry: d.industry || null,
        employee_range: d.employeeRange || null,
        website: d.website || null,
        contact_email: d.contactEmail || null,
        contact_phone: d.contactPhone || null,
        wall_opt_in: d.wallOptIn,
        passport_attribution_opt_in: d.passportAttributionOptIn,
      })
      .eq("id", s.org.id);
    if (error) throw error;
    revalidatePath("/partner", "layout");
    revalidatePath("/partners");
    return ok(null, "Profile saved.");
  });
}

const logoSchema = z.instanceof(FormData);

/** PP-02: logo upload to the public `logos` bucket, inside the org's own folder (storage RLS). */
export async function uploadLogo(formData: FormData): Promise<ActionResult<{ path: string }>> {
  return runAction(logoSchema, formData, async (fd) => {
    const s = await partnerOrg();
    const file = fd.get("logo");
    if (!(file instanceof File) || file.size === 0) return fail("Choose an image file.");
    if (!LOGO_TYPES.includes(file.type as (typeof LOGO_TYPES)[number])) return fail("Use a PNG, JPG, WebP or SVG image.");
    if (file.size > LOGO_MAX_BYTES) return fail("Logos must be under 1 MB.");
    const ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg" }[file.type as (typeof LOGO_TYPES)[number]];
    const path = `${s.org.id}/logo-${Date.now()}.${ext}`;
    const { error } = await s.supabase.storage.from("logos").upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    const { error: upErr } = await s.supabase.from("organizations").update({ logo_path: path }).eq("id", s.org.id);
    if (upErr) throw upErr;
    revalidatePath("/partner", "layout");
    return ok({ path }, "Logo updated.");
  });
}

/** PP-13: invite a colleague into the organization (they sign up at /login?mode=signup&invite=1). */
export async function inviteColleague(input: unknown): Promise<ActionResult<{ link: string }>> {
  return runAction(colleagueSchema, input, async ({ fullName, email }) => {
    const s = await partnerOrg();
    const { error } = await s.supabase.from("account_invites").insert({ email, full_name: fullName, role: "partner", organization_id: s.org.id, created_by: s.user.id });
    if (error) return fail(/duplicate/i.test(error.message) ? "That email already has an invite." : "We couldn't create the invite.");
    revalidatePath("/partner/settings");
    return ok({ link: `/login?mode=signup&invite=1&email=${encodeURIComponent(email)}` }, `Invite created for ${fullName}.`);
  });
}
