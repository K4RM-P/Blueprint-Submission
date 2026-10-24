# GeekLoop — Claude Code Kickoff Prompt

> **How to use this file**
> 1. Create an empty folder, run `git init`, and put `PRD.md` and this file in it.
> 2. Create a free Supabase project (supabase.com) and a Vercel account. Keep the Supabase URL, anon key and service role key handy.
> 3. Open Claude Code in the folder and paste **everything in Part A** as your first message. Claude Code will do Stage 0 and stop.
> 4. For each later stage, paste the matching short prompt from **Part C**. Review, test in the browser, commit, then move on.
> 5. If a session gets long or confused, start a fresh one and paste the **Resume prompt** from Part C.
>
> Remember: the competition requires you to disclose AI use on the submission form. Keep a short log of how you used Claude Code.

---

## PART A — Paste this as your first message

You are the lead engineer building **GeekLoop**, a production-quality web app for **Free Geek Toronto**, as our team's entry in the FUSE Blueprint 2026 hackathon. We are a team of two high-school students. The deadline is **Friday Oct 30, 2026, 11:59 PM ET**; we want the app feature-complete by **Thursday morning**.

**Read `PRD.md` and `UI_UX_DESIGN.md` in full before doing anything.** The PRD is the single source of truth for *what* to build; `UI_UX_DESIGN.md` is the single source of truth for *how it looks, moves and feels* (it supersedes PRD §15). Every UI stage must pass the Taste Checklist in `UI_UX_DESIGN.md` §14, and the checkpoint report must confirm it. This file (`KICKOFF_PROMPT.md`) contains the staged build plan in Part B. Requirement IDs in the PRD (e.g. `PP-03`, `OPS-07`) must be referenced in commit messages and tests.

### How we work together (rules of engagement)

