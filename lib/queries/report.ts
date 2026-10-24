import "server-only";
import { computeImpact, monthlySeries } from "@/lib/impact";
import { inPeriod, monthLabel, reportPeriod, topRecipients } from "@/lib/report";
import { labels, type PartnerTier } from "@/lib/domain";
import { longDate } from "@/lib/dates";
import { env } from "@/lib/env";
import { getFactors, getSettings, logoUrl, type DB } from "./common";
import { toImpactRows } from "./impact";
import { batchQuantity, batchTitle, listBatches } from "./partner";
import type { ReportData } from "@/lib/pdf/report";

interface Org {
  id: string;
  name: string;
  tier: PartnerTier;
  logo_path: string | null;
}

/** Trailing-12-month impact for the signed-in partner's org (RLS scopes every query). */
export async function getAnnualImpact(db: DB, org: Org, today = new Date()) {
  const period = reportPeriod(today);
  const [{ data: devices }, factors, settings, batches] = await Promise.all([db.rpc("partner_devices", {}), getFactors(db), getSettings(db), listBatches(db, org.id)]);
  const inYear = (devices ?? []).filter((d) => inPeriod(d.received_at ?? d.created_at, period));
  const totals = computeImpact(toImpactRows(inYear), factors, settings.refurbMinutes);
  return { period, devices: inYear, totals, factors, settings, batches: batches.filter((b) => inPeriod(b.created_at, period)) };
}

/** PNG/JPEG logos only — @react-pdf can't draw SVG or WebP. Never fails the report. */
async function logoDataUrl(path: string | null): Promise<string | null> {
  const url = logoUrl(path);
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/image\/(png|jpe?g)/.test(type)) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

export async function buildReportData(db: DB, org: Org, today = new Date()): Promise<ReportData> {
  const a = await getAnnualImpact(db, org, today);
  return {
    orgName: org.name,
    tierLabel: labels.tier[org.tier],
    logoDataUrl: await logoDataUrl(org.logo_path),
    periodLabel: a.period.label,
    generatedAt: longDate(today),
    totals: a.totals,
    monthly: monthlySeries(
      a.devices.map((d) => ({ receivedAt: d.received_at ?? d.created_at, soldAt: d.sold_at })),
      a.period.months,
    ).map((m) => ({ label: monthLabel(m.month), received: m.received, reused: m.reused })),
    recipients: topRecipients(a.totals).map((r) => ({ label: r.label, count: r.count })),
    batches: a.batches.map((b) => ({
      date: longDate(b.created_at),
      title: batchTitle(b),
      devices: batchQuantity(b),
      status: labels.batchStatus[b.status],
      certificate: b.certificates?.certificate_number ?? null,
    })),
    factors: a.factors.map((f) => ({ label: labels.category[f.category], avgWeightKg: f.avgWeightKg, co2eKg: f.co2eAvoidedKgPerReuse, source: f.sourceTitle ?? "TO VERIFY" })),
    refurbMinutes: a.settings.refurbMinutes,
    siteUrl: env.siteUrl,
  };
}
