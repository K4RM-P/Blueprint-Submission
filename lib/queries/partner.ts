import "server-only";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import type { DB } from "./common";

export async function getPartnerContext() {
  const s = await requireRole("partner");
  if (!s.profile.organization_id) redirect("/partner/settings?welcome=1");
  const { data: org } = await s.supabase.from("organizations").select("*").eq("id", s.profile.organization_id).single();
  if (!org) redirect("/partner/settings?welcome=1");
  return { ...s, org };
}

export type PartnerContext = Awaited<ReturnType<typeof getPartnerContext>>;

const BATCH_COLUMNS =
  "id, created_at, status, logistics, preferred_week, scheduled_week, value_score, notes, decline_reason, received_at, completed_at, approved_at, scheduled_at, declined_at, pickup_address, batch_line_items(id, category, make, model, approx_year, quantity, condition), certificates(id, certificate_number, issued_at, device_count, pdf_path)";

export async function listBatches(db: DB, orgId: string) {
  const { data, error } = await db.from("donation_batches").select(BATCH_COLUMNS).eq("organization_id", orgId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type PartnerBatch = Awaited<ReturnType<typeof listBatches>>[number];

export async function getBatch(db: DB, id: string) {
  const { data: batch } = await db.from("donation_batches").select(BATCH_COLUMNS).eq("id", id).maybeSingle();
  if (!batch) notFound();
  const { data: devices } = await db.rpc("partner_devices", { p_batch: id });
  return { batch, devices: devices ?? [] };
}

export type PartnerDevice = NonNullable<Awaited<ReturnType<typeof getBatch>>["devices"]>[number];

export function batchQuantity(b: { batch_line_items: { quantity: number }[] }): number {
  return b.batch_line_items.reduce((s, l) => s + l.quantity, 0);
}

export function batchTitle(b: { batch_line_items: { make: string; model: string; quantity: number }[] }): string {
  const items = [...b.batch_line_items].sort((a, z) => z.quantity - a.quantity);
  if (items.length === 0) return "Empty batch";
  const first = items[0];
  const more = items.length > 1 ? ` + ${items.length - 1} more` : "";
  return `${first.quantity} × ${first.make} ${first.model}${more}`;
}
