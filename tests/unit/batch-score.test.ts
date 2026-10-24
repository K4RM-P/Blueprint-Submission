import { describe, expect, it } from "vitest";
import { computeBatchScore, scoreLabel, scoreTip, type ScoreLineItem } from "@/lib/batch-score";

const item = (p: Partial<ScoreLineItem>): ScoreLineItem => ({ category: "laptop", make: "Dell", model: "Latitude 5420", approxYear: 2021, quantity: 1, ...p });
const Y = 2026;

describe("Batch Value Score (PRD §9.3)", () => {
  it("scores the F1 demo batch Excellent (20 × Dell Latitude 5420, 2021)", () => {
    const b = computeBatchScore([item({ quantity: 20 })], { currentYear: Y });
    // uniformity 1, youth (8-5)/8 = .375, volume 1, laptops 1 → 40 + 9.375 + 20 + 15 = 84.4 → 84
    expect(b.score).toBe(84);
    expect(b.label).toBe("Excellent");
  });
  it("returns 0 / Low for an empty batch", () => {
    const b = computeBatchScore([], { currentYear: Y });
    expect(b.score).toBe(0);
    expect(b.label).toBe("Low");
    expect(b.avgAgeYears).toBeNull();
  });
  it("ignores zero-quantity rows", () => {
    expect(computeBatchScore([item({ quantity: 0 })], { currentYear: Y }).totalQuantity).toBe(0);
  });
  it("handles a single device", () => {
    const b = computeBatchScore([item({ quantity: 1, approxYear: 2026 })], { currentYear: Y });
    // 40 + 25 + 1 + 15 = 81
    expect(b.score).toBe(81);
  });
  it("all old devices lose the youth factor", () => {
    const b = computeBatchScore([item({ quantity: 20, approxYear: 2010 })], { currentYear: Y });
    expect(b.youth).toBe(0);
    expect(b.score).toBe(75);
  });
  it("treats make/model case-insensitively for uniformity", () => {
    const b = computeBatchScore([item({ quantity: 5, model: "latitude 5420" }), item({ quantity: 5, make: "DELL" })], { currentYear: Y });
    expect(b.uniformity).toBe(1);
  });
  it("mixed batches score lower", () => {
    const b = computeBatchScore(
      [
        item({ quantity: 2 }),
        item({ quantity: 1, make: "HP", model: "EliteBook 840" }),
        item({ quantity: 1, category: "monitor", make: "LG", model: "24MK", approxYear: 2016 }),
        item({ quantity: 1, category: "desktop", make: "Lenovo", model: "M710", approxYear: null }),
      ],
      { currentYear: Y },
    );
    expect(b.uniformity).toBeCloseTo(0.4);
    expect(b.laptopShare).toBeCloseTo(0.6);
    expect(b.score).toBeLessThan(50);
  });
  it("respects custom weights from settings", () => {
    const b = computeBatchScore([item({ quantity: 20 })], { currentYear: Y, weights: { uniformity: 1, youth: 0, volume: 0, laptopShare: 0 } });
    expect(b.score).toBe(100);
  });
  it("labels thresholds", () => {
    expect([scoreLabel(75), scoreLabel(74), scoreLabel(50), scoreLabel(49), scoreLabel(25), scoreLabel(24)]).toEqual(["Excellent", "Good", "Good", "Fair", "Fair", "Low"]);
  });
  it("gives a tip", () => {
    expect(scoreTip(computeBatchScore([], { currentYear: Y }))).toMatch(/Add the devices/);
    expect(scoreTip(computeBatchScore([item({ quantity: 2 }), item({ quantity: 2, model: "X" })], { currentYear: Y }))).toMatch(/identical|20/);
  });
});
