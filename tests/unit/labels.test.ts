import { describe, expect, it } from "vitest";
import { helpingLine, recipientPhrase } from "@/lib/domain";

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

describe("helpingLine (partner dashboard)", () => {
  it("names the category, never a person", () => {
    expect(helpingLine("student")).toBe("Now helping a student");
    expect(helpingLine("low_income_household")).toBe("Now helping a low-income household");
    expect(helpingLine("undisclosed")).toBe("In a new home");
    expect(helpingLine(null)).toBe("In a new home");
  });
});
