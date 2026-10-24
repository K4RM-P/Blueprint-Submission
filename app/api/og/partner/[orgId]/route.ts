import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { hasFullDashboard } from "@/lib/pricing";
import { getAnnualImpact } from "@/lib/queries/report";
import { renderImpactCard } from "@/lib/og/impact-card";
import { labels, type PartnerTier } from "@/lib/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PP-11: LinkedIn impact card (1200×627). Only the organization's own partners can
 * render it — numbers come from the partner's RLS-scoped data via lib/impact.
 */
export async function GET(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const parsed = z.uuid().safeParse((await params).orgId);
  if (!parsed.success) return NextResponse.json({ error: "Invalid organization" }, { status: 400 });
  const s = await getSession();
  if (!s || s.profile.role !== "partner" || s.profile.organization_id !== parsed.data) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const { data: org } = await s.supabase.from("organizations").select("id, name, tier, logo_path").eq("id", parsed.data).single();
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  if (!hasFullDashboard(org.tier as PartnerTier)) return NextResponse.json({ error: "The LinkedIn card comes with Impact and Champion memberships." }, { status: 403 });

  const { totals: t, period } = await getAnnualImpact(s.supabase, { ...org, tier: org.tier as PartnerTier });
  const download = new URL(req.url).searchParams.has("download");
  const image = renderImpactCard({ orgName: org.name, tierLabel: labels.tier[org.tier as PartnerTier], periodLabel: period.label, totals: t });
  image.headers.set("Cache-Control", "private, no-store");
  if (download) image.headers.set("Content-Disposition", `attachment; filename="relay-impact-card.png"`);
  return image;
}
