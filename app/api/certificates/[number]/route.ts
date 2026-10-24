import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { buildCertificateData, certificatePath } from "@/lib/pdf/certificate-data";
import { renderCertificatePdf } from "@/lib/pdf/certificate";
import { env } from "@/lib/env";

const numberSchema = z.string().regex(/^GL-\d{4}-\d{4,}$/);

/** PP-08: owning partner (or staff) downloads via a short-lived signed URL. RLS decides who can see the row and the file. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const parsed = numberSchema.safeParse((await params).number);
  if (!parsed.success) return NextResponse.json({ error: "Invalid certificate number" }, { status: 400 });
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(req.nextUrl.pathname)}`, req.url));

  const { data: cert } = await supabase.from("certificates").select("certificate_number, batch_id, organization_id, issued_at, pdf_path, profiles:issued_by(full_name)").eq("certificate_number", parsed.data).maybeSingle();
  if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

  let path = cert.pdf_path;
  if (!path) {
    // Seeded/older certificates: render from the chain of custody. Staff store it; partners get it streamed.
    const data = await buildCertificateData(supabase, { batchId: cert.batch_id, number: cert.certificate_number, issuedAt: cert.issued_at, issuedBy: cert.profiles?.full_name ? `${cert.profiles.full_name}, Free Geek Toronto` : "Free Geek Toronto staff", siteUrl: env.siteUrl });
    const pdf = await renderCertificatePdf(data);
    const { data: me } = await supabase.from("profiles").select("role").eq("id", claims.claims.sub).single();
    if (me?.role !== "staff") {
      return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${cert.certificate_number}.pdf"`, "Cache-Control": "private, no-store" } });
    }
    path = certificatePath(cert.organization_id, cert.certificate_number);
    await supabase.storage.from("certificates").upload(path, pdf, { contentType: "application/pdf", upsert: true });
    await supabase.from("certificates").update({ pdf_path: path }).eq("certificate_number", cert.certificate_number);
  }
  const { data: signed, error } = await supabase.storage.from("certificates").createSignedUrl(path, 60, { download: `${cert.certificate_number}.pdf` });
  if (error || !signed) return NextResponse.json({ error: "Couldn't open the certificate" }, { status: 500 });
  return NextResponse.redirect(signed.signedUrl);
}
