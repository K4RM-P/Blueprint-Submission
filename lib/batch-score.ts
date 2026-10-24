import type { DeviceCategory } from "./domain";

/** Batch Value Score (PRD §9.3). Implemented once; used by the wizard, server actions and the seed. */

export interface ScoreLineItem {
  category: DeviceCategory;
  make: string;
  model: string;
  approxYear: number | null;
  quantity: number;
}

export interface ScoreWeights {
  uniformity: number;
  youth: number;
  volume: number;
  laptopShare: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = { uniformity: 0.4, youth: 0.25, volume: 0.2, laptopShare: 0.15 };
export const DEFAULT_MAX_AGE_YEARS = 8;
/** Batch size at which `volume` maxes out. */
export const FULL_VOLUME = 20;

export type ScoreLabel = "Excellent" | "Good" | "Fair" | "Low";

export interface ScoreBreakdown {
  score: number;
  label: ScoreLabel;
  uniformity: number;
  youth: number;
  volume: number;
  laptopShare: number;
  totalQuantity: number;
  avgAgeYears: number | null;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export function scoreLabel(score: number): ScoreLabel {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 25) return "Fair";
  return "Low";
}

export function computeBatchScore(
  items: ScoreLineItem[],
  opts: { weights?: ScoreWeights; maxAgeYears?: number; currentYear?: number } = {},
): ScoreBreakdown {
  const weights = opts.weights ?? DEFAULT_WEIGHTS;
  const maxAge = opts.maxAgeYears && opts.maxAgeYears > 0 ? opts.maxAgeYears : DEFAULT_MAX_AGE_YEARS;
  const year = opts.currentYear ?? new Date().getFullYear();
  const valid = items.filter((i) => Number.isFinite(i.quantity) && i.quantity > 0);
  const total = valid.reduce((s, i) => s + i.quantity, 0);

  if (total === 0) {
    return { score: 0, label: "Low", uniformity: 0, youth: 0, volume: 0, laptopShare: 0, totalQuantity: 0, avgAgeYears: null };
  }

  const byModel = new Map<string, number>();
  for (const i of valid) {
    const key = `${norm(i.make)}|${norm(i.model)}`;
    byModel.set(key, (byModel.get(key) ?? 0) + i.quantity);
  }
  const uniformity = Math.max(...byModel.values()) / total;

  // Age is averaged over devices with a known year; unknown years count as max age (conservative).
  const ageSum = valid.reduce((s, i) => s + i.quantity * (i.approxYear ? Math.max(0, year - i.approxYear) : maxAge), 0);
  const avgAge = ageSum / total;
  const youth = clamp01((maxAge - avgAge) / maxAge);

  const volume = clamp01(total / FULL_VOLUME);
  const laptops = valid.filter((i) => i.category === "laptop").reduce((s, i) => s + i.quantity, 0);
  const laptopShare = laptops / total;

  const raw = weights.uniformity * uniformity + weights.youth * youth + weights.volume * volume + weights.laptopShare * laptopShare;
  const score = Math.round(100 * Math.min(1, Math.max(0, raw)));
  return { score, label: scoreLabel(score), uniformity, youth, volume, laptopShare, totalQuantity: total, avgAgeYears: avgAge };
}

/** One plain-language tip for the weakest factor (PP-05). */
export function scoreTip(b: ScoreBreakdown): string {
  if (b.totalQuantity === 0) return "Add the devices you plan to donate to see your score.";
  if (b.score >= 75) return "Great batch. Identical, recent laptops like these are refurbished fastest.";
  const gaps: [number, string][] = [
    [DEFAULT_WEIGHTS.uniformity * (1 - b.uniformity), "Batches of 5+ identical laptops are refurbished fastest — one repeated process instead of many."],
    [DEFAULT_WEIGHTS.youth * (1 - b.youth), "Laptops under 5 years old are the most useful to students and newcomers."],
    [DEFAULT_WEIGHTS.volume * (1 - b.volume), "Grouping devices into one batch of up to 20 saves a trip and speeds intake."],
    [DEFAULT_WEIGHTS.laptopShare * (1 - b.laptopShare), "Laptops are what our community asks for most."],
  ];
  gaps.sort((a, z) => z[0] - a[0]);
  return gaps[0][1];
}

/** A line item counts as "uniform" when 5+ of the same model arrive together (PRD §3.3). */
export const UNIFORM_MIN_QUANTITY = 5;
export function isUniformQuantity(quantity: number | null | undefined): boolean {
  return (quantity ?? 0) >= UNIFORM_MIN_QUANTITY;
}
