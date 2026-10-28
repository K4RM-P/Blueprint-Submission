import type { BatchStatus, DeviceStatus } from "./domain";

/**
 * Device status machine (PRD §9.1). Mirrors the SQL trigger in
 * supabase/migrations/0003_logic.sql so the UI can explain blocked moves.
 */
const DEVICE_NEXT: Record<DeviceStatus, readonly DeviceStatus[]> = {
  received: ["testing"],
  testing: ["wipe_pending_verification"],
  wipe_pending_verification: ["wipe_verified"],
  wipe_verified: ["refurbishing"],
  refurbishing: ["ready"],
  ready: ["listed"],
  listed: ["sold"],
  sold: [],
  recycled: [],
};

/** States from which a device may be recycled ("any pre-sale state"). */
export const PRE_SALE: readonly DeviceStatus[] = ["received", "testing", "wipe_pending_verification", "wipe_verified", "refurbishing", "ready", "listed"];

/** States that count as "wipe verified or later" for certificates (OPS-08). */
export const VERIFIED_OR_LATER: readonly DeviceStatus[] = ["wipe_verified", "refurbishing", "ready", "listed", "sold"];

export type Actor = "staff" | "volunteer" | "partner" | "system";

export interface TransitionContext {
  actor: Actor;
  wipeVerifiedAt?: string | Date | null;
  recycledReason?: string | null;
  /** How staff handled the drive when recycling a device whose wipe was never verified. */
  driveHandling?: string | null;
}

export type TransitionResult = { ok: true } | { ok: false; reason: string };

export function nextDeviceStatuses(from: DeviceStatus): DeviceStatus[] {
  const list = [...DEVICE_NEXT[from]];
  if (PRE_SALE.includes(from)) list.push("recycled");
  return list;
}

export function canTransitionDevice(from: DeviceStatus, to: DeviceStatus, ctx: TransitionContext): TransitionResult {
  if (from === to) return { ok: false, reason: "The device is already in that status." };
  if (to === "recycled") {
    if (!PRE_SALE.includes(from)) return { ok: false, reason: "Sold or recycled devices can't be recycled." };
    if (!ctx.recycledReason?.trim()) return { ok: false, reason: "Recycling needs a reason." };
    if (ctx.actor !== "staff" && ctx.actor !== "system") return { ok: false, reason: "Only staff can recycle a device." };
    // Every drive is accounted for on the certificate: unverified ones need a recorded handling.
    if (ctx.actor === "staff" && !ctx.wipeVerifiedAt && !ctx.driveHandling?.trim()) return { ok: false, reason: "Record what happened to the drive before recycling." };
    return { ok: true };
  }
  if (!DEVICE_NEXT[from].includes(to)) {
    return { ok: false, reason: `A device can't go from ${from.replaceAll("_", " ")} to ${to.replaceAll("_", " ")}.` };
  }
  if (to === "wipe_verified" && ctx.actor !== "staff" && ctx.actor !== "system") {
    return { ok: false, reason: "Only staff can verify a data wipe." };
  }
  if ((to === "ready" || to === "listed" || to === "sold") && !ctx.wipeVerifiedAt) {
    return { ok: false, reason: "The data wipe must be verified first." };
  }
  if (ctx.actor === "partner") return { ok: false, reason: "Partners can't change device status." };
  return { ok: true };
}

/** Shortest valid path between two statuses (used by the seed and bulk actions). */
export function devicePath(from: DeviceStatus, to: DeviceStatus): DeviceStatus[] | null {
  if (to === "recycled") return PRE_SALE.includes(from) ? ["recycled"] : null;
  const path: DeviceStatus[] = [];
  let cur = from;
  while (cur !== to) {
    const next = DEVICE_NEXT[cur][0];
    if (!next) return null;
    path.push(next);
    cur = next;
  }
  return path;
}

/** Batch status machine (PRD §9.2). */
const BATCH_NEXT: Record<BatchStatus, readonly BatchStatus[]> = {
  submitted: ["approved", "declined"],
  approved: ["scheduled"],
  scheduled: ["received"],
  received: ["in_refurbishment", "completed"],
  in_refurbishment: ["completed"],
  declined: [],
  completed: [],
};

export function canTransitionBatch(from: BatchStatus, to: BatchStatus, opts: { declineReason?: string | null } = {}): TransitionResult {
  if (!BATCH_NEXT[from].includes(to)) return { ok: false, reason: `A batch can't go from ${from.replaceAll("_", " ")} to ${to.replaceAll("_", " ")}.` };
  if (to === "declined" && !opts.declineReason?.trim()) return { ok: false, reason: "Declining needs a reason." };
  return { ok: true };
}

export const BATCH_TIMELINE: readonly BatchStatus[] = ["submitted", "approved", "scheduled", "received", "in_refurbishment", "completed"];

/** Device statuses that let a batch complete (PRD §9.2). */
export const BATCH_DONE_STATES: readonly DeviceStatus[] = ["sold", "listed", "ready", "recycled"];

export function batchCanComplete(deviceStatuses: DeviceStatus[], hasCertificate: boolean): boolean {
  return hasCertificate && deviceStatuses.length > 0 && deviceStatuses.every((s) => BATCH_DONE_STATES.includes(s));
}

export function batchCanIssueCertificate(deviceStatuses: DeviceStatus[]): boolean {
  return deviceStatuses.length > 0 && deviceStatuses.every((s) => VERIFIED_OR_LATER.includes(s) || s === "recycled");
}
