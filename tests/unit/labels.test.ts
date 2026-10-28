import { describe, expect, it } from "vitest";
import { plural, recipientPhrase } from "@/lib/domain";

describe("recipientPhrase (PP-04 copy)", () => {
  it("pluralises regular and -s endings", () => {
    expect(recipientPhrase("student", 4)).toBe("4 students");
    expect(recipientPhrase("small_business", 6)).toBe("6 small businesses");
    expect(recipientPhrase("low_income_household", 5)).toBe("5 low-income households");
  });
  it("keeps the singular for one", () => {
    expect(recipientPhrase("newcomer", 1)).toBe("1 newcomer");
  });
});

describe("plural", () => {
  it("uses the singular only for exactly one", () => {
    expect(plural(1, "device")).toBe("1 device");
    expect(plural(0, "device")).toBe("0 devices");
    expect(plural(18, "device")).toBe("18 devices");
    expect(plural(2, "batch", "batches")).toBe("2 batches");
  });
});
