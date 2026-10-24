import { describe, expect, it } from "vitest";
import { computeImpact, deviceImpact, isRefurbishedStatus, lastMonths, monthlySeries, outcomeForStatus, type ImpactFactor } from "@/lib/impact";

const factors: ImpactFactor[] = [
  { category: "laptop", avgWeightKg: 2, co2eAvoidedKgPerReuse: 200 },
  { category: "monitor", avgWeightKg: 5, co2eAvoidedKgPerReuse: 300 },
];

describe("impact engine (PRD §9.6)", () => {
  it("counts kg for reused + recycled, CO2e for reused only", () => {
    const t = computeImpact(
      [
        { category: "laptop", outcome: "reused", uniform: true, refurbished: true, count: 3, recipient: "student" },
        { category: "laptop", outcome: "recycled", uniform: false, refurbished: false },
        { category: "monitor", outcome: "reused", uniform: false, refurbished: true, weightKg: 4, recipient: "newcomer" },
        { category: "laptop", outcome: "in_progress", uniform: true, refurbished: false, count: 2 },
      ],
      factors,
      { uniform: 60, mixed: 120 },
    );
    expect(t.devicesReceived).toBe(7);
    expect(t.devicesReused).toBe(4);
    expect(t.devicesRecycled).toBe(1);
    expect(t.devicesInProgress).toBe(2);
    expect(t.kgDiverted).toBe(3 * 2 + 2 + 4);
    expect(t.co2eAvoidedKg).toBe(3 * 200 + 300);
    expect(t.volunteerHours).toBe((3 * 60 + 120) / 60);
    expect(t.recipients).toEqual({ student: 3, newcomer: 1 });
  });
  it("is zero for no devices and unknown categories", () => {
    expect(computeImpact([], factors).kgDiverted).toBe(0);
    expect(computeImpact([{ category: "tablet", outcome: "reused", uniform: false, refurbished: false }], factors).co2eAvoidedKg).toBe(0);
  });
  it("maps statuses to outcomes", () => {
    expect(outcomeForStatus("sold")).toBe("reused");
    expect(outcomeForStatus("recycled")).toBe("recycled");
    expect(outcomeForStatus("ready")).toBe("in_progress");
    expect(isRefurbishedStatus("listed")).toBe(true);
    expect(isRefurbishedStatus("refurbishing")).toBe(false);
  });
  it("gives a single device's passport impact", () => {
    expect(deviceImpact({ category: "laptop", outcome: "reused", uniform: true, refurbished: true }, factors)).toEqual({ kg: 2, co2eKg: 200 });
    expect(deviceImpact({ category: "laptop", outcome: "reused", uniform: true, refurbished: true, weightKg: 1.4 }, factors).kg).toBe(1.4);
  });
  it("builds monthly series", () => {
    const months = lastMonths(new Date("2026-10-15T00:00:00Z"), 3);
    expect(months).toEqual(["2026-08", "2026-09", "2026-10"]);
    const s = monthlySeries([{ receivedAt: "2026-09-02T00:00:00Z", soldAt: "2026-10-01T00:00:00Z" }, { receivedAt: "2026-09-20T00:00:00Z", soldAt: null }], months);
    expect(s).toEqual([
      { month: "2026-08", received: 0, reused: 0 },
      { month: "2026-09", received: 2, reused: 0 },
      { month: "2026-10", received: 0, reused: 1 },
    ]);
  });
});
