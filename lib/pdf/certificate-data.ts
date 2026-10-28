import QRCode from "qrcode";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { labels, type DeviceCategory, type DeviceStatus } from "@/lib/domain";
import { certificateWording } from "@/lib/certificate-wording";
import type { CertificateData } from "./certificate";

interface CertRow {
  category: DeviceCategory;
  make: string;
  model: string;
  serial_number: string | null;
  status: DeviceStatus;
  wipe_method: string | null;
  wipe_report_ref?: string | null;
  wipe_verified_at: string | null;
  verified_by?: string | null;
}

/**
 * Collect everything CI-01 requires for a batch: per device, the method, the
 * report/reference ID from FGT's sanitization software, the verification date and
 * the verifying staff member. certificate_devices() serves staff and the owning
 * partner once a certificate exists; older databases fall back to the staff table
 * read or partner_devices() (no reference IDs).
 */
export async function buildCertificateData(
  db: SupabaseClient<Database>,
  opts: { batchId: string; number: string; issuedAt: string; issuedBy: string; siteUrl: string },
): Promise<CertificateData> {
  const { data: batch, error } = await db.from("donation_batches").select("id, received_at, organizations(name)").eq("id", opts.batchId).single();
  if (error || !batch) throw new Error("Batch not found for certificate");

  let devices: CertRow[] = [];
  const rpc = await db.rpc("certificate_devices", { p_batch: opts.batchId });
  if (!rpc.error && rpc.data?.length) devices = rpc.data;
  else {
    const { data: staffView } = await db
      .from("devices")
      .select("category, make, model, serial_number, wipe_method, wipe_report_ref, wipe_verified_at, status, verifier:profiles!devices_wipe_verified_by_fkey(full_name)")
      .eq("batch_id", opts.batchId)
      .order("passport_code");
    if (staffView?.length) devices = staffView.map((d) => ({ ...d, verified_by: d.verifier?.full_name ?? null }));
    // Partners can't select devices directly; partner_devices() is their RLS-safe view (no report IDs).
    else devices = ((await db.rpc("partner_devices", { p_batch: opts.batchId })).data ?? []) as CertRow[];
  }
  const { data: settings } = await db.rpc("public_settings");
  const verifyUrl = `${opts.siteUrl}/verify/${opts.number}`;
  return {
    number: opts.number,
    partnerName: batch.organizations?.name ?? "Partner",
    batchId: batch.id,
    receivedAt: batch.received_at,
    issuedAt: opts.issuedAt,
    issuedBy: opts.issuedBy,
    verifyUrl,
    qrDataUrl: await QRCode.toDataURL(verifyUrl, { margin: 0, width: 240 }),
    wording: certificateWording(settings as Parameters<typeof certificateWording>[0]),
    devices: devices.map((d) => ({
      category: labels.category[d.category],
      makeModel: `${d.make} ${d.model}`,
      serial: d.serial_number,
      method: d.wipe_method,
      reference: d.wipe_report_ref ?? null,
      verifiedAt: d.wipe_verified_at,
      verifiedBy: d.verified_by ?? null,
      outcome: d.status === "recycled" ? "Recycled" : d.status === "sold" ? "Reused" : "In refurbishment",
    })),
  };
}

export function certificatePath(orgId: string, number: string) {
  return `${orgId}/${number}.pdf`;
}
