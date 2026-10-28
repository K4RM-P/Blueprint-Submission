import QRCode from "qrcode";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { labels } from "@/lib/domain";
import type { CertificateData } from "./certificate";

/**
 * Collect everything CI-01 requires for a batch. Needs a client allowed to
 * read devices (staff session, or the service role in the seed).
 */
export async function buildCertificateData(
  db: SupabaseClient<Database>,
  opts: { batchId: string; number: string; issuedAt: string; issuedBy: string; siteUrl: string },
): Promise<CertificateData> {
  const { data: batch, error } = await db.from("donation_batches").select("id, received_at, organizations(name)").eq("id", opts.batchId).single();
  if (error || !batch) throw new Error("Batch not found for certificate");
  const { data: staffView } = await db
    .from("devices")
    .select("category, make, model, serial_number, wipe_method, wipe_verified_at, status")
    .eq("batch_id", opts.batchId)
    .order("passport_code");
  // Partners can't select devices directly; partner_devices() is their RLS-safe view (no report IDs).
  const devices = staffView?.length ? staffView : ((await db.rpc("partner_devices", { p_batch: opts.batchId })).data ?? []);
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
    devices: (devices ?? []).map((d) => ({
      category: labels.category[d.category],
      makeModel: `${d.make} ${d.model}`,
      serial: d.serial_number,
      method: d.wipe_method,
      verifiedAt: d.wipe_verified_at,
      // Every device on a certificate is wiped and verified (or recycled): the rest are headed for reuse (CI-01).
      outcome: d.status === "recycled" ? "Recycled" : d.status === "sold" ? "Reused" : "For reuse",
    })),
  };
}

export function certificatePath(orgId: string, number: string) {
  return `${orgId}/${number}.pdf`;
}
