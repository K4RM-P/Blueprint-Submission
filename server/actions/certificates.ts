"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { fail, ok, runAction, type ActionResult } from "@/lib/action";
import { nextCertificateNumber } from "@/lib/certificate-number";
import { batchCanIssueCertificate } from "@/lib/status-machine";
import { buildCertificateData, certificatePath } from "@/lib/pdf/certificate-data";
import { renderCertificatePdf } from "@/lib/pdf/certificate";
import { env } from "@/lib/env";

/** OPS-08 / CI-01: number, render, store in the private bucket, record — then the batch may auto-complete. */
export async function issueCertificate(input: unknown): Promise<ActionResult<{ number: string }>> {
  return runAction(z.object({ batchId: z.uuid() }), input, async ({ batchId }) => {
    const s = await assertRole("staff");
    const { data: batch } = await s.supabase.from("donation_batches").select("id, organization_id, certificates(id)").eq("id", batchId).single();
    if (!batch) return fail("Batch not found.");
    if (batch.certificates) return fail("This batch already has a certificate.");
    const { data: devices } = await s.supabase.from("devices").select("status").eq("batch_id", batchId);
    if (!batchCanIssueCertificate((devices ?? []).map((d) => d.status))) return fail("Every device must be wipe-verified (or later) or recycled first.");

    const year = new Date().getFullYear();
    const { data: existing } = await s.supabase.from("certificates").select("certificate_number").like("certificate_number", `GL-${year}-%`);
    const number = nextCertificateNumber(year, (existing ?? []).map((c) => c.certificate_number));
    const issuedAt = new Date().toISOString();
    const data = await buildCertificateData(s.supabase, { batchId, number, issuedAt, issuedBy: `${s.profile.full_name ?? "Staff"}, Free Geek Toronto`, siteUrl: env.publicSiteUrl });
    const pdf = await renderCertificatePdf(data);
    const path = certificatePath(batch.organization_id, number);
    const { error: upErr } = await s.supabase.storage.from("certificates").upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;
    const { error } = await s.supabase.from("certificates").insert({ certificate_number: number, batch_id: batchId, organization_id: batch.organization_id, issued_by: s.user.id, issued_at: issuedAt, device_count: data.devices.length, pdf_path: path });
    if (error) throw error;
    revalidatePath("/staff", "layout");
    revalidatePath("/partner", "layout");
    return ok({ number }, `Certificate ${number} issued. The partner can download it now.`);
  });
}
