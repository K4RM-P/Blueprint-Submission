/**
 * Fixed-code demo passports, seeded by supabase/seed.ts and listed on /demo and in
 * DEMO_SCRIPT.md. Each shows a different shape of the Relay Wrapped story.
 */
export const SHOWCASE_PASSPORTS = [
  { code: "FGT-WRAPPED2", label: "The full relay", description: "Named donor and volunteer, sold, with a Pay-It-Forward subsidy." },
  { code: "FGT-QUEEN7WD", label: "Anonymous", description: "The donor and volunteer opted out, so the story uses kind fallbacks." },
  { code: "FGT-BENCH24Z", label: "Still on the bench", description: "Wiped and verified, being refurbished. Its next leg is coming soon." },
  { code: "FGT-PARTS4RC", label: "Recycled", description: "It failed its hardware test, so its parts live on through recycling." },
] as const;