1. **Work strictly one stage at a time.** Do only the stage I ask for. At the end of each stage, stop and give me a checkpoint report (see format below). Do not start the next stage until I say so.
2. **Plan before coding.** At the start of each stage, post a short plan (files you'll create/change, any new dependencies, any questions). If there are no blocking questions, proceed immediately — do not wait for approval on routine choices.
3. **Scope discipline.** Build exactly what the PRD specifies for the stage. Don't add features, pages or libraries that aren't in the PRD. If you think something is missing or wrong in the PRD, say so in the checkpoint report instead of silently changing scope.
4. **P0 before P1.** Never start P1 work while any P0 item in the current stage is incomplete.
5. **Quality bar.** TypeScript strict, no `any` unless justified in a comment. Every server action/route validates input with Zod. Every page has loading, empty and error states. No console errors. Accessible (labels, focus states, keyboard navigation, contrast).
6. **Security bar.** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Use the service role only in seed scripts and payment webhooks. Enforce permissions with RLS **and** in server actions. Never put real secrets in code or commits. Stripe: **test-mode keys only** (`sk_test_…`); refuse to use live keys.
7. **Business logic lives in pure, tested modules** in `lib/` (batch score, capacity, impact, status machine, badges, codes). UI and server actions call them; never duplicate formulas.
8. **Verify, don't assume.** After building, run typecheck, lint and tests, and actually exercise the feature (dev server + browser or Playwright). Report what you verified and how.
9. **Commit at the end of every stage** with a message like `stage-3: partner batch wizard (PP-03, PP-04, PP-05)`. Small commits within a stage are fine.
10. **Ask me before:** deleting files you didn't create, changing the database schema outside a new migration, adding a paid service, or changing anything in `PRD.md`.
11. **Keep `CLAUDE.md` current.** It is your memory between sessions: stack, commands, conventions, current stage, known issues, decisions made.
12. **Explain briefly.** We're students and need to present this — when you make a non-obvious technical decision, add a one-line "why" in the checkpoint report so we can explain it to judges.

### Checkpoint report format (end of every stage)
```
## Stage N checkpoint
Done: [requirement IDs completed]
Not done / deferred: [IDs + reason]
Verified: [commands run, flows tested, results]
How to try it: [URLs + demo account to use + steps]
Decisions & why: [short bullets]
Risks / questions for us: [bullets]
Next stage: [name]
```

### Now do Stage 0 only (from Part B below), then stop with a checkpoint report.

---

## PART B — Build stages

### Stage 0 — Project setup & conventions (P0)

**Goal:** a running, deployable skeleton with all tooling and conventions in place.

Tasks:
1. Scaffold Next.js (latest stable, App Router, TypeScript, Tailwind, ESLint, `src/`-less layout per PRD §14) with **pnpm**.
2. Install and init shadcn/ui; add base components: button, card, input, label, textarea, select, checkbox, radio-group, dialog, sheet, dropdown-menu, table, badge, tabs, toast/sonner, form, skeleton, progress, calendar, avatar, separator, tooltip.
3. Install: `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`, `recharts`, `qrcode`, `@react-pdf/renderer`, `date-fns`, `lucide-react`. Dev: `vitest`, `@vitest/coverage-v8`, `@playwright/test`, `prettier`, `supabase` CLI, `tsx`.
4. Create the folder structure from PRD §14 with placeholder `index` files where useful.
5. Design foundation per `UI_UX_DESIGN.md` §3–§7 and §13: install `motion`; load Bricolage Grotesque, Geist and Geist Mono via `next/font`; put all color, radius, spacing and clay tokens plus the `clay`/`clay-sm`/`well`/`flat` utilities in `app/globals.css`; create `lib/motion.ts` (spring presets + reduced-motion/low-power/expression helpers); restyle shadcn components to the tokens; build the `components/clay/` and `components/liquid/` primitives and a `/styleguide` route showing every token and component in every state. This styleguide is the foundation — later stages reuse it.
6. `lib/supabase/server.ts`, `client.ts`, `middleware.ts` using `@supabase/ssr` patterns for the current Next.js version.
7. `.env.example` with every variable from PRD §14 and comments; `.gitignore` covering `.env*.local`.
8. Scripts in `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `db:push`, `db:types` (generate `lib/database.types.ts`), `seed`.
9. Vitest and Playwright configs; one trivial passing test in each.
10. A placeholder home page with the GeekLoop name and the demo-environment banner component (shown when `NEXT_PUBLIC_DEMO_MODE=true`).
11. `LICENSE` (GPL-3.0) and a short `README.md` stub.
12. Create **`CLAUDE.md`** with: project summary (3 lines), stack, commands, folder conventions, coding rules from Part A, "current stage", and a "decisions log" section.

**Acceptance:** `pnpm dev` runs; `pnpm typecheck`, `pnpm lint`, `pnpm test` pass; home page renders with banner in demo mode; `/styleguide` shows every clay and liquid component working, including reduced-motion mode; `CLAUDE.md` exists. Tell me exactly which env values to fill in and how to link the Supabase CLI to my hosted project (`supabase login`, `supabase link --project-ref …`).

---

### Stage 1 — Database: schema, RLS, RPCs, seed (P0)

**Goal:** the complete data layer from PRD §9, §11, §12, §16.

Tasks:
1. Migration `0001_schema.sql`: all enums and tables from PRD §11 with FKs, `check` constraints, sensible indexes (status columns, FKs, `passport_code`, `certificate_number`), `updated_at` triggers where useful.
2. Migration `0002_rls.sql`: enable RLS on every table; policies per PRD §12. Helper SQL functions `current_role()` and `current_org_id()` (security definer, stable). `device_events`: insert/select only — **no update/delete policies**.
3. Migration `0003_logic.sql`:
   - Trigger enforcing the device status machine (PRD §9.1): reject invalid transitions; reject reaching `ready`/`listed`/`sold` without `wipe_verified_at`; only staff can set `wipe_verified`.
   - Trigger to auto-create a `profiles` row on `auth.users` insert (role from user metadata, default `partner`).
   - Public-safe security-definer RPCs: `get_passport(code)`, `public_impact_totals()`, `verify_certificate(number)`, `partner_wall()` — return only the fields allowed in PRD §7.5/§7.6; `get_passport` increments `passport_views`.
4. Storage buckets: `logos` (public read), `certificates` (private; partner can read own org's files; staff all), `reports` (private).
5. Pure modules with full unit tests: `lib/status-machine.ts` (mirrors the SQL rules for UI), `lib/passport-code.ts` (8-char unambiguous alphabet `23456789ABCDEFGHJKMNPQRSTUVWXYZ`, prefix `FGT-`), `lib/certificate-number.ts` (`GL-YYYY-NNNN`).
6. `supabase/seed.ts` (run with `tsx`, uses service role): idempotent reset + seed exactly per PRD §16, including realistic 6-month event timelines generated through valid status transitions. Demo users created via the Auth admin API with `DEMO_PASSWORD` from env. All names fictional.
7. Generate types into `lib/database.types.ts`.
8. Tests in `tests/unit/rls.test.ts` (or a script) that sign in as anon / partner A / partner B / volunteer / staff against the dev project and assert the security checks in PRD §17.

**Acceptance:** `pnpm db:push` and `pnpm seed` succeed and are re-runnable; RLS tests pass; RPCs return correct, privacy-safe data; checkpoint report lists record counts per table.

---

### Stage 2 — Auth, roles, layouts, demo mode (P0)

**Goal:** everyone can sign in and lands in the right place. (AUTH-01…06)

Tasks:
1. `/login` and `/signup` (partner self-signup only; collects name, email, password, organization name → creates org + links profile as owner, per AUTH-03).
2. Middleware route protection by role (AUTH-05): `/partner/*` partner, `/staff/*` staff, `/volunteer/*` volunteer; wrong role → own dashboard; anon → `/login?next=…`.
3. Three app shells (partner, staff, volunteer): responsive sidebar/top nav, user menu, sign-out; public shell with header/footer (links: Partners, Impact, About, Become a Partner, Can I Donate?, Sign in).
4. `/demo` page (only when demo mode): three cards "Explore as a Partner / Staff / Volunteer" with one-click sign-in and a one-line description of what to try. Demo banner on all pages.
5. Placeholder dashboard pages for each role so navigation works end-to-end.
6. Playwright: each demo role can sign in and reaches its dashboard; cross-role redirect works.

**Acceptance:** all three demo logins work; role protection verified; responsive at 360 px.

---

### Stage 3 — Partner Portal (P0: PP-01…PP-09 minus dashboard charts done in Stage 6; P1: PP-13)

**Goal:** a business can become a partner and submit a great batch.

Tasks:
1. `lib/batch-score.ts` (PRD §9.3) and `lib/capacity.ts` (PRD §9.4) with thorough unit tests (edge cases: empty batch, single device, all identical, all old).
2. `/become-a-partner` public page (PP-01): value proposition, how it works (4 steps), tier table (PRD §6.1), data-security explanation, FAQ (incl. "Is my membership a donation? No tax receipts."), CTA.
3. Onboarding (PP-02) after signup if org profile incomplete; logo upload to `logos` bucket.
4. **Batch wizard** `/partner/batches/new` (PP-03, PP-04, PP-05): 4 steps with progress indicator, React Hook Form + Zod per step, add/remove line items, live Batch Value Score meter with tips, capacity calendar (next 8 weeks; Full weeks disabled; pickup option disabled for Community tier with upsell note), review step, submit via server action that recomputes the score server-side.
5. Batch list and detail (PP-06, PP-07): status timeline component (reusable — PRD §15 signature component), line items, device journeys table (status, recipient category once sold), certificate download button placeholder (wired in Stage 6).
6. Partner dashboard v1: summary cards (batches, devices received, devices reused) + recent batches. (Charts come in Stage 6.)
7. Org settings (PP-13, P1): profile, logo, opt-ins.
8. E2E: flow F1 from PRD §8.

**Acceptance:** F1 works end-to-end on seed data; partner cannot see another org's data; edit allowed only while `submitted`.

---

### Stage 4 — Staff Operations Console (P0: OPS-01…OPS-10, OPS-12, OPS-13; P1: OPS-14)

**Goal:** Marcus can run intake, refurbishment tracking and compliance in minutes.

Tasks:
1. Overview `/staff` (OPS-01): stat cards, capacity chart for next 4 weeks (Recharts), pipeline-by-status bar, pending approvals list.
2. Batch queue (OPS-02) sorted by score with filters; batch detail with actions (OPS-03): approve, decline (reason dialog), schedule (capacity warning + suggest next open week + override note).
3. **Receive batch** (OPS-04): per line item "Add N devices" → creates devices with generated passport codes in one transaction; editable grid for serials/specs afterwards; household intake form (OPS-13).
4. Device table (OPS-05) with search, filters, multi-select bulk actions (status change via status machine, assign volunteer, **bulk verify wipe** for staff).
5. Device detail (OPS-06): specs, journey timeline from `device_events`, assign volunteer, set price, record sale dialog (date, channel, recipient category, optional PIF subsidy — hide subsidy field until Stage 8), recycle with reason.
6. Wipe verification (OPS-07): dialog requiring method + reference ID.
7. QR label sheet `/staff/labels` (OPS-09): select devices → printable page (CSS `@media print`) with QR (to `${SITE_URL}/p/{code}`), code, model; fits a standard 30-up label sheet.
8. Partners list (OPS-10) with manual tier change; Settings page (OPS-12) editing every settings field and impact factors (with source fields) — validate breakdown sums to 100.
9. CSV export (OPS-14, P1).
10. E2E: flow F2 and the "verify wipes" part of F4 (certificate issuance comes in Stage 6).

**Acceptance:** F2 works; invalid transitions are blocked with a clear message; label sheet prints correctly (check print preview); every action writes `device_events`.

---

### Stage 5 — Volunteer Bench & Skills Wallet (P0: VW-01…VW-04, VW-07; P1: VW-05, VW-06, OPS-11)

**Goal:** volunteers do the data entry at the bench, and see their impact grow.

Tasks:
1. `/volunteer` My Bench (VW-01): assigned devices; "Claim next device" (highest batch score first; atomic claim to avoid two volunteers taking the same device).
2. Device checklist `/volunteer/devices/[id]` (VW-02, VW-03): four big, mobile-friendly steps; wipe step requires sanitization report reference; OS step defaults to an open-source OS with a toggle; each step writes an event; completing wipe → `wipe_pending_verification`.
3. `lib/badges.ts` (PRD §9.5): pure `evaluateBadges(stats)` + idempotent award server function called after each step; unit tests.
4. Skills Wallet `/volunteer/wallet` (VW-04, VW-05): stats, hours estimate (from settings), badge grid (locked/unlocked with progress), list of passports I'm credited on; unlock toast/confetti-lite animation (respect `prefers-reduced-motion`).
5. Privacy settings (VW-07) and public profile `/v/[handle]` (VW-06, P1).
6. Staff volunteer management (OPS-11, P1): create volunteer account, list, award Mentor badge.
7. E2E: flow F3.

**Acceptance:** F3 works on a phone-width viewport; volunteer cannot verify wipes or see private fields of other volunteers' devices; badges award exactly once.

---

### Stage 6 — Certificates & Impact Engine (P0: OPS-08, CI-01…CI-04, PP-08, PP-09)

**Goal:** proof of data security and visible impact for partners.

Tasks:
1. `lib/impact.ts` (PRD §9.6): pure functions over device lists + factors; unit tests; used everywhere.
2. Certificate issuance (OPS-08, CI-01): button enabled only when all batch devices are verified/recycled; server action assigns number, renders PDF with `@react-pdf/renderer` (contents exactly per CI-01, includes QR to `/verify/[number]`), uploads to `certificates` bucket, creates row, sets batch `completed` when rules in PRD §9.2 are met.
3. Partner certificate download (PP-08) via signed URL.
4. `/verify/[certNumber]` (CI-02) public page.
5. Partner impact dashboard (PP-09): stat cards + charts (devices over time, recipients by category, reused vs recycled); Community tier sees summary cards + upgrade prompt.
6. E2E: rest of F4 and F6 (without LinkedIn card).

**Acceptance:** certificate PDF opens and looks professional; verification page works; impact numbers are identical on partner dashboard, staff overview and (next stage) public pages.

---

### Stage 7 — Device Passport & public site (P0: DP-01…DP-11)

**Goal:** the public face — this is the most-shown part of the demo video, so make it beautiful.

Tasks:
1. `/p/[code]` (DP-02…DP-06, DP-10, DP-11): server-rendered via `get_passport`; hero with device name and "Refurbished by Free Geek Toronto"; journey timeline; donor and volunteer attribution respecting opt-ins; impact stats; open-source software note; "Where your money goes" breakdown (with "Illustrative" label until `price_breakdown_confirmed`); "Why isn't this free?" and Free Geek network independence notes (DP-03, DP-04); print styles; friendly 404.
2. Landing `/` (DP-01): hero, live impact counters (`public_impact_totals`), how the loop works (flywheel graphic in SVG/CSS), Partner Wall preview, CTAs for each audience.
3. `/partners` (DP-07), `/about` (DP-08), `/impact` with methodology and citations (DP-09).
4. SEO basics: metadata per page, Open Graph image for passport pages.
5. Lighthouse pass on `/` and a passport page; fix issues to reach ≥ 90 performance and accessibility.
6. E2E: F5; assert serial number and `wipe_report_ref` never appear in passport HTML.

**Acceptance:** passport looks great at 360 px and desktop; privacy assertions pass; Lighthouse targets met.

---

### Stage 8 — Pay-It-Forward & memberships (P1: PIF-01…PIF-06, PP-12)

**Goal:** mission-aligned revenue flows, demonstrable without real money.

Tasks:
1. `lib/payments/provider.ts` interface (`createCheckout`, `handleWebhook`), `mock.ts` (instant success page) and `stripe.ts` (Checkout Sessions, test mode; refuse to start if key isn't `sk_test_`). Selected by `PAYMENT_PROVIDER`.
2. `/pay-it-forward` (PIF-01) and a mock store checkout-confirmation page showing the round-up widget (PIF-02).
3. Webhook route `/api/payments/webhook` (Stripe signature verified) → `fund_transactions` / `membership_payments`.
4. Fund ledger `/staff/fund` (PIF-03); enable subsidy field in record-sale dialog with balance check; passport subsidy note (PIF-06).
5. Membership page and upgrade flow (PP-12, PIF-04): updates tier and dates on success.
6. Unit tests for ledger balance rules; E2E with mock provider.

**Acceptance:** full flow works with `PAYMENT_PROVIDER=mock` and (if keys provided) Stripe test mode; balance never negative.

---

### Stage 9 — Household checker, reports & LinkedIn card (P1: HC-01…HC-04, PP-10, PP-11)

Tasks:
1. `/donate` checker (HC-01…HC-04): friendly step UI, rules from `settings.accepted_items`, three outcomes, business redirect to partner program, anonymous logging; staff chart of outcomes on overview.
2. Annual impact report PDF (PP-10) with partner logo, stats, charts rendered as simple PDF graphics, methodology footnote.
3. LinkedIn impact card (PP-11) via `next/og` at `/api/og/partner/[orgId]` + share button + suggested post text the partner can copy.

**Acceptance:** each outcome path tested; report PDF and card render with seed data.

---

### Stage 10 — Hardening, tests, deploy, README (P0)

Tasks:
1. Full test run; fill gaps so every flow F1–F6 has an E2E test and every `lib/` module has unit tests.
2. Accessibility pass (axe via Playwright on key pages), keyboard pass on wizard and checklist, 360 px pass everywhere.
3. Error boundaries, `not-found` pages, loading skeletons, toasts on every mutation, double-submit protection.
4. Security review against PRD §12–13: list each check and result in the checkpoint report.
5. Deploy to Vercel: env vars, Supabase auth redirect URLs, `NEXT_PUBLIC_SITE_URL`, run seed against production demo project, verify QR codes point to production URLs.
6. `README.md` for judges: what it is (3 lines), live URL, **demo logins / `/demo` link**, 6-step guided tour (F1–F6), architecture diagram (Mermaid), tech stack, how to run locally, tests, AI-use disclosure note, license.
7. A `DEMO_SCRIPT.md`: exact click path and seed records to use for the video, timed to fit ~3 minutes of an 8-minute presentation.
8. Final checkpoint: list of all requirement IDs with status (done / deferred).

**Acceptance:** production URL works in a private browser window; all three demo roles work in production; all tests pass.

---

## PART C — Short prompts for each later stage

**Start a stage:**
```
Read PRD.md and CLAUDE.md. Do Stage N (<name>) from KICKOFF_PROMPT.md Part B, following all rules in Part A. Post your short plan, then build, verify, commit, and stop with the checkpoint report.
```

**Fix something after review:**
```
Before moving on, fix these issues from my review of Stage N: <list>. Re-verify the affected flows and update the checkpoint report.
```

**Resume in a fresh session:**
```
We're building GeekLoop. Read CLAUDE.md, PRD.md and KICKOFF_PROMPT.md (Part A rules + Part B stages). Check `git log` and the codebase to confirm which stage is done. Tell me the current state in 5 bullets, then continue with Stage N when I confirm.
```

**Parallel work (two people, after Stage 2):**
```
I'm working on branch <branch> and own Stages <list>. My teammate is working on Stages <list> on another branch. Do not modify files owned by their stages; if you need a schema change, create a new migration and flag it clearly in the checkpoint report so we can coordinate the merge.
```

**Time pressure (if behind schedule on Wednesday night):**
```
We're short on time. List every remaining P0 and P1 item with an effort estimate. Then finish all remaining P0 items first, skip P1 unless P0 is complete, and keep the app demo-able at every commit.
```
