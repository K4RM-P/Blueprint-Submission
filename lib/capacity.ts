import { addDays, mondayOf, shortDate, toISODate } from "./dates";

/** Capacity calendar (PRD §9.4). */

export type WeekStatus = "open" | "limited" | "full";

export interface WeekLoad {
  week: string;
  devices: number;
}

export interface CapacityWeek {
  week: string;
  label: string;
  load: number;
  capacity: number;
  ratio: number;
  status: WeekStatus;
}

export const DEFAULT_WEEKLY_CAPACITY = 20;

/** Open < 70%, Limited 70–100%, Full > 100%. */
export function weekStatus(load: number, capacity: number): WeekStatus {
  if (capacity <= 0) return "full";
  const r = load / capacity;
  if (r > 1) return "full";
  if (r >= 0.7) return "limited";
  return "open";
}

/** Weeks to show: start from next Monday so drop-offs always have notice. */
export function upcomingWeeks(today: Date, count = 8): string[] {
  const start = addDays(mondayOf(today), 7);
  return Array.from({ length: count }, (_, i) => toISODate(addDays(start, i * 7)));
}

export function buildCalendar(weeks: string[], loads: WeekLoad[], capacity: number, extra: { week?: string; devices?: number } = {}): CapacityWeek[] {
  const map = new Map<string, number>();
  for (const l of loads) map.set(l.week, (map.get(l.week) ?? 0) + l.devices);
  return weeks.map((week) => {
    const load = (map.get(week) ?? 0) + (extra.week === week ? (extra.devices ?? 0) : 0);
    return { week, label: shortDate(week), load, capacity, ratio: capacity > 0 ? load / capacity : Infinity, status: weekStatus(load, capacity) };
  });
}

/** Would adding `devices` to `week` push it over capacity? (OPS-03 warning) */
export function wouldExceed(week: string, devices: number, loads: WeekLoad[], capacity: number): boolean {
  const current = loads.filter((l) => l.week === week).reduce((s, l) => s + l.devices, 0);
  return current + devices > capacity;
}

/** Next week (from `weeks`, in order) that can take `devices` without exceeding capacity. */
export function nextOpenWeek(weeks: string[], devices: number, loads: WeekLoad[], capacity: number, after?: string): string | null {
  for (const w of weeks) {
    if (after && w <= after) continue;
    if (!wouldExceed(w, devices, loads, capacity)) return w;
  }
  return null;
}

/**
 * The calendar as one partner's batch sees it (PP-04): a week that can't take the batch on top of
 * what's booked is Full (a week with 7 of 20 spots taken is Full for a 20-laptop batch); weeks that
 * can keep their usual Open/Limited label from the current load. A batch bigger than a whole week
 * is judged by one week's worth (staff split it across weeks).
 */
export function calendarForBatch(calendar: CapacityWeek[], devices: number): CapacityWeek[] {
  return calendar.map((w) => {
    const add = Math.min(Math.max(devices, 0), w.capacity);
    return { ...w, status: w.load + add > w.capacity ? "full" : weekStatus(w.load, w.capacity) };
  });
}

/** First week the batch fits, preferring Open over Limited (the wizard's default pick). */
export function firstWeekForBatch(calendar: CapacityWeek[], devices: number): string | null {
  const view = calendarForBatch(calendar, devices);
  return (view.find((w) => w.status === "open") ?? view.find((w) => w.status === "limited"))?.week ?? null;
}

/** Partners may only pick weeks that aren't Full (PP-04). */
export function partnerCanChoose(week: CapacityWeek): boolean {
  return week.status !== "full";
}
