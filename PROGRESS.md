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

## Stage 2: Auth, roles, shells, /demo
**Done:** AUTH-01 (email/password sign-in and sign-up), AUTH-02 (roles), AUTH-03 (partner sign-up creates the org through a DB trigger), AUTH-04 (staff/volunteer accounts via invites, signed up at `/signup?invite=1`), AUTH-05 (`proxy.ts` role gate plus `requireRole` in layouts), AUTH-06 (`/demo` one-click sign-in and the banner on every page), AUTH-07 (P1: forgot/reset password via `/auth/callback`). Public shell (header, footer with the honest FGT note), app shells with a sliding clay nav pill and a mobile clay dock, loading/error/not-found states. Playwright: each demo role signs in, cross-role redirect, anonymous `next=` redirect, wrong-password message, sign-out.
**Decisions:**
- The demo password is shown only on `/demo` in demo mode, as the PRD specifies. Demo sign-in happens server-side with `DEMO_PASSWORD`, so it never reaches the browser bundle.
- Public pages use `getClaims()` (cheap) for the header's "Dashboard" link, which points to `/dashboard` and redirects by role.
- Demo cards: the whole card is the press target, not three primary buttons, to keep "one primary per view" (§12.10).
- Until Stage 7 builds the remaining public routes, e2e ignores 404 link-prefetch console errors (`tests/e2e/helpers.ts`).

## Stage 3: Partner Portal
**Done:** PP-01 (`/become-a-partner`), PP-02 (onboarding at `/partner/settings?welcome=1` with logo upload), PP-03/04/05 (4-step wizard: live Batch Value Score meter, capacity glasses, pickup locked for Community, server recomputes the score), PP-06/07 (batch list and detail, status timeline, device journeys table), PP-13 P1 (org settings, opt-ins, colleague invites). Edit and withdraw only while `submitted`. Dashboard v1 (impact so far, pebbles, recent batches, upgrade card for Community).
**Decisions:** Added migration 0005 with `approved_at`/`scheduled_at`/`declined_at` so the timeline shows real dates. The shared-element card→detail morph is deferred: Next route transitions make it costly for little gain.
**UI direction change (from user feedback):** a bit of clay-glassmorphism. `.glass` / `.clay-glass` utilities, frosted floating sidebar, header, dock and dialogs, static ambient mint/apricot light on the canvas, and mono eyebrows. **Testing is now lean:** typecheck, lint and build on every stage; Playwright only for key flows.

## Stage 4: Staff Console
**Done:** OPS-01 (overview: pebbles, pipeline chart, 4-week capacity glasses, approvals list, impact via lib/impact, checker outcomes), OPS-02 (queue sorted by score with filters), OPS-03 (approve, decline with reason, schedule with capacity warning, next-open-week suggestion and override note), OPS-04 (receive + bulk-add devices with unique passport codes, then a serial/spec grid), OPS-05 (device table: search, filters, multi-select, dark glass bulk bar, `/` and `v` shortcuts), OPS-06 (device detail: specs, chain of custody, assign, price, record sale, recycle, notes), OPS-07 (staff-only verify dialog, single and bulk; devices with OS/QA already done auto-advance), OPS-09 (Avery 5160 30-up QR label sheet with print CSS), OPS-10 (partners and manual tier change), OPS-12 (settings: capacity, weights, breakdown with a sum-to-100 check and a confirmed toggle, impact factors with sources, accepted items), OPS-13 (household intake dialog), OPS-14 P1 (CSV export with formula-injection guard).
**Tests:** e2e F2 (approve, schedule, receive 20, bulk verify) plus F1 passing.
**Decisions:** The PIF subsidy field is already live in the sale dialog: it appears only for digital-inclusion recipients and is checked against the fund balance (PIF-03). `j/k` row navigation was skipped; `/` and `v` are kept.

## Stage 5: Volunteer Bench & Skills Wallet
**Done:** VW-01 (bench with a floating "Claim next device"; atomic claim RPC sorted by score), VW-02/03 (four 72px+ tiles; the wipe uses hold-to-confirm with a keyboard alternative of Enter twice; the wipe moves the device to `wipe_pending_verification`), VW-04 (wallet: stats, hours estimate from settings, passports I'm on), VW-05 P1 (auto badges with the coin-drop celebration, idempotent, RLS re-checks the criteria; `syncBadges` on wallet open catches Data Guardian after staff verify), VW-06 P1 (`/v/[handle]`), VW-07 (privacy, default off), OPS-11 P1 (staff volunteers page: invite volunteer/staff, list, award Mentor).
**Tests:** e2e F3 at 360px. Claim, then hardware test unlocks Diagnostician, wipe via keyboard hold-confirm, the OS install unlocks Open Source Installer, then QA.
