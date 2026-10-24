/**
 * Security checks (PRD §17) against the real Supabase project, signed in as each role.
 * Skipped automatically when .env.local is missing (e.g. CI without secrets).
 */
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/lib/database.types";

config({ path: ".env.local", quiet: true });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const password = process.env.DEMO_PASSWORD;
const enabled = Boolean(url && anonKey && password);

type Client = SupabaseClient<Database>;
const client = () => createClient<Database>(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });

async function signIn(email: string): Promise<Client> {
  const c = client();
  const { error } = await c.auth.signInWithPassword({ email, password: password! });
  if (error) throw error;
  return c;
}

describe.skipIf(!enabled)("RLS & database rules (PRD §12, §17)", () => {
  let anon: Client, partnerA: Client, partnerB: Client, volunteer: Client, staff: Client;

  beforeAll(async () => {
    anon = client();
    [partnerA, partnerB, volunteer, staff] = await Promise.all([
      signIn("demo-partner@geekloop.test"),
      signIn("demo-partner-2@geekloop.test"),
      signIn("demo-volunteer@geekloop.test"),
      signIn("demo-staff@geekloop.test"),
    ]);
  }, 30_000);

  it("anon cannot select from base tables", async () => {
    for (const t of ["organizations", "profiles", "donation_batches", "batch_line_items", "devices", "device_events", "certificates", "fund_transactions", "settings"] as const) {
      const { data } = await anon.from(t).select("*").limit(5);
      expect(data ?? [], t).toHaveLength(0);
    }
  });

  it("anon can use the public RPCs, which hide private fields", async () => {
    const { data: rows } = await staff.from("devices").select("passport_code, serial_number").eq("status", "sold").not("serial_number", "is", null).limit(1);
    const code = rows![0].passport_code;
    const { data: passport } = await anon.rpc("get_passport", { p_code: code });
    const json = JSON.stringify(passport);
    expect(json).toContain(code);
    expect(json).not.toContain(rows![0].serial_number!);
    expect(json).not.toMatch(/wipe_report_ref|BL-\d{6}|recipient|price_cents/);
    const { data: verify } = await anon.rpc("verify_certificate", { p_number: `GL-${new Date().getFullYear()}-0001` });
    expect(verify).toMatchObject({ partner_name: "Maple Ledger Accounting" });
  });

  it("partner A cannot read partner B's batches or devices", async () => {
    const { data: b } = await partnerB.from("donation_batches").select("id").limit(1);
    expect(b!.length).toBeGreaterThan(0);
    const { data: leak } = await partnerA.from("donation_batches").select("id").eq("id", b![0].id);
    expect(leak).toHaveLength(0);
    const { data: own } = await partnerA.from("donation_batches").select("organization_id");
    const orgs = new Set(own!.map((r) => r.organization_id));
    expect(orgs.size).toBe(1);
    const { data: direct } = await partnerA.from("devices").select("id").limit(1);
    expect(direct).toHaveLength(0);
    const { data: safe } = await partnerA.rpc("partner_devices", {});
    expect(safe!.length).toBeGreaterThan(0);
    expect(Object.keys(safe![0])).not.toContain("wipe_report_ref");
  });

  it("partners cannot change their tier or a batch's status", async () => {
    const { error } = await partnerA.from("organizations").update({ tier: "champion" }).not("id", "is", null);
    expect(error?.message).toMatch(/Membership/);
    const { data: submitted } = await partnerA.from("donation_batches").select("id").eq("status", "submitted").limit(1);
    const { error: e2 } = await partnerA.from("donation_batches").update({ status: "approved" }).eq("id", submitted![0].id);
    expect(e2?.message).toMatch(/Only staff/);
  });

  it("volunteer cannot set wipe_verified", async () => {
    const { data: pending } = await staff.from("devices").select("id").eq("status", "wipe_pending_verification").limit(1);
    const id = pending![0].id;
    const { data: updated } = await volunteer.from("devices").update({ status: "wipe_verified" }).eq("id", id).select("id");
    expect(updated ?? []).toHaveLength(0);
    const { error } = await volunteer.rpc("complete_step", { p_device: id, p_step: "wipe_verified" });
    expect(error).not.toBeNull();
    const { data: still } = await staff.from("devices").select("status").eq("id", id).single();
    expect(still!.status).toBe("wipe_pending_verification");
  });

  it("device events cannot be updated or deleted, even by staff", async () => {
    const { data: ev } = await staff.from("device_events").select("id, note").limit(1);
    const { error } = await staff.from("device_events").update({ note: "tampered" }).eq("id", ev![0].id);
    const { data: after } = await staff.from("device_events").select("note").eq("id", ev![0].id).single();
    expect(after!.note).toBe(ev![0].note);
    expect(error === null || /append-only/.test(error.message)).toBe(true);
    await staff.from("device_events").delete().eq("id", ev![0].id);
    const { data: exists } = await staff.from("device_events").select("id").eq("id", ev![0].id);
    expect(exists).toHaveLength(1);
  });

  it("staff cannot skip the device status machine", async () => {
    const { data: rec } = await staff.from("devices").select("id").eq("status", "received").limit(1);
    const { error } = await staff.from("devices").update({ status: "ready" }).eq("id", rec![0].id);
    expect(error?.message).toMatch(/can't go from received to ready/);
  });

  it("volunteers only read their own devices", async () => {
    const { data: me } = await volunteer.auth.getUser();
    const { data } = await volunteer.from("devices").select("assigned_volunteer_id");
    expect(data!.every((d) => d.assigned_volunteer_id === me.user!.id)).toBe(true);
  });
});
