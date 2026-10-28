"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { fail, ok, runAction, type ActionResult } from "@/lib/action";
import { BADGES, newBadges, type VolunteerStats } from "@/lib/badges";
import { CHECKLIST_STEPS, DEFAULT_WIPE_METHOD } from "@/lib/domain";

export interface AwardedBadge {
  slug: string;
  name: string;
}

/** Idempotent badge award: evaluate in lib/badges.ts, insert what's new; RLS re-checks each criterion. */
async function awardNewBadges(s: Awaited<ReturnType<typeof assertRole>>): Promise<AwardedBadge[]> {
  const [{ data: stats }, { data: held }, { data: defs }] = await Promise.all([
    s.supabase.rpc("my_volunteer_stats"),
    s.supabase.from("volunteer_badges").select("badges(slug)").eq("volunteer_id", s.user.id),
    s.supabase.from("badges").select("id, slug, name"),
  ]);
  if (!stats) return [];
  const heldSlugs = (held ?? []).map((h) => h.badges?.slug).filter(Boolean) as string[];
  const slugs = newBadges(stats as unknown as VolunteerStats, heldSlugs, BADGES);
  const awarded: AwardedBadge[] = [];
  for (const slug of slugs) {
    const def = (defs ?? []).find((d) => d.slug === slug);
    if (!def) continue;
    const { error } = await s.supabase.from("volunteer_badges").insert({ volunteer_id: s.user.id, badge_id: def.id });
    if (!error) awarded.push({ slug, name: def.name });
  }
  return awarded;
}

/** VW-01: atomic claim of the highest-scoring device in the ready-for-refurb queue. */
export async function claimNextDevice(): Promise<ActionResult<{ id: string | null }>> {
  return runAction(z.undefined(), undefined, async () => {
    const s = await assertRole("volunteer");
    const { data, error } = await s.supabase.rpc("claim_next_device");
    if (error) throw error;
    revalidatePath("/volunteer", "layout");
    if (!data) return ok<{ id: string | null }>({ id: null }, "The queue is empty right now — nice work, everyone.");
    return ok({ id: data as string }, "Device claimed. It's on your bench.");
  });
}

const stepSchema = z.object({
  deviceId: z.uuid(),
  step: z.enum(CHECKLIST_STEPS),
  reportRef: z.string().trim().max(120).optional(),
  os: z.string().trim().max(80).optional(),
  openSource: z.boolean().optional(),
  note: z.string().trim().max(300).optional(),
});

/** VW-02 / VW-03: each step writes a device_events row; wipe → wipe_pending_verification for staff. */
export async function completeStep(input: unknown): Promise<ActionResult<{ status: string; badges: AwardedBadge[] }>> {
  return runAction(stepSchema, input, async (d) => {
    const s = await assertRole("volunteer");
    if (d.step === "wipe_performed" && !d.reportRef) return fail("Enter the sanitization report ID first.", { reportRef: "Enter the report ID from the wipe software." });
    if (d.step === "os_installed" && !d.os) return fail("Enter the operating system you installed.", { os: "Enter the OS." });
    const { data, error } = await s.supabase.rpc("complete_step", {
      p_device: d.deviceId,
      p_step: d.step,
      p_report_ref: d.reportRef ?? undefined,
      p_wipe_method: d.step === "wipe_performed" ? DEFAULT_WIPE_METHOD : undefined,
      p_os: d.os ?? undefined,
      p_open_source: d.openSource ?? true,
      p_note: d.note ?? undefined,
    });
    if (error) throw error;
    const badges = await awardNewBadges(s);
    revalidatePath("/volunteer", "layout");
    return ok({ status: (data as { status: string }).status, badges });
  });
}

/**
 * The failure branch of the hardware test (VW-02): a volunteer can't recycle a device, so they tell
 * staff why it didn't pass. It's a note in the device's append-only chain of custody (RLS: only for
 * devices assigned to them); staff see it on the Overview and decide whether to recycle.
 */
