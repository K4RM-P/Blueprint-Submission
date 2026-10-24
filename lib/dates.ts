/** Week helpers. Weeks start on Monday and are stored as ISO dates (YYYY-MM-DD). */

export function toISODate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function mondayOf(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7; // Monday = 0
  x.setUTCDate(x.getUTCDate() - dow);
  return x;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export function isMonday(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && parseISODate(iso).getUTCDay() === 1;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function shortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function longDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  // Date-only values (YYYY-MM-DD) are calendar days, not instants: don't shift them by time zone.
  const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric", timeZone: dateOnly ? "UTC" : "America/Toronto" });
}

/** A Date `days` before now (negative = future). */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}
