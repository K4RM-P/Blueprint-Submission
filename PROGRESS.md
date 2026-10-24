# GeekLoop build progress

Log of each build stage: what was done, what was deferred, and decisions made. Newest entries at the bottom.

## Stage 0: Setup + design foundation + /styleguide
**Done:** Next.js 16.4 scaffold (pnpm, TS strict, Tailwind v4, ESLint). Dependencies from KICKOFF Stage 0 plus `motion`. Design tokens, clay/well/flat utilities, reduced-motion and print rules in `app/globals.css`. `lib/motion.ts` has the spring presets and `useMotionPrefs`. Clay components (button, card, pebble, toggle, segmented, badge coin, stamp, icon tile, chips, fields, empty state, skeleton, demo banner), liquid components (goo filter, fill, meter, capacity glasses, blob, flow line, hold-to-confirm) and SVG illustrations (laptop, vessel). `/styleguide` shows every component, with a reduced-motion toggle. Supabase server, browser and admin clients plus a `proxy.ts` role gate. `.env.example`, scripts, and Vitest + Playwright configs. GPL-3.0 LICENSE.
**Decisions:**
- `cacheComponents` is off. Nearly every page is per-user and reads cookies, so the classic dynamic rendering model is simpler and safer.
- Next 16 renamed middleware to `proxy.ts`. The Supabase session helper is still at `lib/supabase/middleware.ts`, matching the PRD folder plan.
- Only the shadcn primitives we need are kept (dialog, dropdown-menu, tooltip, sonner, button), all restyled to tokens. Inputs, selects and checkboxes are our own clay/well components; selects are native `<select>` for mobile accessibility.
- `useMotionPrefs` uses `useSyncExternalStore` with calm server snapshots, so reduced-motion users never get hydration mismatches.
