/** Annual impact report and LinkedIn card helpers (PP-10, PP-11). Pure. */
import type { ImpactTotals } from "./impact";
import { lastMonths } from "./impact";
import { labels, type RecipientCategory } from "./domain";

export interface ReportPeriod {
  /** Inclusive start (first day of the first month, UTC). */
  start: Date;
  /** Exclusive end (first day after the current month, UTC). */
  end: Date;
  /** YYYY-MM for each of the 12 months, oldest first. */
  months: string[];
  label: string;
}

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTH[m - 1]} ${y}`;
}

/** The trailing 12 calendar months including the current one. */
export function reportPeriod(today: Date): ReportPeriod {
  const months = lastMonths(today, 12);
  const [sy, sm] = months[0].split("-").map(Number);
  const start = new Date(Date.UTC(sy, sm - 1, 1));
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
  return { start, end, months, label: `${monthLabel(months[0])} – ${monthLabel(months[11])}` };
}

export function inPeriod(iso: string | null | undefined, p: ReportPeriod): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= p.start.getTime() && t < p.end.getTime();
}

/** Recipient categories, largest first, without "undisclosed". */
export function topRecipients(t: ImpactTotals): { category: RecipientCategory; label: string; count: number }[] {
  return (Object.entries(t.recipients) as [RecipientCategory, number][])
    .filter(([k, n]) => k !== "undisclosed" && n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, label: labels.recipient[category], count }));
}

const n = (x: number) => x.toLocaleString("en-CA");

/** "a", "a and b", "a, b and c". */
export function joinList(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : (items[0] ?? "");
}

/** Plural recipient labels, largest group first: "students, newcomers and seniors". */
export function recipientPhrase(t: ImpactTotals, max = 3): string {
  return joinList(
    topRecipients(t)
      .slice(0, max)
      .map((r) => `${r.label.toLowerCase()}${r.count === 1 ? "" : "s"}`),
  );
}

/** Suggested LinkedIn post (PP-11): specific, warm, no hype words (UI §10). */
export function suggestedPost(orgName: string, t: ImpactTotals, shareUrl: string): string {
  const who = recipientPhrase(t);
  const whoLine = who ? ` They're now in the hands of ${who} across Toronto.` : "";
  return [
    `This year ${orgName} gave ${n(t.devicesReceived)} retired ${t.devicesReceived === 1 ? "device" : "devices"} a second life with Free Geek Toronto.`,
    `${n(t.devicesReused)} ${t.devicesReused === 1 ? "is" : "are"} back in use after a verified data wipe and a volunteer refurbish.${whoLine}`,
    `That kept about ${n(t.kgDiverted)} kg of electronics out of landfill (est. ${n(t.co2eAvoidedKg)} kg CO₂e avoided).`,
    `Thank you to the Free Geek Toronto volunteers who did the work. Curious how it works? ${shareUrl}`,
  ].join("\n\n");
}

/** LinkedIn's share dialog for a URL. */
export function linkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}
