import type { DeviceCategory, DeviceStatus } from "./domain";
import type { BreakdownSlice } from "./pricing";
import { computeImpact, deviceImpact, type ImpactFactor } from "./impact";

/**
 * Relay Wrapped (DP-02…DP-06, PIF-06): turns the public passport into an ordered
 * story. Pure and tested: the player only renders what this returns. Slides drop
 * out when their data is missing. Nothing here is invented, and private fields
 * never reach this module because get_passport_story() never returns them (DP-05).
 */

export type MilestoneKind =
  | "received"
  | "hardware_test"
  | "wipe_performed"
  | "wipe_verified"
  | "os_installed"
  | "final_qa"
  | "ready"
  | "listed"
  | "sold"
  | "recycled";

/** Exactly the public-safe fields get_passport_story() returns. */
export interface PassportStoryData {
  code: string;
  category: DeviceCategory;
  make: string;
  model: string;
  cpu: string | null;
  ram_gb: number | null;
  storage_gb: number | null;
  approx_year: number | null;
  status: DeviceStatus;
  os_installed: string | null;
  is_open_source_os: boolean | null;
  weight_kg: number | null;
  uniform: boolean;
  pif_subsidized: boolean;
  donor: { type: "partner" | "household"; name: string | null; logo_path: string | null };
  volunteer_first_name: string | null;
  timeline: { donated_at: string; wipe_verified_at: string | null; refurbished_at: string | null; ready_at: string | null; in_new_home: boolean };
  factor: { category: DeviceCategory; avg_weight_kg: number; co2e_avoided_kg_per_reuse: number; source_title: string; source_url: string | null } | null;
  price_breakdown: BreakdownSlice[];
  price_breakdown_confirmed: boolean;
  offered_at: string | null;
  milestones: { kind: MilestoneKind; at: string }[];
  steps_completed: string[];
  bench_days: number | null;
  recycled: boolean;
}

export type StoryTint = "porcelain" | "apricot" | "sky" | "butter" | "mint";
export type SlideKey =
  | "cover"
  | "origin"
  | "handoff"
  | "erased"
  | "bench"
  | "speed"
  | "software"
  | "numbers"
  | "money"
  | "why"
  | "your_turn"
  | "next_leg"
  | "recycled"
  | "finale";

export interface StorySlide {
  key: SlideKey;
  tint: StoryTint;
  /** Auto-advance after this many ms; null waits for the viewer (cover, finale). */
  durationMs: number | null;
  /** Short title for the progress bar's screen-reader label and analytics. */
  title: string;
}

export type StoryStage = "in_progress" | "ready" | "sold" | "recycled";

export interface BenchStep {
  kind: "hardware_test" | "wipe_performed" | "wipe_verified" | "os_installed" | "final_qa";
  label: string;
  at: string | null;
}

export interface PassportStory {
  code: string;
  deviceName: string;
  year: number | null;
  /** e.g. "Laptop · 2019 · Intel Core i5-8350U · 8 GB RAM · 256 GB". */
  specs: string[];
  stage: StoryStage;
  donor: { label: string; named: boolean; household: boolean };
  volunteer: { label: string; named: boolean };
  dates: { offered: string | null; received: string; wipeVerified: string | null; ready: string | null; sold: string | null; recycled: string | null };
  benchSteps: BenchStep[];
  benchDays: number | null;
  daysToReady: number | null;
  os: { name: string; openSource: boolean } | null;
  impact: { kg: number; co2eKg: number | null; litresOfWater: number; factorsToVerify: boolean };
  pifSubsidized: boolean;
  priceBreakdown: BreakdownSlice[];
  priceBreakdownConfirmed: boolean;
  /** Which leg of three the device is on (1 = business, 2 = bench, 3 = next owner). */
  leg: 1 | 2 | 3;
  slides: StorySlide[];
}

export const ANON_BUSINESS = "a Toronto business";
export const ANON_HOUSEHOLD = "a community member";
export const ANON_VOLUNTEER = "an FGT volunteer";

const DAY = 86_400_000;

/** Whole days between two instants, never negative; anything over a few hours counts as a day. */
export function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.max(1, Math.round(ms / DAY));
}

