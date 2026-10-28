import { describe, expect, it } from "vitest";
import { listedOnWall } from "@/lib/partner-wall";

describe("Partner Wall (DP-07)", () => {
  it("lists an opted-in partner only once FGT has received its laptops", () => {
    const rows = [
      { name: "Signed up yesterday", devices_received: 0 },
      { name: "Batch received", devices_received: "12" },
      { name: "Some back in use", devices_received: 30 },
    ];
    expect(listedOnWall(rows).map((r) => r.name)).toEqual(["Batch received", "Some back in use"]);
    expect(listedOnWall(null)).toEqual([]);
  });
});
