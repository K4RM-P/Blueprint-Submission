import { describe, expect, it } from "vitest";
import { ANON_BUSINESS, ANON_HOUSEHOLD, ANON_VOLUNTEER, buildPassportStory, coverLine, daysBetween, ownerThanks, personalizeForOwner, shareText, slideIndexFromParam, type PassportStoryData } from "@/lib/passport-story";

/** Relay Wrapped story builder (DP-02…DP-06, PIF-06). */
const sold: PassportStoryData = {
  code: "FGT-WRAPPED2",
  category: "laptop",
  make: "Lenovo",
  model: "ThinkPad T480",
  cpu: "Intel Core i5-8350U",
  ram_gb: 8,
  storage_gb: 256,
  approx_year: 2019,
  status: "sold",
  os_installed: "Linux Mint 22",
  is_open_source_os: true,
  weight_kg: null,
  uniform: true,
  pif_subsidized: true,
  donor: { type: "partner", name: "Maple Ledger Accounting", logo_path: null },
  volunteer_first_name: "Aisha",
  timeline: { donated_at: "2026-05-18T14:00:00Z", wipe_verified_at: "2026-05-22T13:00:00Z", refurbished_at: "2026-05-25T12:00:00Z", ready_at: "2026-05-25T12:00:00Z", in_new_home: true },
  factor: { category: "laptop", avg_weight_kg: 2.1, co2e_avoided_kg_per_reuse: 230, source_title: "TO VERIFY", source_url: null },
  price_breakdown: [{ label: "Refurbishing & testing", percent: 100, description: "" }],
  price_breakdown_confirmed: false,
  offered_at: "2026-05-06T14:00:00Z",
  milestones: [
    { kind: "received", at: "2026-05-18T14:00:00Z" },
    { kind: "hardware_test", at: "2026-05-20T12:00:00Z" },
    { kind: "wipe_performed", at: "2026-05-21T18:00:00Z" },
    { kind: "wipe_verified", at: "2026-05-22T13:00:00Z" },
    { kind: "os_installed", at: "2026-05-24T09:00:00Z" },
    { kind: "final_qa", at: "2026-05-25T12:00:00Z" },
    { kind: "ready", at: "2026-05-25T12:00:00Z" },
    { kind: "listed", at: "2026-05-26T10:00:00Z" },
    { kind: "sold", at: "2026-06-12T12:00:00Z" },
  ],
  steps_completed: ["hardware_test", "wipe_performed", "os_installed", "final_qa"],
  bench_days: 5,
  recycled: false,
};

const keys = (p: PassportStoryData) => buildPassportStory(p).slides.map((s) => s.key);

