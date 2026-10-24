/** Domain enums mirrored from the Postgres enums in supabase/migrations/0001_schema.sql. */

export const PARTNER_TIERS = ["community", "impact", "champion"] as const;
export type PartnerTier = (typeof PARTNER_TIERS)[number];

export const BATCH_STATUSES = ["submitted", "approved", "declined", "scheduled", "received", "in_refurbishment", "completed"] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

export const DEVICE_STATUSES = [
  "received",
  "testing",
  "wipe_pending_verification",
  "wipe_verified",
  "refurbishing",
  "ready",
  "listed",
  "sold",
  "recycled",
] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export const DEVICE_CATEGORIES = ["laptop", "desktop", "monitor", "tablet", "accessory", "other"] as const;
export type DeviceCategory = (typeof DEVICE_CATEGORIES)[number];

export const DEVICE_CONDITIONS = ["working", "partially_working", "not_working", "unknown"] as const;
export type DeviceCondition = (typeof DEVICE_CONDITIONS)[number];

export const SALE_CHANNELS = ["in_store", "online", "b2b"] as const;
export type SaleChannel = (typeof SALE_CHANNELS)[number];

export const RECIPIENT_CATEGORIES = [
  "student",
  "newcomer",
  "senior",
  "low_income_household",
  "nonprofit",
  "small_business",
  "general",
  "undisclosed",
] as const;
export type RecipientCategory = (typeof RECIPIENT_CATEGORIES)[number];

/** Recipient categories that qualify for a Pay-It-Forward subsidy (PRD §6.6). */
export const PIF_ELIGIBLE_RECIPIENTS: readonly RecipientCategory[] = ["student", "newcomer", "senior", "low_income_household", "nonprofit"];

export const CHECKLIST_STEPS = ["hardware_test", "wipe_performed", "os_installed", "final_qa"] as const;
export type ChecklistStep = (typeof CHECKLIST_STEPS)[number];

export const EMPLOYEE_RANGES = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

export const labels = {
  tier: { community: "Community Partner", impact: "Impact Partner", champion: "Champion Partner" } satisfies Record<PartnerTier, string>,
  batchStatus: {
    submitted: "Submitted",
    approved: "Approved",
    declined: "Declined",
    scheduled: "Scheduled",
    received: "Received",
    in_refurbishment: "In refurbishment",
    completed: "Completed",
  } satisfies Record<BatchStatus, string>,
  deviceStatus: {
    received: "Received",
    testing: "Testing",
    wipe_pending_verification: "Wipe pending verification",
    wipe_verified: "Wipe verified",
    refurbishing: "Refurbishing",
    ready: "Ready",
    listed: "Listed",
    sold: "Sold",
    recycled: "Recycled",
  } satisfies Record<DeviceStatus, string>,
  category: { laptop: "Laptop", desktop: "Desktop", monitor: "Monitor", tablet: "Tablet", accessory: "Accessory", other: "Other" } satisfies Record<DeviceCategory, string>,
  condition: { working: "Working", partially_working: "Partly working", not_working: "Not working", unknown: "Not sure" } satisfies Record<DeviceCondition, string>,
  channel: { in_store: "In store", online: "Online", b2b: "B2B" } satisfies Record<SaleChannel, string>,
  recipient: {
    student: "Student",
    newcomer: "Newcomer",
    senior: "Senior",
    low_income_household: "Low-income household",
    nonprofit: "Non-profit",
    small_business: "Small business",
    general: "General buyer",
    undisclosed: "Undisclosed",
  } satisfies Record<RecipientCategory, string>,
  step: { hardware_test: "Hardware test", wipe_performed: "Data wipe performed", os_installed: "OS installed", final_qa: "Final QA" } satisfies Record<ChecklistStep, string>,
};
