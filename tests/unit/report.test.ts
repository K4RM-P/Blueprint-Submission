import { describe, expect, it } from "vitest";
import { inPeriod, linkedInShareUrl, reportPeriod, suggestedPost, topRecipients } from "@/lib/report";
import type { ImpactTotals } from "@/lib/impact";

const totals: ImpactTotals = {
  devicesReceived: 20,
  devicesReused: 16,
  devicesRecycled: 2,
  devicesInProgress: 2,
  kgDiverted: 40,
  co2eAvoidedKg: 3200,
  volunteerHours: 18,
  recipients: { student: 9, newcomer: 4, senior: 0, low_income_household: 2, nonprofit: 0, small_business: 0, general: 0, undisclosed: 1 },
} as ImpactTotals;

describe("annual report period (PP-10)", () => {
  const p = reportPeriod(new Date("2026-10-24T12:00:00Z"));
  it("covers the trailing 12 calendar months", () => {
    expect(p.months).toHaveLength(12);
    expect(p.months[0]).toBe("2025-11");
    expect(p.months[11]).toBe("2026-10");
    expect(p.label).toBe("Nov 2025 – Oct 2026");
  });
  it("includes dates inside and excludes dates outside", () => {
    expect(inPeriod("2025-11-01T00:00:00Z", p)).toBe(true);
    expect(inPeriod("2026-10-31T23:59:00Z", p)).toBe(true);
    expect(inPeriod("2025-10-31T23:59:00Z", p)).toBe(false);
    expect(inPeriod("2026-11-01T00:00:00Z", p)).toBe(false);
    expect(inPeriod(null, p)).toBe(false);
  });
});

describe("LinkedIn card text (PP-11)", () => {
  it("lists recipients largest first without undisclosed", () => {
    expect(topRecipients(totals).map((r) => r.category)).toEqual(["student", "newcomer", "low_income_household"]);
  });
  it("writes a specific post with real numbers and no hype words", () => {
    const post = suggestedPost("Maple Ledger Accounting", totals, "https://geekloop.example/partners");
    expect(post).toContain("Maple Ledger Accounting gave 20 retired devices");
    expect(post).toContain("16 are back in use");
    expect(post).toContain("students, newcomers and low-income households");
    expect(post).toContain("40 kg");
    expect(post).not.toMatch(/supercharge|revolutioni|seamless|elevate|unlock/i);
  });
  it("builds a LinkedIn share URL", () => {
    expect(linkedInShareUrl("https://x.test/a?b=1")).toBe("https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fx.test%2Fa%3Fb%3D1");
  });
});
