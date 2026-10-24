import type { DeviceCategory } from "./domain";

/** "Can I Donate This?" rules engine (HC-02). Rules are staff-configurable in settings.accepted_items. */

export type CheckerOutcome = "accepted" | "recycling_only" | "not_accepted" | "partner_redirect";
export type Working = "yes" | "partly" | "no" | "unsure";

export interface AcceptedItem {
  category: DeviceCategory;
  label: string;
  /** Base decision for this category. */
  decision: "accepted" | "recycling_only" | "not_accepted";
  /** Older than this → recycling only. Null = any age. */
  maxAgeYears: number | null;
  /** Not working → recycling only. */
  requiresWorking: boolean;
  note: string;
}

export interface CheckerAnswers {
  category: DeviceCategory;
  ageYears: number | null;
  working: Working;
  isBusiness: boolean;
  quantity: number;
}

export interface CheckerResult {
  outcome: CheckerOutcome;
  /** Rule note to show (what to bring, why). */
  note: string;
}

/** Businesses with this many devices are routed to the Reuse Partner program (HC-03). */
export const BUSINESS_REDIRECT_MIN = 5;

export function evaluateDonation(a: CheckerAnswers, rules: AcceptedItem[]): CheckerResult {
  if (a.isBusiness && a.quantity >= BUSINESS_REDIRECT_MIN) {
    return { outcome: "partner_redirect", note: "Businesses donating 5 or more devices get free pickup scheduling, a data-wipe certificate and an impact report as a Reuse Partner." };
  }
  const rule = rules.find((r) => r.category === a.category);
  if (!rule || rule.decision === "not_accepted") {
    return { outcome: "not_accepted", note: rule?.note ?? "We can't take this item." };
  }
  if (rule.decision === "recycling_only") return { outcome: "recycling_only", note: rule.note };
  const tooOld = rule.maxAgeYears !== null && a.ageYears !== null && a.ageYears > rule.maxAgeYears;
  const broken = rule.requiresWorking && a.working === "no";
  if (tooOld || broken) {
    return {
      outcome: "recycling_only",
      note: tooOld
        ? `Devices older than ${rule.maxAgeYears} years are usually too slow to refurbish, so we recycle them responsibly.`
        : "Devices that don't turn on are recycled responsibly for parts.",
    };
  }
  return { outcome: "accepted", note: rule.note };
}

export const DEFAULT_ACCEPTED_ITEMS: AcceptedItem[] = [
  { category: "laptop", label: "Laptops", decision: "accepted", maxAgeYears: 10, requiresWorking: false, note: "Bring the charger if you have it. Leave the drive in — we wipe every drive." },
  { category: "desktop", label: "Desktop computers", decision: "accepted", maxAgeYears: 10, requiresWorking: false, note: "Bring the power cable. Leave the drive in — we wipe every drive." },
  { category: "monitor", label: "Flat-screen monitors", decision: "accepted", maxAgeYears: 12, requiresWorking: true, note: "Flat LCD/LED monitors only, with a power cable if possible." },
  { category: "tablet", label: "Tablets", decision: "accepted", maxAgeYears: 7, requiresWorking: true, note: "Sign out of your accounts and remove the passcode before drop-off." },
  { category: "accessory", label: "Keyboards, mice and cables", decision: "accepted", maxAgeYears: null, requiresWorking: false, note: "Clean keyboards, mice, cables and chargers are welcome." },
  { category: "other", label: "Other electronics (TVs, printers, CRTs, appliances)", decision: "not_accepted", maxAgeYears: null, requiresWorking: false, note: "We can't take TVs, printers, CRT monitors or appliances. Ontario's approved e-waste depots can recycle them safely." },
];
