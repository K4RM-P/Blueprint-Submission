import { describe, expect, it } from "vitest";
import { BADGES, badgeProgress, estimateHours, evaluateBadges, newBadges } from "@/lib/badges";
import { applyTx, canApplySubsidy, formatCents, fundBalance, validateTx } from "@/lib/ledger";
import { canRequestPickup, hasFullDashboard, splitPrice, validateBreakdown } from "@/lib/pricing";

const zero = { finalQa: 0, hardwareTests: 0, verifiedWipes: 0, openSourceInstalls: 0 };

describe("badges (PRD §9.5)", () => {
  it("has the 7 badges", () => expect(BADGES.map((b) => b.slug)).toHaveLength(7));
  it("awards First Boot after one final QA", () => {
    expect(evaluateBadges({ ...zero, finalQa: 1 })).toEqual(["first-boot"]);
  });
  it("awards at exact thresholds", () => {
    const s = { finalQa: 25, hardwareTests: 10, verifiedWipes: 10, openSourceInstalls: 9 };
    expect(evaluateBadges(s).sort()).toEqual(["bench-regular", "data-guardian", "diagnostician", "first-boot"]);
    expect(evaluateBadges({ ...s, finalQa: 100 })).toContain("century");
  });
  it("never auto-awards Mentor", () => {
    expect(evaluateBadges({ finalQa: 1000, hardwareTests: 1000, verifiedWipes: 1000, openSourceInstalls: 1000 })).not.toContain("mentor");
  });
  it("is idempotent", () => {
    const s = { ...zero, finalQa: 1, hardwareTests: 10 };
    expect(newBadges(s, ["first-boot"])).toEqual(["diagnostician"]);
    expect(newBadges(s, ["first-boot", "diagnostician"])).toEqual([]);
  });
  it("reports progress and hours", () => {
    expect(badgeProgress({ ...zero, verifiedWipes: 7 }, BADGES[2])).toEqual({ value: 7, threshold: 10 });
    expect(estimateHours(3, 1, { uniform: 60, mixed: 120 })).toBe(5);
  });
});

describe("Pay-It-Forward ledger (PIF-03)", () => {
  it("sums the balance", () => {
    expect(fundBalance([{ type: "contribution", amountCents: 2500 }, { type: "subsidy", amountCents: -1000 }])).toBe(1500);
  });
  it("validates direction", () => {
    expect(validateTx({ type: "subsidy", amountCents: 100 })).not.toBeNull();
    expect(validateTx({ type: "contribution", amountCents: -100 })).not.toBeNull();
    expect(validateTx({ type: "sponsorship", amountCents: 0 })).not.toBeNull();
    expect(validateTx({ type: "contribution", amountCents: 500 })).toBeNull();
  });
  it("never goes negative", () => {
    expect(() => applyTx(1000, { type: "subsidy", amountCents: -1500 })).toThrow(/negative/);
    expect(applyTx(1000, { type: "subsidy", amountCents: -1000 })).toBe(0);
    expect(canApplySubsidy(1000, 1500, 20000)).toMatch(/only has/);
    expect(canApplySubsidy(5000, 1500, 1000)).toMatch(/more than the device price/);
    expect(canApplySubsidy(5000, 1500, 20000)).toBeNull();
    expect(canApplySubsidy(5000, 1500, null)).toMatch(/Set the device's price/);
    expect(formatCents(123456)).toBe("$1,234.56");
  });
});

describe("pricing (PRD §9.7, §6.1)", () => {
  const slices = [
    { label: "Refurbishing & testing", percent: 35 },
    { label: "Data security", percent: 10 },
    { label: "Fair wages & training", percent: 30 },
    { label: "Operations & space", percent: 15 },
    { label: "Digital-inclusion programs", percent: 10 },
  ];
  it("requires slices to sum to 100", () => {
    expect(validateBreakdown(slices)).toBeNull();
    expect(validateBreakdown([{ label: "x", percent: 90 }])).toMatch(/add up to 100/);
    expect(validateBreakdown([{ label: "", percent: 100 }])).toMatch(/label/);
  });
  it("splits a price exactly", () => {
    const parts = splitPrice(19999, slices);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(19999);
  });
  it("gates pickup and dashboards by tier", () => {
    expect(canRequestPickup("community")).toBe(false);
    expect(canRequestPickup("impact")).toBe(true);
    expect(hasFullDashboard("community")).toBe(false);
    expect(hasFullDashboard("champion")).toBe(true);
  });
});
