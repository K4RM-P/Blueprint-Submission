import { describe, expect, it } from "vitest";
import { signToken, stripeSignatureHeader, verifyStripeSignature, verifyToken } from "@/lib/payments/token";
import { daysRemaining, isMembershipActive, membershipPeriod, purchasableTiers } from "@/lib/membership";
import { CHAMPION_SPONSORSHIP_CENTS, roundUpCents, validateContribution } from "@/lib/ledger";
import { longDate } from "@/lib/dates";

const SECRET = "test-secret";

describe("mock checkout tokens (PIF-05)", () => {
  it("round-trips a signed payload", () => {
    const t = signToken({ ref: "mock_1", amount: 1000 }, SECRET);
    expect(verifyToken<{ ref: string; amount: number }>(t, SECRET)).toEqual({ ref: "mock_1", amount: 1000 });
  });
  it("rejects a tampered payload or signature", () => {
    const t = signToken({ amount: 1000 }, SECRET);
    const [, sig] = t.split(".");
    const forged = `${Buffer.from(JSON.stringify({ amount: 1 })).toString("base64url")}.${sig}`;
    expect(verifyToken(forged, SECRET)).toBeNull();
    expect(verifyToken(t, "other-secret")).toBeNull();
    expect(verifyToken(`${t}.extra`, SECRET)).toBeNull();
    expect(verifyToken("garbage", SECRET)).toBeNull();
  });
  it("rejects expired tokens", () => {
    const t = signToken({ exp: 1_000 }, SECRET);
    expect(verifyToken(t, SECRET, 2_000)).toBeNull();
    expect(verifyToken(t, SECRET, 500)).not.toBeNull();
  });
});

describe("Stripe webhook signatures (PIF-05)", () => {
  const body = JSON.stringify({ type: "checkout.session.completed" });
  it("accepts a valid signature inside the tolerance window", () => {
    const header = stripeSignatureHeader(body, SECRET, 1_000);
    expect(verifyStripeSignature(body, header, SECRET, 1_100)).toBe(true);
  });
  it("rejects a stale timestamp, wrong secret, edited body or missing header", () => {
    const header = stripeSignatureHeader(body, SECRET, 1_000);
    expect(verifyStripeSignature(body, header, SECRET, 2_000)).toBe(false);
    expect(verifyStripeSignature(body, header, "nope", 1_000)).toBe(false);
    expect(verifyStripeSignature(body + " ", header, SECRET, 1_000)).toBe(false);
    expect(verifyStripeSignature(body, null, SECRET, 1_000)).toBe(false);
  });
});

describe("membership periods (PP-12, PIF-04)", () => {
  const now = new Date("2026-10-24T12:00:00Z");
  it("starts today for a new or upgrading member and lasts a year", () => {
    const p = membershipPeriod(now, { tier: "community", expiresAt: null }, "impact");
    expect(p.start.toISOString()).toBe(now.toISOString());
    expect(p.end.toISOString()).toBe("2027-10-24T12:00:00.000Z");
    const up = membershipPeriod(now, { tier: "impact", expiresAt: new Date("2027-03-01T00:00:00Z") }, "champion");
    expect(up.start).toEqual(now);
  });
  it("stacks an early renewal of the same tier onto the current period", () => {
    const p = membershipPeriod(now, { tier: "impact", expiresAt: new Date("2027-03-01T00:00:00Z") }, "impact");
    expect(p.start.toISOString()).toBe("2027-03-01T00:00:00.000Z");
    expect(p.end.toISOString()).toBe("2028-03-01T00:00:00.000Z");
  });
  it("restarts a lapsed membership today", () => {
    expect(membershipPeriod(now, { tier: "impact", expiresAt: new Date("2026-01-01T00:00:00Z") }, "impact").start).toEqual(now);
  });
  it("only offers renewals and upgrades", () => {
    expect(purchasableTiers("community")).toEqual(["impact", "champion"]);
    expect(purchasableTiers("impact")).toEqual(["impact", "champion"]);
    expect(purchasableTiers("champion")).toEqual(["champion"]);
  });
  it("knows when a membership is active", () => {
    expect(isMembershipActive("community", null, now)).toBe(true);
    expect(isMembershipActive("impact", null, now)).toBe(false);
    expect(isMembershipActive("impact", new Date("2026-12-01"), now)).toBe(true);
    expect(daysRemaining(new Date("2026-10-26T12:00:00Z"), now)).toBe(2);
    expect(daysRemaining(new Date("2026-01-01"), now)).toBe(0);
  });
});

describe("contributions and round-ups (PIF-01, PIF-02)", () => {
  it("validates contribution bounds", () => {
    expect(validateContribution(500)).toBeNull();
    expect(validateContribution(50)).toMatch(/smallest/);
    expect(validateContribution(200_000)).toMatch(/contact/);
    expect(validateContribution(10.5)).toMatch(/whole/);
  });
  it("rounds up to the next $5, never adding less than $1", () => {
    expect(roundUpCents(23_399)).toBe(101);
    expect(roundUpCents(1_250)).toBe(250);
    expect(roundUpCents(2_000)).toBe(500);
    expect(roundUpCents(23_450)).toBe(550);
    for (const total of [0, 1, 99, 401, 499, 12_345]) {
      const extra = roundUpCents(total);
      expect(extra).toBeGreaterThanOrEqual(100);
      expect((total + extra) % 500).toBe(0);
    }
    expect(() => roundUpCents(-1)).toThrow();
  });
  it("credits 10 sponsored laptops for Champion", () => expect(CHAMPION_SPONSORSHIP_CENTS).toBe(75_000));
});

describe("dates", () => {
  it("never shifts a calendar day by time zone", () => expect(longDate("2027-03-01")).toBe("Mar 1, 2027"));
});