describe("buildPassportStory", () => {
  it("tells the full relay for a sold device, ending on the card", () => {
    expect(keys(sold)).toEqual(["cover", "origin", "handoff", "erased", "bench", "speed", "software", "numbers", "money", "why", "your_turn", "persona", "finale"]);
    const s = buildPassportStory(sold);
    expect(s.leg).toBe(3);
    expect(s.donor).toEqual({ label: "Maple Ledger Accounting", named: true, household: false });
    expect(s.volunteer).toEqual({ label: "Aisha", named: true });
    expect(s.daysToReady).toBe(7);
    expect(s.benchSteps.every((b) => b.at)).toBe(true);
    expect(s.pifSubsidized).toBe(true);
  });

  it("uses the impact engine and an exact water comparison (1 kg = 1 L)", () => {
    const s = buildPassportStory(sold);
    expect(s.impact.kg).toBe(2.1);
    expect(s.impact.co2eKg).toBe(230);
    expect(s.impact.litresOfWater).toBe(s.impact.kg);
    expect(s.impact.factorsToVerify).toBe(true);
  });

  it("falls back to kind, anonymous names when nobody opted in", () => {
    const s = buildPassportStory({ ...sold, donor: { type: "partner", name: null, logo_path: null }, volunteer_first_name: null });
    expect(s.donor.label).toBe(ANON_BUSINESS);
    expect(s.volunteer.label).toBe(ANON_VOLUNTEER);
    const h = buildPassportStory({ ...sold, donor: { type: "household", name: "Should not show", logo_path: null }, offered_at: "2026-05-01T00:00:00Z" });
    expect(h.donor.label).toBe(ANON_HOUSEHOLD);
    expect(h.dates.offered).toBeNull();
  });

  it("stops at the current leg for a device still on the bench", () => {
    const p: PassportStoryData = {
      ...sold,
      status: "refurbishing",
      pif_subsidized: false,
      timeline: { ...sold.timeline, ready_at: null, refurbished_at: null, in_new_home: false },
      milestones: sold.milestones.filter((m) => !["final_qa", "ready", "listed", "sold"].includes(m.kind)),
    };
    expect(keys(p)).toEqual(["cover", "origin", "handoff", "erased", "bench", "software", "numbers", "money", "why", "next_leg", "persona", "finale"]);
    const s = buildPassportStory(p);
    expect(s.leg).toBe(2);
    expect(s.daysToReady).toBeNull();
    expect(s.benchSteps.find((b) => b.kind === "final_qa")?.at).toBeNull();
  });

  it("drops slides with missing data instead of inventing it", () => {
    const p: PassportStoryData = {
      ...sold,
      status: "received",
      os_installed: null,
      timeline: { ...sold.timeline, wipe_verified_at: null, ready_at: null, refurbished_at: null, in_new_home: false },
      milestones: [{ kind: "received", at: "2026-05-18T14:00:00Z" }],
      price_breakdown: [],
    };
    expect(keys(p)).toEqual(["cover", "origin", "handoff", "numbers", "why", "next_leg", "persona", "finale"]);
    expect(buildPassportStory(p).leg).toBe(1);
  });

  it("tells a short, respectful story for a recycled device (weight only, no CO₂e)", () => {
    const p: PassportStoryData = {
      ...sold,
      status: "recycled",
      recycled: true,
      os_installed: null,
      timeline: { ...sold.timeline, wipe_verified_at: null, ready_at: null, refurbished_at: null, in_new_home: false },
      milestones: [
        { kind: "received", at: "2026-05-18T14:00:00Z" },
        { kind: "hardware_test", at: "2026-05-20T12:00:00Z" },
        { kind: "recycled", at: "2026-05-22T12:00:00Z" },
      ],
    };
    expect(keys(p)).toEqual(["cover", "origin", "handoff", "bench", "recycled", "numbers", "persona", "finale"]);
    const s = buildPassportStory(p);
    expect(s.impact.co2eKg).toBeNull();
    expect(s.impact.kg).toBe(2.1);
    expect(shareText(s)).toMatch(/recycled responsibly/);
  });

  it("gives each slide exactly one tint and only waits on the cover and finale", () => {
    for (const sl of buildPassportStory(sold).slides) {
      expect(["porcelain", "apricot", "sky", "butter", "mint", "forest"]).toContain(sl.tint);
      if (sl.key === "cover" || sl.key === "finale") expect(sl.durationMs).toBeNull();
      else expect(sl.durationMs).toBeGreaterThanOrEqual(5000);
    }
  });
});

describe("story helpers", () => {
  it("counts whole days and never goes negative", () => {
    expect(daysBetween("2026-05-18T14:00:00Z", "2026-05-25T12:00:00Z")).toBe(7);
    expect(daysBetween("2026-05-18T14:00:00Z", "2026-05-18T20:00:00Z")).toBe(1);
    expect(daysBetween("2026-05-18T14:00:00Z", "2026-05-01T00:00:00Z")).toBe(0);
  });
  it("clamps deep links to real slides (1-based)", () => {
    expect(slideIndexFromParam("3", 10)).toBe(2);
    expect(slideIndexFromParam("99", 10)).toBe(9);
    expect(slideIndexFromParam("0", 10)).toBe(0);
    expect(slideIndexFromParam("abc", 10)).toBe(0);
    expect(slideIndexFromParam(undefined, 10)).toBe(0);
    expect(slideIndexFromParam(["4", "5"], 10)).toBe(3);
  });
  it("never puts private fields in share copy", () => {
    const text = shareText(buildPassportStory(sold));
    expect(text).toBe("My laptop has had 3 lives. Every device deserves a second leg. Pass it on.");
  });
});

describe("owner personalization (partner's own laptop)", () => {
  it("opens and ends with the partner only when personalized; nothing else changes", () => {
    const pub = buildPassportStory(sold);
    expect(pub.owner).toBeUndefined();
    expect(coverLine(pub)).toBe("This laptop has a *story.*");
    expect(ownerThanks(pub)).toBeNull();
    const mine = personalizeForOwner(pub, "Maple Ledger Accounting");
    expect(coverLine(mine)).toBe("This was one of your laptops, *Maple Ledger Accounting.*");
    expect(ownerThanks(mine)).toMatch(/^Thank you, Maple Ledger Accounting\./);
    expect(mine.slides).toEqual(pub.slides);
    expect(mine.donor).toEqual(pub.donor);
    expect(shareText(mine)).not.toContain("Maple Ledger");
    expect(personalizeForOwner(pub, "  ")).toBe(pub);
  });
});
