import "server-only";
import type { DB } from "./common";

export const DEVICE_LIST_COLUMNS =
  "id, passport_code, category, make, model, status, serial_number, source, batch_id, assigned_volunteer_id, price_cents, created_at, updated_at, wipe_report_ref, donation_batches(organizations(name))";

export async function listVolunteers(db: DB) {
  const { data } = await db.from("profiles").select("id, full_name, display_first_name").eq("role", "volunteer").order("full_name");
  return data ?? [];
}

export function money(cents: number | null | undefined) {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: cents % 100 === 0 ? 0 : 2 });
}

export function monthStart(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}
