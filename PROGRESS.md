# GeekLoop build progress

Log of each build stage: what was done, what was deferred, and decisions made. Newest entries at the bottom.

## Stage 0: Setup + design foundation + /styleguide
**Done:** Next.js 16.4 scaffold (pnpm, TS strict, Tailwind v4, ESLint). Dependencies from KICKOFF Stage 0 plus `motion`. Design tokens, clay/well/flat utilities, reduced-motion and print rules in `app/globals.css`. `lib/motion.ts` has the spring presets and `useMotionPrefs`. Clay components (button, card, pebble, toggle, segmented, badge coin, stamp, icon tile, chips, fields, empty state, skeleton, demo banner), liquid components (goo filter, fill, meter, capacity glasses, blob, flow line, hold-to-confirm) and SVG illustrations (laptop, vessel). `/styleguide` shows every component, with a reduced-motion toggle. Supabase server, browser and admin clients plus a `proxy.ts` role gate. `.env.example`, scripts, and Vitest + Playwright configs. GPL-3.0 LICENSE.
**Decisions:**
- `cacheComponents` is off. Nearly every page is per-user and reads cookies, so the classic dynamic rendering model is simpler and safer.
- Next 16 renamed middleware to `proxy.ts`. The Supabase session helper is still at `lib/supabase/middleware.ts`, matching the PRD folder plan.
- Only the shadcn primitives we need are kept (dialog, dropdown-menu, tooltip, sonner, button), all restyled to tokens. Inputs, selects and checkboxes are our own clay/well components; selects are native `<select>` for mobile accessibility.
- `useMotionPrefs` uses `useSyncExternalStore` with calm server snapshots, so reduced-motion users never get hydration mismatches.

## Stage 1: Database, RLS, RPCs, seed
**Done:** Migrations in `supabase/migrations/`: schema (all PRD §11 tables and enums, plus `account_invites` for AUTH-04), RLS (PRD §12), logic (device and batch status-machine triggers, auto events, staff-only wipe verification, certificate guard, batch auto-complete, a fund guard that blocks negative balances, append-only `device_events`), and storage buckets (logos public; certificates and reports private). RPCs: `get_passport`, `public_impact_totals`, `verify_certificate`, `partner_wall`, `public_settings`, `public_volunteer_profile`, `public_fund_summary`, `log_checker`, `partner_devices`, `week_loads`, `bench_queue`, `claim_next_device` (SKIP LOCKED), `complete_step`, `my_volunteer_stats`. Pure modules with tests: status-machine, passport-code, certificate-number, batch-score, capacity, impact, badges, ledger, pricing, checker. Seed is idempotent and deterministic (same passport codes on every run). RLS tests in `tests/unit/rls.test.ts` run against the live project.
**Record counts after seed:** organizations 8, profiles 8, batches 14, line items 18, devices 109 (58 sold), device_events about 1,130, certificates 2, badges 7, volunteer_badges 18, fund_transactions 45, membership_payments 4, impact_factors 6, checker_logs 64.
**Decisions:**
- Helper functions are named `auth_role()` and `auth_org_id()` instead of `current_role()`, which is a reserved SQL keyword.
- Partners never select `devices` directly. They use `partner_devices()`, which omits `wipe_report_ref` and shows the recipient category only once a device is sold.
- Staff and volunteer accounts are created as **invites** (`account_invites`). Signing up with an invited email gets that role, so no service-role key is ever used for user actions.
- Volunteer checklist writes go through `complete_step()`, a security-definer RPC that checks the device is assigned to the caller. OS install and final QA may be recorded while a wipe awaits verification (flow F3 order). Once staff verify the wipe, the device advances through refurbishing → ready, and each transition is still logged.
- Status-change events are written by a trigger, so no code path can change status without leaving a chain-of-custody row.
- `public_impact_totals()` returns grouped raw rows. The impact formula lives only in `lib/impact.ts` (CI-03).
- Email confirmation is turned off on this demo Supabase project (`supabase config push`) so partner self-signup works without an inbox. Re-enable it for production.
**Known risk:** `value_score` is computed in the server action. A partner calling the REST API directly could store a fake score, which only affects queue ordering.
