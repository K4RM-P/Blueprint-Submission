import { describe, expect, it } from "vitest";
import { programMetrics, type ProgramDevice } from "@/lib/program-metrics";

const now = new Date("2026-10-28T12:00:00Z");
const dev = (o: Partial<ProgramDevice>): ProgramDevice => ({
  source: "partner",
  category: "laptop",
  receivedAt: "2026-10-01T00:00:00Z",
  readyAt: null,
  soldAt: null,
  priceCents: null,
  passportViews: 0,
  ...o,
});

describe("Reuse Partnership success metrics (PRD §3.3)", () => {
  it("counts partner laptops per 30 days and the partner share of intake inside the window", () => {
    const m = programMetrics(
      [
        dev({}),
        dev({}),
        dev({ category: "monitor" }),
        dev({ source: "household" }),
        dev({ receivedAt: "2026-01-01T00:00:00Z" }), // outside the 90-day window
      ],
      [],
      now,
    );
    expect(m.partnerLaptopsPerMonth).toBe(0.7); // 2 laptops over 90 days
    expect(m.partnerShare).toBe(0.75);
  });

  it("compares median intake-to-ready days by source", () => {
    const m = programMetrics(
      [
        dev({ receivedAt: "2026-10-01T00:00:00Z", readyAt: "2026-10-04T00:00:00Z" }),
        dev({ receivedAt: "2026-10-01T00:00:00Z", readyAt: "2026-10-06T00:00:00Z" }),
        dev({ source: "household", receivedAt: "2026-10-01T00:00:00Z", readyAt: "2026-10-11T00:00:00Z" }),
      ],
      [],
      now,
    );
    expect(m.medianDaysToReady).toEqual({ partner: 4, household: 10 });
    expect(m.partnerSpeedup).toBeCloseTo(0.6);
  });

  it("leaves unknowns as null instead of inventing them", () => {
    const m = programMetrics([], [], now);
    expect(m.partnerShare).toBeNull();
    expect(m.medianDaysToReady).toEqual({ partner: null, household: null });
    expect(m.partnerSpeedup).toBeNull();
    expect(m.passportViewsPerSold).toBeNull();
  });

  it("counts repeat partners (declined batches don't count) and partner sales", () => {
    const m = programMetrics(
      [
        dev({ soldAt: "2026-10-20T00:00:00Z", priceCents: 18000, passportViews: 3 }),
        dev({ source: "household", soldAt: "2026-10-21T00:00:00Z", priceCents: 9000, passportViews: 1 }),
      ],
      [
        { organizationId: "a", status: "completed" },
        { organizationId: "a", status: "submitted" },
        { organizationId: "b", status: "completed" },
        { organizationId: "b", status: "declined" },
      ],
      now,
    );
    expect(m.repeatPartners).toEqual({ repeat: 1, total: 2 });
    expect(m.partnerSales).toEqual({ count: 1, cents: 18000 });
    expect(m.passportViewsPerSold).toBe(2);
  });
});