export async function flagForStaff(input: unknown): Promise<ActionResult<null>> {
  const schema = z.object({ deviceId: z.uuid(), note: z.string().trim().min(5, "Say what went wrong (a few words).").max(300) });
  return runAction(schema, input, async ({ deviceId, note }) => {
    const s = await assertRole("volunteer");
    const { error } = await s.supabase.from("device_events").insert({ device_id: deviceId, actor_id: s.user.id, event_type: "note", note: `Needs staff: ${note}`, metadata: { flag: "needs_staff" } });
    if (error) return fail("Only devices on your bench can be flagged.");
    revalidatePath("/volunteer", "layout");
    return ok(null, "Sent to staff. They'll decide whether it's repaired or recycled.");
  });
}

/** Called when the wallet opens: picks up badges earned through staff verification (Data Guardian). */
export async function syncBadges(): Promise<ActionResult<{ badges: AwardedBadge[] }>> {
  return runAction(z.undefined(), undefined, async () => {
    const s = await assertRole("volunteer");
    const badges = await awardNewBadges(s);
    if (badges.length) revalidatePath("/volunteer/wallet");
    return ok({ badges });
  });
}

const privacySchema = z.object({
  displayFirstName: z.string().trim().min(1, "Enter the first name to show.").max(40),
  attributionOptIn: z.boolean(),
  publicProfileOptIn: z.boolean(),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,32}$/, "3–32 lowercase letters, numbers or dashes.")
    .or(z.literal("")),
});

/** VW-07: opt-ins default off. */
export async function savePrivacy(input: unknown): Promise<ActionResult<null>> {
  return runAction(privacySchema, input, async (d) => {
    const s = await assertRole("volunteer");
    if (d.publicProfileOptIn && !d.handle) return fail("Choose a profile link name to turn on your public profile.", { handle: "Choose a link name." });
    const { error } = await s.supabase
      .from("profiles")
      .update({ display_first_name: d.displayFirstName, attribution_opt_in: d.attributionOptIn, public_profile_opt_in: d.publicProfileOptIn, public_handle: d.handle || null })
      .eq("id", s.user.id);
    if (error) return fail(/duplicate|unique/i.test(error.message) ? "That link name is taken. Try another." : "We couldn't save your settings.", /duplicate|unique/i.test(error.message) ? { handle: "Taken." } : undefined);
    revalidatePath("/volunteer", "layout");
    return ok(null, "Privacy settings saved.");
  });
}

// ---------------------------------------------------------------- staff: OPS-11 (P1)

export async function inviteVolunteer(input: unknown): Promise<ActionResult<{ link: string }>> {
  return runAction(z.object({ fullName: z.string().trim().min(2).max(80), email: z.email().trim().toLowerCase(), role: z.enum(["volunteer", "staff"]).default("volunteer") }), input, async ({ fullName, email, role }) => {
    const s = await assertRole("staff");
    const { error } = await s.supabase.from("account_invites").insert({ email, full_name: fullName, role, created_by: s.user.id });
    if (error) return fail(/duplicate/i.test(error.message) ? "That email already has an invite." : "We couldn't create the invite.");
    revalidatePath("/staff/volunteers");
    return ok({ link: `/login?mode=signup&invite=1&email=${encodeURIComponent(email)}` }, `Invite created for ${fullName}.`);
  });
}

export async function awardMentor(input: unknown): Promise<ActionResult<null>> {
  return runAction(z.object({ volunteerId: z.uuid() }), input, async ({ volunteerId }) => {
    const s = await assertRole("staff");
    const { data: badge } = await s.supabase.from("badges").select("id").eq("slug", "mentor").single();
    if (!badge) return fail("Mentor badge missing — run the seed.");
    const { error } = await s.supabase.from("volunteer_badges").insert({ volunteer_id: volunteerId, badge_id: badge.id, awarded_by: s.user.id });
    if (error) return fail(/duplicate/i.test(error.message) ? "They already have the Mentor badge." : "We couldn't award the badge.");
    revalidatePath("/staff/volunteers");
    return ok(null, "Mentor badge awarded.");
  });
}
