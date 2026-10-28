/**
 * Is the Reuse Partnership working? The PRD §3.3 success metrics, computed from
 * devices and batches. Pure: the staff overview passes rows in, nothing is fetched here.
 * Targets are the PRD's year-one placeholders and are [ASSUMPTION]s until FGT confirms them.
 */

export interface ProgramDevice {
  source: "partner" | "household";
  category: string;
  receivedAt: string;
  /** When the device finished refurbishing (became ready), if it has. */
  readyAt: string | null;
  soldAt: string | null;
  priceCents: number | null;
  passportViews: number;
}

export interface ProgramBatch {
  organizationId: string;
  status: string;
}

export interface ProgramMetrics {
  windowDays: number;
  /** Partner-donated laptops received per 30 days, averaged over the window. */
  partnerLaptopsPerMonth: number;
  /** Share of all devices received in the window that came from Reuse Partners (0..1, null if none received). */
  partnerShare: number | null;
  /** Median days from intake to ready, by source (null when nothing has finished yet). */
  medianDaysToReady: { partner: number | null; household: number | null };
  /** How much faster partner devices reach "ready" than household ones (0.4 = 40% faster), null if either is unknown. */
  partnerSpeedup: number | null;
  /** Partners that came back with a second batch, out of all partners with a batch. */
  repeatPartners: { repeat: number; total: number };
  /** Partner-donated devices sold in the window and what they brought in. */
  partnerSales: { count: number; cents: number };
  /** Passport views per sold device, all time (null if nothing is sold). */
  passportViewsPerSold: number | null;
}

export const PROGRAM_TARGETS = {
  partnerLaptopsPerMonth: 21, // 250 a year
  partnerSpeedup: 0.4,
  repeatPartnerShare: 0.7,
  passportViewsPerSold: 0.5,
} as const;

const DAY = 86_400_000;

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function programMetrics(devices: ProgramDevice[], batches: ProgramBatch[], now: Date, windowDays = 90): ProgramMetrics {
  const since = now.getTime() - windowDays * DAY;
  const inWindow = (iso: string | null) => iso != null && new Date(iso).getTime() >= since && new Date(iso).getTime() <= now.getTime();

  const received = devices.filter((d) => inWindow(d.receivedAt));
  const partnerLaptops = received.filter((d) => d.source === "partner" && d.category === "laptop").length;
  const partnerReceived = received.filter((d) => d.source === "partner").length;

  const daysToReady = (source: ProgramDevice["source"]) =>
    median(devices.filter((d) => d.source === source && d.readyAt).map((d) => (new Date(d.readyAt as string).getTime() - new Date(d.receivedAt).getTime()) / DAY));
  const partner = daysToReady("partner");
  const household = daysToReady("household");

  const batchesByOrg = new Map<string, number>();
  for (const b of batches) {
    if (b.status === "declined") continue;
    batchesByOrg.set(b.organizationId, (batchesByOrg.get(b.organizationId) ?? 0) + 1);
  }

  const partnerSold = devices.filter((d) => d.source === "partner" && inWindow(d.soldAt));
  const sold = devices.filter((d) => d.soldAt != null);

  return {
    windowDays,
    partnerLaptopsPerMonth: Math.round((partnerLaptops / windowDays) * 30 * 10) / 10,
    partnerShare: received.length ? partnerReceived / received.length : null,
    medianDaysToReady: { partner, household },
    partnerSpeedup: partner != null && household != null && household > 0 ? 1 - partner / household : null,
    repeatPartners: { repeat: [...batchesByOrg.values()].filter((n) => n >= 2).length, total: batchesByOrg.size },
    partnerSales: { count: partnerSold.length, cents: partnerSold.reduce((s, d) => s + (d.priceCents ?? 0), 0) },
    passportViewsPerSold: sold.length ? devices.reduce((s, d) => s + d.passportViews, 0) / sold.length : null,
  };
}
