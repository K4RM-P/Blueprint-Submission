import { describe, expect, it } from "vitest";
import { buildCalendar, calendarForBatch, firstWeekForBatch, nextOpenWeek, partnerCanChoose, upcomingWeeks, weekStatus, wouldExceed } from "@/lib/capacity";
import { isMonday } from "@/lib/dates";

describe("capacity (PRD §9.4)", () => {
  it("classifies Open / Limited / Full", () => {
    expect(weekStatus(0, 20)).toBe("open");
    expect(weekStatus(13, 20)).toBe("open");
    expect(weekStatus(14, 20)).toBe("limited");
    expect(weekStatus(20, 20)).toBe("limited");
    expect(weekStatus(21, 20)).toBe("full");
    expect(weekStatus(0, 0)).toBe("full");
  });
  it("lists the next 8 Mondays starting next week", () => {
    const weeks = upcomingWeeks(new Date("2026-10-24T12:00:00Z"));
    expect(weeks).toHaveLength(8);
    expect(weeks[0]).toBe("2026-10-26");
    expect(weeks.every(isMonday)).toBe(true);
    expect(upcomingWeeks(new Date("2026-10-26T12:00:00Z"))[0]).toBe("2026-11-02");
  });
  it("builds a calendar from loads", () => {
    const cal = buildCalendar(["2026-11-02", "2026-11-09"], [{ week: "2026-11-02", devices: 15 }, { week: "2026-11-02", devices: 10 }], 20);
    expect(cal[0]).toMatchObject({ load: 25, status: "full", label: "Nov 2" });
    expect(cal[1]).toMatchObject({ load: 0, status: "open" });
    expect(partnerCanChoose(cal[0])).toBe(false);
    expect(partnerCanChoose(cal[1])).toBe(true);
  });
  it("warns and suggests the next open week (OPS-03)", () => {
    const loads = [{ week: "2026-11-02", devices: 15 }, { week: "2026-11-09", devices: 10 }];
    const weeks = ["2026-11-02", "2026-11-09", "2026-11-16"];
    expect(wouldExceed("2026-11-02", 10, loads, 20)).toBe(true);
    expect(wouldExceed("2026-11-09", 10, loads, 20)).toBe(false);
    expect(nextOpenWeek(weeks, 10, loads, 20)).toBe("2026-11-09");
    expect(nextOpenWeek(weeks, 15, loads, 20)).toBe("2026-11-16");
    expect(nextOpenWeek(weeks, 25, loads, 20)).toBeNull();
    expect(nextOpenWeek(weeks, 1, loads, 20, "2026-11-02")).toBe("2026-11-09");
  });

  it("judges each week with the partner's own batch on top (PP-04)", () => {
    const cal = buildCalendar(["2026-11-02", "2026-11-09", "2026-11-16"], [{ week: "2026-11-02", devices: 7 }, { week: "2026-11-09", devices: 2 }], 20);
    expect(calendarForBatch(cal, 20).map((w) => w.status)).toEqual(["full", "full", "open"]);
    expect(calendarForBatch(cal, 5).map((w) => w.status)).toEqual(["open", "open", "open"]);
    // a 30-laptop batch is judged by one week's worth, so an empty week stays choosable
    expect(calendarForBatch(cal, 30).map((w) => w.status)).toEqual(["full", "full", "open"]);
    // a week at 15 of 20 is Limited for a small batch and closed for one that doesn't fit
    const busy = buildCalendar(["2026-11-23"], [{ week: "2026-11-23", devices: 15 }], 20);
    expect(calendarForBatch(busy, 3)[0].status).toBe("limited");
    expect(calendarForBatch(busy, 6)[0].status).toBe("full");
    expect(firstWeekForBatch(cal, 20)).toBe("2026-11-16");
    expect(firstWeekForBatch(cal, 5)).toBe("2026-11-02");
    expect(firstWeekForBatch(buildCalendar(["2026-11-02"], [{ week: "2026-11-02", devices: 20 }], 20), 1)).toBeNull();
  });
});
