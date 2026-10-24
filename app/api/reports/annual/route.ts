import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { hasFullDashboard } from "@/lib/pricing";
import { buildReportData } from "@/lib/queries/report";
import { renderReportPdf } from "@/lib/pdf/report";
import type { PartnerTier } from "@/lib/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PP-10: the signed-in partner's annual impact report as a PDF (Impact and Champion tiers). */
export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent("/partner/report")}`, req.url));
  if (s.profile.role !== "partner" || !s.profile.organization_id) return NextResponse.json({ error: "Only partners can download impact reports." }, { status: 403 });
  const { data: org } = await s.supabase.from("organizations").select("id, name, slug, tier, logo_path").eq("id", s.profile.organization_id).single();
  if (!org) return NextResponse.json({ error: "Organization not found." }, { status: 404 });
  if (!hasFullDashboard(org.tier as PartnerTier)) return NextResponse.json({ error: "The annual impact report comes with Impact and Champion memberships." }, { status: 403 });

  const pdf = await renderReportPdf(await buildReportData(s.supabase, { ...org, tier: org.tier as PartnerTier }));
  const year = new Date().getFullYear();
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${org.slug}-impact-report-${year}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
