import { expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { IMPACT_CARD_SIZE, renderImpactCard } from "@/lib/og/impact-card";

/** PP-11: the LinkedIn card renders as a 1200×627 PNG. Set CARD_PNG_OUT=path to look at it. */
it("renders the LinkedIn impact card", async () => {
  const res = renderImpactCard({
    orgName: "Maple Ledger Accounting",
    tierLabel: "Impact Partner",
    periodLabel: "Nov 2025 – Oct 2026",
    totals: { devicesReceived: 34, devicesReused: 21, devicesRecycled: 3, devicesInProgress: 10, kgDiverted: 52, co2eAvoidedKg: 5880, volunteerHours: 31, recipients: { student: 9, newcomer: 5, senior: 3 } },
  });
  const png = Buffer.from(await res.arrayBuffer());
  expect(png.subarray(1, 4).toString()).toBe("PNG");
  expect(png.readUInt32BE(16)).toBe(IMPACT_CARD_SIZE.width);
  expect(png.readUInt32BE(20)).toBe(IMPACT_CARD_SIZE.height);
  if (process.env.CARD_PNG_OUT) writeFileSync(process.env.CARD_PNG_OUT, png);
});