export function stageFor(status: DeviceStatus): StoryStage {
  if (status === "sold") return "sold";
  if (status === "recycled") return "recycled";
  if (status === "ready" || status === "listed") return "ready";
  return "in_progress";
}

const STEP_LABELS: Record<BenchStep["kind"], string> = {
  hardware_test: "Hardware tested",
  wipe_performed: "Drive wiped",
  wipe_verified: "Wipe verified",
  os_installed: "OS installed",
  final_qa: "Final QA",
};
const STEP_ORDER: BenchStep["kind"][] = ["hardware_test", "wipe_performed", "wipe_verified", "os_installed", "final_qa"];

const BASE: Record<SlideKey, Omit<StorySlide, "key">> = {
  cover: { tint: "porcelain", durationMs: null, title: "This laptop has a story" },
  origin: { tint: "apricot", durationMs: 6000, title: "Its first job" },
  handoff: { tint: "porcelain", durationMs: 6000, title: "The handoff" },
  erased: { tint: "sky", durationMs: 6500, title: "Every byte erased" },
  bench: { tint: "butter", durationMs: 7500, title: "Back to life" },
  speed: { tint: "mint", durationMs: 5500, title: "Ready, fast" },
  software: { tint: "porcelain", durationMs: 5500, title: "Open source" },
  numbers: { tint: "mint", durationMs: 7000, title: "The numbers" },
  money: { tint: "porcelain", durationMs: 8500, title: "Where your money goes" },
  why: { tint: "sky", durationMs: 9000, title: "Why it isn't free" },
  your_turn: { tint: "apricot", durationMs: 6000, title: "Your turn" },
  next_leg: { tint: "apricot", durationMs: 6000, title: "The next leg" },
  recycled: { tint: "mint", durationMs: 7000, title: "Recycled responsibly" },
  finale: { tint: "porcelain", durationMs: null, title: "Your laptop's story" },
};

function slide(key: SlideKey): StorySlide {
  return { key, ...BASE[key] };
}

export function buildPassportStory(p: PassportStoryData): PassportStory {
  const stage = stageFor(p.status);
  const at = (kind: MilestoneKind) => p.milestones.find((m) => m.kind === kind)?.at ?? null;

  const household = p.donor.type === "household";
  const donorName = household ? null : p.donor.name;
  const donor = { label: donorName ?? (household ? ANON_HOUSEHOLD : ANON_BUSINESS), named: Boolean(donorName), household };
  const volunteer = { label: p.volunteer_first_name ?? ANON_VOLUNTEER, named: Boolean(p.volunteer_first_name) };

  const received = at("received") ?? p.timeline.donated_at;
  const wipeVerified = p.timeline.wipe_verified_at ?? at("wipe_verified");
  const ready = p.timeline.ready_at ?? at("ready");
  const sold = at("sold");
  const recycledAt = at("recycled");

  const benchSteps: BenchStep[] = STEP_ORDER.map((kind) => ({ kind, label: STEP_LABELS[kind], at: kind === "wipe_verified" ? wipeVerified : at(kind) }));
  const anyStep = benchSteps.some((s) => s.at);
  const daysToReady = ready ? daysBetween(received, ready) : null;

  const factors: ImpactFactor[] = p.factor
    ? [{ category: p.factor.category, avgWeightKg: Number(p.factor.avg_weight_kg), co2eAvoidedKgPerReuse: Number(p.factor.co2e_avoided_kg_per_reuse) }]
    : [];
  // Same engine as every other page (CI-03): recycling diverts weight but avoids no manufacturing CO₂e.
  const impact =
    stage === "recycled"
      ? (() => {
          const t = computeImpact([{ category: p.category, outcome: "recycled", uniform: p.uniform, refurbished: false, weightKg: p.weight_kg }], factors);
          return { kg: t.kgDiverted, co2eKg: null };
        })()
      : deviceImpact({ category: p.category, outcome: "reused", uniform: p.uniform, refurbished: true, weightKg: p.weight_kg }, factors);

  const os = p.os_installed ? { name: p.os_installed, openSource: Boolean(p.is_open_source_os) } : null;
  const leg: 1 | 2 | 3 = stage === "sold" ? 3 : stage === "recycled" ? 2 : anyStep || stage === "ready" ? 2 : 1;

  const keys: SlideKey[] = ["cover", "origin", "handoff"];
  if (wipeVerified && stage !== "recycled") keys.push("erased");
  if (anyStep) keys.push("bench");
  if (stage === "recycled") {
    keys.push("recycled");
    if (impact.kg > 0) keys.push("numbers");
  } else {
    if (daysToReady !== null) keys.push("speed");
    if (os) keys.push("software");
    if (impact.kg > 0) keys.push("numbers");
    if (p.price_breakdown.length > 0) keys.push("money");
    keys.push("why");
    keys.push(stage === "in_progress" ? "next_leg" : "your_turn");
  }
  keys.push("finale");

  const specs = [labels(p.category), p.approx_year ? `${p.approx_year}` : null, p.cpu, p.ram_gb ? `${p.ram_gb} GB RAM` : null, p.storage_gb ? `${p.storage_gb} GB` : null].filter(
    (x): x is string => Boolean(x),
  );

  return {
    code: p.code,
    deviceName: `${p.make} ${p.model}`,
    year: p.approx_year,
    specs,
    stage,
    donor,
    volunteer,
    dates: { offered: household ? null : p.offered_at, received, wipeVerified, ready, sold, recycled: recycledAt },
    benchSteps,
    benchDays: p.bench_days,
    daysToReady,
    os,
    impact: { kg: impact.kg, co2eKg: impact.co2eKg, litresOfWater: impact.kg, factorsToVerify: p.factor?.source_title === "TO VERIFY" || !p.factor },
    pifSubsidized: p.pif_subsidized,
    priceBreakdown: p.price_breakdown,
    priceBreakdownConfirmed: p.price_breakdown_confirmed,
    leg,
    slides: keys.map(slide),
  };
}

