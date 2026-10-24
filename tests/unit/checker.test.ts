import { describe, expect, it } from "vitest";
import { DEFAULT_ACCEPTED_ITEMS as R, evaluateDonation } from "@/lib/checker";

const base = { category: "laptop" as const, ageYears: 4, working: "yes" as const, isBusiness: false, quantity: 1 };

describe("household checker (HC-02, HC-03)", () => {
  it("accepts a recent laptop", () => expect(evaluateDonation(base, R).outcome).toBe("accepted"));
  it("recycles old laptops", () => expect(evaluateDonation({ ...base, ageYears: 14 }, R).outcome).toBe("recycling_only"));
  it("recycles broken monitors", () => expect(evaluateDonation({ ...base, category: "monitor", working: "no" }, R).outcome).toBe("recycling_only"));
  it("accepts broken laptops for refurbishment (parts)", () => expect(evaluateDonation({ ...base, working: "no" }, R).outcome).toBe("accepted"));
  it("rejects other electronics", () => expect(evaluateDonation({ ...base, category: "other" }, R).outcome).toBe("not_accepted"));
  it("routes businesses with 5+ devices to the partner program", () => {
    expect(evaluateDonation({ ...base, isBusiness: true, quantity: 5 }, R).outcome).toBe("partner_redirect");
    expect(evaluateDonation({ ...base, isBusiness: true, quantity: 4 }, R).outcome).toBe("accepted");
  });
  it("treats unknown age as acceptable", () => expect(evaluateDonation({ ...base, ageYears: null }, R).outcome).toBe("accepted"));
  it("rejects categories with no rule", () => expect(evaluateDonation(base, []).outcome).toBe("not_accepted"));
});

describe("guessCategory (HC-01 typed model)", () => {
  it("recognizes common models", async () => {
    const { guessCategory } = await import("@/lib/checker");
    expect(guessCategory("Dell Latitude 5420")).toBe("laptop");
    expect(guessCategory("MacBook Air 2019")).toBe("laptop");
    expect(guessCategory("iPad 6th gen")).toBe("tablet");
    expect(guessCategory("HP OptiPlex tower")).toBe("desktop");
    expect(guessCategory("Samsung 24 inch monitor")).toBe("monitor");
    expect(guessCategory("old CRT TV")).toBe("other");
    expect(guessCategory("wireless mouse")).toBe("accessory");
  });
  it("returns null when it can't tell", async () => {
    const { guessCategory } = await import("@/lib/checker");
    expect(guessCategory("x")).toBeNull();
    expect(guessCategory("Zorblax 3000")).toBeNull();
  });
});
