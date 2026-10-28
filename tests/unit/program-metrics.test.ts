import { describe, expect, it } from "vitest";
import { computeProgramMetrics, recentMonths, type MetricDevice } from "@/lib/program-metrics";

const dev = (o: Partial<MetricDevice> & Pick<MetricDevice, "id">): MetricDevice => ({
  source: "partner",
  category: "laptop",
  status: "received",
  batchId: "b1",
  lineQuantity: 12,
  receivedAt: "2026-09-10T12:00:00Z",
  soldAt: null,
  priceCents: null,
  passportViews: 0,
  ...o,
});

describe("Reuse Partnership program metrics (OPS-01)", () => {
  it("lists the last N months oldest first", () => {
    expect(recentMonths(new Date("2026-10-27T12:00:00Z"), 3).map((m) => m.month)).toEqual(["2026-08", "2026-09", "2026-10"]);
  });

  it("counts partner laptops per month by batch arrival, retention, time to ready, sales and views", () => {
    const m = computeProgramMetrics({
      today: new Date("2026-10-27T12:00:00Z"),
      months: 3,
      batches: [
        { id: "b1", organizationId: "o1", status: "completed", receivedAt: "2026-09-10T12:00:00Z" },
        { id: "b2", organizationId: "o1", status: "submitted", receivedAt: null },
        { id: "b3", organizationId: "o2", status: "received", receivedAt: "2026-10-02T12:00:00Z" },
        { id: "b4", organizationId: "o3", status: "declined", receivedAt: null },
      ],
      devices: [
        dev({ id: "a", status: "sold", priceCents: 20000, passportViews: 5 }),
        dev({ id: "b", status: "sold", priceCents: null, passportViews: 2 }),
        dev({ id: "c", batchId: "b3", receivedAt: "2026-10-02T12:00:00Z", category: "desktop" }),
        dev({ id: "h1", source: "household", batchId: null, lineQuantity: null, status: "sold", priceCents: 9000, passportViews: 9, receivedAt: "2026-09-01T12:00:00Z" }),
        dev({ id: "h2", source: "household", batchId: null, lineQuantity: null, receivedAt: "2026-09-01T12:00:00Z" }),
      ],
      readyAt: new Map([
        ["a", "2026-09-14T12:00:00Z"],
        ["b", "2026-09-16T12:00:00Z"],
        ["h1", "2026-09-21T12:00:00Z"],
      ]),
    });
    expect(m.partnerLaptopsByMonth.map((x) => x.laptops)).toEqual([0, 2, 0]);
    expect(m.activePartners).toBe(2);
    expect(m.returningPartners).toBe(1);
    expect(m.retention).toBe(0.5);
    expect(m.daysToReady).toEqual({ partnerUniform: 5, household: 20, partnerUniformN: 2, householdN: 1 });
    expect(m.sales.partner).toEqual({ count: 2, revenueCents: 20000, priced: 1 });
    expect(m.sales.household).toEqual({ count: 1, revenueCents: 9000, priced: 1 });
    expect(m.partnerPassportViews).toBe(7);
  });

  it("handles no data", () => {
    const m = computeProgramMetrics({ today: new Date(), devices: [], batches: [], readyAt: new Map() });
    expect(m.retention).toBeNull();
    expect(m.daysToReady.partnerUniform).toBeNull();
  });
});
