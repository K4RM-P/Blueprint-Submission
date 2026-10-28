import { describe, expect, it } from "vitest";
import {
  batchCanComplete,
  batchCanIssueCertificate,
  canTransitionBatch,
  canTransitionDevice,
  devicePath,
  nextDeviceStatuses,
} from "@/lib/status-machine";

const verified = { wipeVerifiedAt: "2026-05-01T00:00:00Z" };

describe("device status machine (PRD §9.1)", () => {
  it("allows the happy path", () => {
    expect(canTransitionDevice("received", "testing", { actor: "volunteer" }).ok).toBe(true);
    expect(canTransitionDevice("testing", "wipe_pending_verification", { actor: "volunteer" }).ok).toBe(true);
    expect(canTransitionDevice("wipe_pending_verification", "wipe_verified", { actor: "staff" }).ok).toBe(true);
    expect(canTransitionDevice("wipe_verified", "refurbishing", { actor: "volunteer", ...verified }).ok).toBe(true);
    expect(canTransitionDevice("refurbishing", "ready", { actor: "volunteer", ...verified }).ok).toBe(true);
    expect(canTransitionDevice("ready", "listed", { actor: "staff", ...verified }).ok).toBe(true);
    expect(canTransitionDevice("listed", "sold", { actor: "staff", ...verified }).ok).toBe(true);
  });

  it("only staff can verify wipes (VW-03, OPS-07)", () => {
    const r = canTransitionDevice("wipe_pending_verification", "wipe_verified", { actor: "volunteer" });
    expect(r.ok).toBe(false);
  });

  it("blocks skipping steps", () => {
    expect(canTransitionDevice("received", "ready", { actor: "staff", ...verified }).ok).toBe(false);
    expect(canTransitionDevice("testing", "wipe_verified", { actor: "staff" }).ok).toBe(false);
    expect(canTransitionDevice("sold", "listed", { actor: "staff" }).ok).toBe(false);
  });

  it("never reaches ready/listed/sold without a verified wipe", () => {
    expect(canTransitionDevice("refurbishing", "ready", { actor: "staff" }).ok).toBe(false);
    expect(canTransitionDevice("ready", "listed", { actor: "staff", wipeVerifiedAt: null }).ok).toBe(false);
  });

  it("recycles from any pre-sale state with a reason", () => {
    expect(canTransitionDevice("testing", "recycled", { actor: "staff", recycledReason: "Cracked board", driveHandling: "Drive physically destroyed" }).ok).toBe(true);
    expect(canTransitionDevice("wipe_verified", "recycled", { actor: "staff", recycledReason: "Cracked board", wipeVerifiedAt: "2026-10-01" }).ok).toBe(true);
    expect(canTransitionDevice("testing", "recycled", { actor: "staff" }).ok).toBe(false);
    // An unverified drive can't leave without a recorded handling (certificate accounts for every drive).
    expect(canTransitionDevice("testing", "recycled", { actor: "staff", recycledReason: "Cracked board" })).toEqual({ ok: false, reason: "Record what happened to the drive before recycling." });
    expect(canTransitionDevice("sold", "recycled", { actor: "staff", recycledReason: "x" }).ok).toBe(false);
    expect(canTransitionDevice("recycled", "recycled", { actor: "staff", recycledReason: "x" }).ok).toBe(false);
  });

  it("partners can never move devices", () => {
    expect(canTransitionDevice("received", "testing", { actor: "partner" }).ok).toBe(false);
  });

  it("lists next statuses and paths", () => {
    expect(nextDeviceStatuses("received")).toEqual(["testing", "recycled"]);
    expect(nextDeviceStatuses("sold")).toEqual([]);
    expect(devicePath("received", "wipe_verified")).toEqual(["testing", "wipe_pending_verification", "wipe_verified"]);
    expect(devicePath("sold", "received")).toBeNull();
    expect(devicePath("sold", "recycled")).toBeNull();
  });
});

describe("batch status machine (PRD §9.2)", () => {
  it("follows the timeline", () => {
    expect(canTransitionBatch("submitted", "approved").ok).toBe(true);
    expect(canTransitionBatch("approved", "scheduled").ok).toBe(true);
    expect(canTransitionBatch("scheduled", "received").ok).toBe(true);
    expect(canTransitionBatch("submitted", "received").ok).toBe(false);
  });
  it("declining needs a reason and is terminal", () => {
    expect(canTransitionBatch("submitted", "declined").ok).toBe(false);
    expect(canTransitionBatch("submitted", "declined", { declineReason: "Only accessories" }).ok).toBe(true);
    expect(canTransitionBatch("declined", "approved").ok).toBe(false);
  });
  it("completes only with a certificate and finished devices", () => {
    expect(batchCanComplete(["sold", "recycled", "ready"], true)).toBe(true);
    expect(batchCanComplete(["sold", "testing"], true)).toBe(false);
    expect(batchCanComplete(["sold"], false)).toBe(false);
    expect(batchCanComplete([], true)).toBe(false);
  });
  it("certificates need every device verified or recycled (OPS-08)", () => {
    expect(batchCanIssueCertificate(["wipe_verified", "sold", "recycled"])).toBe(true);
    expect(batchCanIssueCertificate(["wipe_verified", "wipe_pending_verification"])).toBe(false);
    expect(batchCanIssueCertificate([])).toBe(false);
  });
});
