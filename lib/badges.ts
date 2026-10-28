/** Badges (PRD §9.5): pure evaluation; awarding is idempotent on (volunteer_id, badge_id). */

export type CriterionType = "final_qa" | "hardware_test" | "wipe_verified" | "open_source_install" | "manual";

export interface BadgeDef {
  slug: string;
  name: string;
  description: string;
  criterionType: CriterionType;
  threshold: number;
}

export interface VolunteerStats {
  finalQa: number;
  hardwareTests: number;
  verifiedWipes: number;
  openSourceInstalls: number;
}

export const BADGES: readonly BadgeDef[] = [
  { slug: "first-boot", name: "First Boot", description: "Completed final QA on a first device.", criterionType: "final_qa", threshold: 1 },
  { slug: "diagnostician", name: "Diagnostician", description: "Ran 10 hardware tests.", criterionType: "hardware_test", threshold: 10 },
  { slug: "data-guardian", name: "Data Guardian", description: "10 data wipes performed and verified by staff.", criterionType: "wipe_verified", threshold: 10 },
  { slug: "open-source-installer", name: "Open Source Installer", description: "Installed an open-source OS on 10 devices.", criterionType: "open_source_install", threshold: 10 },
  { slug: "bench-regular", name: "Bench Regular", description: "Completed 25 devices.", criterionType: "final_qa", threshold: 25 },
  { slug: "century", name: "Century Club", description: "Completed 100 devices.", criterionType: "final_qa", threshold: 100 },
  { slug: "mentor", name: "Mentor", description: "Recognised by staff for helping other volunteers.", criterionType: "manual", threshold: 0 },
];

export function statFor(stats: VolunteerStats, type: CriterionType): number {
  switch (type) {
    case "final_qa":
      return stats.finalQa;
    case "hardware_test":
      return stats.hardwareTests;
    case "wipe_verified":
      return stats.verifiedWipes;
    case "open_source_install":
      return stats.openSourceInstalls;
    case "manual":
      return 0;
  }
}

/** Slugs of every automatic badge the stats qualify for. */
export function evaluateBadges(stats: VolunteerStats, defs: readonly BadgeDef[] = BADGES): string[] {
  return defs.filter((b) => b.criterionType !== "manual" && statFor(stats, b.criterionType) >= b.threshold).map((b) => b.slug);
}

/** Badges to award now = qualified minus already held. Idempotent by construction. */
export function newBadges(stats: VolunteerStats, held: Iterable<string>, defs: readonly BadgeDef[] = BADGES): string[] {
  const have = new Set(held);
  return evaluateBadges(stats, defs).filter((s) => !have.has(s));
}

export function badgeProgress(stats: VolunteerStats, def: BadgeDef): { value: number; threshold: number } {
  return { value: statFor(stats, def.criterionType), threshold: def.threshold };
}

// The Skills Wallet uses the impact engine's hours formula (CI-03: one formula, everywhere).
export { estimateHours } from "./impact";
