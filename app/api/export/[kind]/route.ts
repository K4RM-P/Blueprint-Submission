import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const kind = z.enum(["devices", "batches"]);

function csv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    // Guard against CSV formula injection in spreadsheet apps.
    const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

/** OPS-14: CSV export for funder/grant reporting. Staff only (RLS + role check). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const parsed = kind.safeParse((await params).kind);
  if (!parsed.success) return NextResponse.json({ error: "Unknown export" }, { status: 404 });
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const uid = claims?.claims?.sub;
  const { data: me } = uid ? await supabase.from("profiles").select("role").eq("id", uid).maybeSingle() : { data: null };
  if (me?.role !== "staff") return NextResponse.json({ error: "Staff only" }, { status: 403 });

  let rows: Record<string, unknown>[] = [];
  if (parsed.data === "devices") {
    const { data } = await supabase
      .from("devices")
      .select("passport_code, source, category, make, model, approx_year, status, created_at, wipe_verified_at, refurbished_at, sold_at, sale_channel, recipient_category, price_cents, pif_subsidy_cents, recycled_reason, donation_batches(organizations(name))")
      .order("created_at");
    rows = (data ?? []).map(({ donation_batches, ...d }) => ({ ...d, partner: donation_batches?.organizations?.name ?? "" }));
  } else {
    const { data } = await supabase
      .from("donation_batches")
      .select("id, status, value_score, logistics, preferred_week, scheduled_week, created_at, received_at, completed_at, organizations(name, tier), batch_line_items(quantity)")
      .order("created_at");
    rows = (data ?? []).map(({ organizations, batch_line_items, ...b }) => ({
      ...b,
      partner: organizations?.name ?? "",
      tier: organizations?.tier ?? "",
      devices: batch_line_items.reduce((s, l) => s + l.quantity, 0),
    }));
  }
  return new NextResponse(csv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="relay-${parsed.data}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