function labels(c: DeviceCategory): string {
  return { laptop: "Laptop", desktop: "Desktop", monitor: "Monitor", tablet: "Tablet", accessory: "Accessory", other: "Device" }[c];
}

/** "May 18" in Toronto time. Mono-set in the UI. */
export function storyDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "America/Toronto" });
}

/** Clamp a deep-link `?s=` value (1-based) to a slide index. */
export function slideIndexFromParam(raw: string | string[] | undefined, count: number): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(v ?? "", 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 1), count) - 1;
}

/** Share copy. No private fields; the donor appears only when opted in. */
export function shareText(s: PassportStory): string {
  if (s.stage === "recycled") return `This ${s.deviceName} was donated to Free Geek Toronto and recycled responsibly. Every device deserves a second leg. Pass it on.`;
  if (s.stage === "sold") return "My laptop has had 3 lives. Every device deserves a second leg. Pass it on.";
  return `This ${s.deviceName} is on its second leg at Free Geek Toronto. Every device deserves a second leg. Pass it on.`;
}

export interface CardFact {
  label: string;
  value: string;
}

/** The finale card's facts (story card, share images). Public-safe only: opted-in names or the kind fallbacks. */
export function cardFacts(s: PassportStory): CardFact[] {
  const facts: CardFact[] = [
    { label: "Donated by", value: s.donor.label },
    { label: s.stage === "recycled" ? "Tested by" : s.stage === "in_progress" ? "On the bench with" : "Refurbished by", value: s.volunteer.label },
  ];
  if (s.daysToReady !== null) facts.push({ label: "Ready in", value: `${s.daysToReady} day${s.daysToReady === 1 ? "" : "s"}` });
  if (s.impact.kg > 0) facts.push({ label: s.stage === "recycled" ? "Recycled, not landfilled" : "Kept from landfill", value: `${s.impact.kg} kg` });
  if (s.os) facts.push({ label: "Running", value: s.os.name });
  return facts.slice(0, 6);
}

export function legLabel(s: PassportStory): string {
  if (s.stage === "recycled") return "Recycled";
  return `Leg ${s.leg} of 3`;
}
