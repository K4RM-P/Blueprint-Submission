import { describe, expect, it } from "vitest";
import { matchInOrder, parseList } from "@/lib/bulk-entry";

describe("bulk entry (OPS-04, VW-02)", () => {
  it("parses one entry per line, comma, semicolon or tab, and drops blanks", () => {
    expect(parseList("SN1\nSN2\r\n\n SN3 ,SN4;SN5\tSN6\n")).toEqual(["SN1", "SN2", "SN3", "SN4", "SN5", "SN6"]);
    expect(parseList("   \n\n")).toEqual([]);
  });

  it("matches entries to devices in order and reports extras, gaps and double scans", () => {
    const r = matchInOrder(["a", "b", "c"], ["X1", "X2", "x1", "X4"]);
    expect(r.assigned).toEqual([
      { item: "a", value: "X1" },
      { item: "b", value: "X2" },
      { item: "c", value: "x1" },
    ]);
    expect(r.extra).toEqual(["X4"]);
    expect(r.missing).toEqual([]);
    expect(r.duplicates).toEqual(["x1"]);
    expect(matchInOrder(["a", "b"], ["X1"]).missing).toEqual(["b"]);
  });
});
