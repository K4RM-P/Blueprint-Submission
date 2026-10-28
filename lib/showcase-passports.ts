/**
 * Fixed-code demo passports, seeded by supabase/seed.ts and listed on /demo and in
 * DEMO_SCRIPT.md. Each shows a different shape of the Relay Wrapped story.
 */
export const SHOWCASE_PASSPORTS = [
  { code: "FGT-WRAPPED2", label: "The full relay", description: "Donated by a named Reuse Partner, wiped, rebuilt by a named volunteer and now with a student." },
  { code: "FGT-QUEEN7WD", label: "Anonymous", description: "The donor and volunteer opted out, so the story uses kind fallbacks." },
  { code: "FGT-BENCH24Z", label: "Still on the bench", description: "Wiped and verified, being refurbished. Its next leg is coming soon." },
  { code: "FGT-PARTS4RC", label: "Recycled", description: "It failed its hardware test, so its parts live on through recycling." },
] as const;

/**
 * Public-safe facts for the landing page's featured passport preview (FGT-WRAPPED2,
 * seeded as batch B1 device 0 in supabase/seed.ts). Hard-coded so rendering the
 * preview never calls get_passport_story(), which would count a passport view (DP-06).
 * Keep in step with the seed if that device changes.
 */
export const FEATURED_PASSPORT = {
  code: SHOWCASE_PASSPORTS[0].code,
  device: "Lenovo ThinkPad T480",
  specs: ["2019", "Intel Core i5", "8 GB RAM", "Linux Mint 22"],
  donor: "Maple Ledger Accounting",
  volunteer: "Aisha",
} as const;
