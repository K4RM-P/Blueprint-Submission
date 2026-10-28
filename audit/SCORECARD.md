# Relay scorecard

Each item is scored 0–10. **Self** is the build team's score, **Reviewer** is the independent reviewer subagent (it saw only the brief, the running app and the screenshots), and **Final** is the lower of the two unless evidence proves otherwise. A 10 means nobody could find a remaining issue after actively trying.

Severity: **C** Critical · **H** High · **M** Medium · **L** Low. Status: ✅ fixed in this iteration · ⏳ open · ⛔ declined (reason given) · 🔒 needs information or access only FGT or the team has.

---

## Iteration 1 (audit of `c9db69c`, before any change)

**Evidence collected:** screenshots of every route at 390 and 1440 px in `audit/iter-1/` (`capture.mjs`, saved as JPEG); typecheck and lint clean; Vitest 110/110; Playwright 56/57 (F2 asserted an old page title); production build OK; Lighthouse in `scratchpad` runs (mobile, simulated throttling). Reviewer evidence: `audit/iter-1/REVIEW.md`.

| Item | Self | Reviewer | Final | Evidence (short) |
|---|---|---|---|---|
| A1 Problem identification | 5 | 5 | **5** | FGT's problem (no corporate partners, shrinking uniform supply, 77% sales) appears nowhere in the app; only README. `audit/iter-1/public-home@1440.jpg`, `public-become-a-partner@1440.jpg` |
| A2 Solution clarity | 7 | 6 | **6** | Relay section is clear, but the hero mock (Northwind Legal) contradicts real numbers and shows features that don't exist; "Leg 3 of 3" vs "five handoffs" |
| A3 Feasibility | 6 | 6 | **6** | Capacity logic works (reviewer walk-through), but no ADMIN_GUIDE, a pickup promise on the free tier, an unagreed "2 business days" SLA |
| A4 Presentation | 7 | 6 | **6** | DEMO_SCRIPT has wrong slide numbers and a crammed F2/F4 |
| A5 Technical execution | 7 | 7 | **7** | 1 red e2e; order-dependent tests; e2e data leaks onto the public Partner Wall |
| B1 One change | 7 | 7 | **7** | Core screens serve the pipeline; staff overview carries tier-3 charts; persona chip on the passport cover |
| B2 Target user fit | 6 | 6 | **6** | Data-security copy strong; certificate defaulted to an unconfirmed standard; recycled drives undocumented |
| B3 Mission | 7 | 7 | **7** | Guardrails visible; demo partner is a paid tier |
| B4 Differentiation | 5 | 5 | **5** | "Better than a trade-in" asserted, no side-by-side of the alternatives |
| B5 Measurable value | 4 | 4 | **4** | PRD §3.3 metrics not shown anywhere; completions > starts; report says devices on the bench "were refurbished" |
| B6 Honesty | 3 | 2 | **2** | "NIST 800-88 Purge" default; "Real counts from Free Geek Toronto's bench"; unverified "produces a report"; "not a registered charity"; free-tier pickup; ESG wording; fictional partners not labelled |
| B7 FGT-specificity | 8 | 8 | **8** | Address, independence note, existing software; "Vancouver or Portland" not in the case |
| C1 Functional completeness | 7 | 7 | **7** | Recycled passport says "Wipe in progress" forever; mock shows non-existent features |
| C2 Robustness | 6 | 6 | **6** | Seed didn't remove e2e orgs; count-ups render 0 in SSR; checker defaulted a business to 1 device |
| C3 Security | 7 | 6 | **6** | No CSP; SVG logos allowed in a public bucket; score forgeable via REST (known) |
| C4 Tests | 6 | 6 | **6** | 1 red e2e; order-dependent RLS/e2e; no test for recycle drive handling |
| C5 Performance | 5 | 6 | **5** | Mobile Lighthouse (local): landing 62–79, passport 79–80, Become a Partner 86–88; partner dashboard 69 |
| C6 Code & docs | 5 | 5 | **5** | No ADMIN_GUIDE.md or HOW_IT_WORKS.md; hours formula duplicated (`lib/badges.ts` vs `lib/impact.ts`); README missing the live URL |
| D1 5-second test | 6 | 6 | **6** | "Pass it on." alone doesn't say what or for whom |
| D2 Hierarchy | 6 | 6 | **6** | Staff queue mixes completed with submitted; empty wizard scores "56 Good" |
| D3 Consistency | 7 | 7 | **7** | Term drift (certificate names, Sold/Reused/In a new home) |
| D4 Not vibe-coded / §12 | 5 | 5 | **5** | Sparkles icons (§12.6) ×3; infinite marquee in the story (§12.9); infinite hero hairline animation |
| D5 Motion & craft | 7 | 7 | **7** | Liquid and stamps well done; count-ups show 0 before JS |
| D6 Copy | 5 | 5 | **5** | "small businesss", "Subsidys", "Pick up the baton", three different form lengths |
| D7 Friction | 6 | 6 | **6** | Placeholders looked like typed values ("Dell", "2021"); form-length claims inconsistent |
| D8 Responsive | 7 | 7 | **7** | `/impact` table clipped at 390; staff dock hides QR labels, Volunteers, Pay-It-Forward |

### Issues found in iteration 1 and what happened to them

| # | Sev | Item | Issue | Status |
|---|---|---|---|---|
| 1 | C | B6/B2 | Wipe method defaulted to "NIST 800-88 Purge" (unconfirmed standard, and technically "Clear") | ✅ `DEFAULT_WIPE_METHOD` = "FGT data-sanitization software (standard to be confirmed)" in `lib/domain.ts`, used by the verify dialog, volunteer action and seed; DB fallback migration `20261028000001` |
| 2 | C | B6 | Demo numbers presented as real FGT data ("Real counts from Free Geek Toronto's bench", `/impact` "live from FGT's records", unlabelled LIVE pill, fictional Partner Wall) | ✅ demo-data labels on the hero pill, relay, impact row, Partner Wall (landing and `/partners`), `/impact` |
| 3 | C | B6/B5 | Annual report and LinkedIn post said devices still on the bench "were wiped, verified and refurbished" / "gave … a second life" | ✅ `impactSummary()` in `lib/report.ts` (tested); card shows reused / being refurbished / kg; CO₂e removed from share surfaces |
| 4 | C | B2/B6 | Recycled devices had no documented drive handling; certificate statement claimed every drive was sanitized | ✅ recycling an unverified device requires "What happened to the drive?" (`lib/status-machine.ts`, tested + `tests/e2e/recycle.spec.ts`); certificate column and statement reworded; passport shows "Drive handled before recycling" |
| 5 | C | B6/A3 | Free tier promised "or we pick up" | ✅ "drop off at 180 Sudbury Street"; pickup listed only on Impact as "(to be confirmed by FGT)" |
| 6 | H | C3/B6 | e2e org "Riverdale Test Bookkeeping" on the public wall | ✅ seed removes member-less orgs (`supabase/seed.ts`) |
| 7 | H | B5 | Story completions > starts; "views" vs "scans" | ✅ only visits that start on the cover are counted (`story-player.tsx`); seed resets and seeds consistent analytics; "Passport views" everywhere. ⏳ image fetches still count as views (needs a DB change) |
| 8 | H | A2/B6/D4 | Landing mock contradicts real data, fake features, Sparkles icon | ✅ fully illustrative and internally consistent, captioned "illustrative numbers", real nav labels, "Download impact report" |
| 9 | H | B6 | Unverified claims: "produces a report", "not a registered charity", "doesn't issue tax receipts", "BL-" (Blancco-style) IDs | ✅ reworded as Relay statements; "RPT-" reference IDs |
| 10 | H | B6/B2 | Story: "verified… before anyone else touched it"; "Every byte erased" | ✅ "wiped at the bench, then verified by staff before the laptop could be refurbished or sold"; "Its old data, wiped." |
| 11 | H | B6 | Passport claims OS "Running" and CO₂e avoided before reuse | ✅ "Installed:" until ready; "CO₂e avoided once reused (est.)" |
| 12 | H | D6/B6 | Login: "your first batch is free" | ✅ "every batch is free" |
| 13 | H | B6 | ESG wording; CO₂e on share surfaces | ✅ "detailed impact dashboard"; CO₂e kept on dashboard/methodology only |
| 14 | H | C6/A3 | ADMIN_GUIDE.md and HOW_IT_WORKS.md missing | ✅ both written |
| 15 | H | C4/A5 | e2e red and order-dependent | ✅ F2 fixed; RLS test now creates its own batch and picks a different tier; 58/58 e2e |
| 16 | H | B5/C6 | Skills Wallet hours disagree; formula duplicated | ✅ one `estimateHours` in `lib/impact.ts` used by both. 🔒 migration `20261028000003` (volunteers read their own devices' line items) must be pushed for the wallet's uniform count |
| 17 | M | A1 | Problem framing absent in-app | ✅ landing "Why Relay exists" (0 corporate partners · 77% of revenue from sales · 63% bought refurbished, sourced) |
| 18 | M | B4 | No comparison with alternatives | ✅ "Your options for old laptops" table on Become a Partner (trade-in, reseller, paid disposal, recycling drop-off, drawer) |
| 19 | M | B3 | Demo partner is a paid tier | ⛔ Maple Ledger must be Impact for flow F6 (annual report, LinkedIn card); `/demo` and Become a Partner lead with the free tier |
| 20 | M | B5 | PRD §3.3 metrics not visible | ✅ "Is the Reuse Partnership working?" on the staff Overview (`lib/program-metrics.ts`, tested), labelled demo data with assumption targets |
| 21 | M | D4 | Infinite marquee in the story | ⏳ |
| 22 | M | D4 | Sparkles icons | ✅ replaced (`persona-icons.tsx`, Award) |
| 23 | M | A2/D3 | "Leg 5" vs "Leg 3 of 3" | ✅ landing says "Handoff N" |
| 24 | M | A2 | Persona chip on the full-passport cover | ✅ removed from the cover; persona stays on its story slide and share card |
| 25 | M | C3 | No CSP | ✅ production CSP in `next.config.ts` |
| 26 | M | C3 | SVG logos | ✅ raster only, checked by magic bytes (`sniffLogoType`, tested); bucket migration `20261028000002` |
| 27 | M | C3 | `value_score` forgeable via REST | 🔒 needs a DB trigger (migration + push); documented |
| 28 | M | C6/A4 | README live URL missing | ✅ |
| 29 | M | A4 | DEMO_SCRIPT slide numbers | ✅ 13 slides, `?s=13` |
| 30 | M | C2 | No demo reset short of `pnpm seed` | ⛔ an in-app reset button would be a new feature and a destructive public action; reset stays `pnpm seed` (documented in ADMIN_GUIDE) |
| 31 | M | D2 | Staff queue mixes completed batches | ✅ defaults to "Open batches"; plain-words description |
| 32 | M | D8 | `/impact` table clipped, not focusable | ✅ focusable scroll region, min width |
| 33 | M | D3 | Certificate naming | ✅ "Certificate of Data Sanitization" everywhere (landing preview and copy now match the PDF) |
| 34 | M | D3 | Raw UUID batch ID on certificate | ⏳ |
| 35 | M | D3 | "GL-" prefix | ⛔ `GL-YYYY-NNNN` is the PRD CI-01 format |
| 36 | M | C5 | Landing TBT/LCP | ⏳ partially: ISR, lazy charts, static hairlines, CSS reveals (see C5) |
| 37 | M | C2/D5 | Count-ups render 0 in SSR | ✅ `CountUp` renders the final value on the server |
| 38 | M | D6/A3 | Three form-length claims | ✅ "about two minutes" everywhere |
| 39 | M | D7 | Onboarding before the first batch | ⛔ every onboarding field is already optional; one click ("Save and start a batch") continues |
| 40 | M | A3/B6 | "2 business days" SLA | ✅ removed |
| 41 | M | B5 | "people reached" counts devices | ✅ landing "in new homes"; ⛔ partner dashboard keeps "helping N people" (one buyer per device; small-business buyers are people too) |
| 42 | M | D1 | Hero alone fails the 5-second test; CTA inconsistency | ✅ eyebrow "Free laptop retirement for Toronto businesses"; closing CTA is "Create a free partner account" |
| 43 | L | D6 | "small businesss" | ✅ `recipientNoun` plurals (tested) |
| 44 | L | D6 | "Subsidys" | ✅ |
| 45 | L | D6 | Baton jargon | ✅ |
| 46 | L | D3 | "Via: Mock" | ✅ "Test payment" |
| 47 | L | a11y | `aria-hidden-focus` on charts | ✅ `accessibilityLayer={false}` |
| 48 | L | D8 | Station label overlaps card at 390 | ⏳ verify in iteration 2 |
| 49 | L | D8 | Staff dock hides pages | ✅ account menu lists the pages not in the dock (phones) |
| 50 | L | B5/D3 | Membership date off by one | ✅ |
| 51 | L | D2 | "3 certificates" names 2 | ✅ "+N more" |
| 52 | L | C2 | Checker business quantity defaulted to 1 | ✅ blank until answered |
| 53 | L | D6 | Checker: no link for drop-off hours | ⛔ the case doesn't give FGT's URL; we don't invent one |
| 54 | L | D2 | Empty wizard scores "56 Good" | ✅ meter waits for a complete row ("Add a model"); placeholders say "e.g." |
| 55 | L | B6 | "Vancouver or Portland" | ✅ generic |
| 56 | L | C1 | Recycled passport shows pricing sections | ✅ hidden for recycled devices |
| 57 | L | D3 | Status vocabulary | ⏳ |
| 58 | L | D4 | Centered hero | ⛔ centered hero is the established brand moment; the rest of the page is asymmetric (§12.4 bans centered-*everything*) |
| S1 | M | D4 | Hero hairlines animated forever (also ~190 ms of blocking time) | ✅ static, server-rendered (`floating-paths.tsx`) |
| S2 | M | B6 | Partner-facing "Free Geek Toronto is a non-profit, not a registered charity" (PRD open question 6) | ✅ removed |

**C5 measurements after the iteration-1 fixes** (mobile, simulated throttling, median of 5, behind a local HTTP/2 proxy; the deployed Vercel build of the previous commit scores within ±3 of this setup): landing 78 (LCP 3.6 s, TBT 0.48 s), Become a Partner 91 (LCP 2.7 s), passport story 80 (LCP 3.5 s), partner dashboard 75 (LCP 3.4 s, TBT 0.68 s). CLS ≤ 0.001 everywhere.

---

## Iteration 2 (audit of `3a917ab`, the iteration-1 build)

**Evidence collected:** screenshots of every route at 390 and 1440 px, plus 768 and 1920 px for the core screens, in `audit/iter-2/`. Typecheck and lint clean. A second independent reviewer (fresh agent, no access to iteration 1's review) walked the whole loop as partner, staff and volunteer, ran a 34-route layout sweep at 390/1920 px and ran Lighthouse.

| Item | Self | Reviewer | Final | Evidence (short) |
|---|---|---|---|---|
| A1 Problem identification | 8 | 7 | **7** | "Why Relay exists" is real and sourced but sits ~1,800 px down at 1440 |
| A2 Solution clarity | 7 | 7 | **7** | One change consistent across `/`, `/become-a-partner`, `/demo`; landing long; mock nav differs from the real portal |
| A3 Feasibility | 7 | 6 | **6** | Week picker ignored batch size (Nov 2 at 7/20 offered for 20 laptops); Reschedule broken; ADMIN_GUIDE clear |
| A4 Presentation | 7 | 7 | **7** | Screens strong; DEMO_SCRIPT step 11 (`v`) broke on camera; stepper labels collide at 390 |
| A5 Technical execution | 7 | 6 | **6** | Reschedule, `v` shortcut and wizard double-click bugs; Receive race |
| B1 One change | 8 | 8 | **8** | Every core screen serves the pipeline; tier 3 quiet |
| B2 Target user fit | 7 | 7 | **7** | Raw UUID batch ID on the certificate; pickup wording inconsistent |
| B3 Mission | 8 | 8 | **8** | Guardrails in code; "tied to ability to pay" stated as fact; fund money counted as revenue |
| B4 Differentiation | 8 | 8 | **8** | Options table + "Better than a trade-in" are clear and fair |
| B5 Measurable value | 6 | 6 | **6** | Program metrics labelled; "devices being refurbished" included ready/listed; views inflated by image fetches; wallet hours |
| B6 Honesty | 6 | 6 | **6** | Recycled passport called an unverified drive a "certified data wipe"; landing CO₂e untagged; wall heading; pickup; "for good" |
| B7 FGT-specificity | 9 | 9 | **9** | Address, drop-off, independence note, case stats, Linux Mint, existing software |
| C1 Functional completeness | 7 | 6 | **6** | Reschedule dead; single verify from the table lost the report ID; no failed-hardware-test path for volunteers |
| C2 Robustness | 7 | 6 | **6** | `v` bug, wizard double click, soft 404 on `/verify/XYZ`, non-atomic receive, price NaN |
| C3 Security | 7 | 7 | **7** | RLS, guards, append-only custody, private passport HTML; partner can still write `value_score`/week/logistics over REST while submitted |
| C4 Tests | 7 | 6 | **6** | No tests for reschedule, the shortcut, wizard recovery, concurrency |
| C5 Performance | 5 | 5 | **5** | Reviewer: landing 81–84, passport 80–82, partner 74–75, Become a Partner 95 |
| C6 Code & docs | 7 | 7 | **7** | ADMIN_GUIDE told staff to use a broken Reschedule; PIF eligibility list wrong; Vercel Hobby non-commercial; GL/geekloop relics |
| D1 5-second test | 7 | 7 | **7** | New partner's dashboard led with "helping 0 people" |
| D2 Hierarchy | 7 | 7 | **7** | Landing long and repeats "91 volunteer hours"; custody rows printed labels twice |
| D3 Consistency | 7 | 7 | **7** | Tier descriptions differed across pages; mock ≠ real portal |
| D4 Not vibe-coded / §12 | 6 | 6 | **6** | Glass beyond dialogs (§12.2); infinite `live-ping`; >10 infinite story loops (§12.9) |
| D5 Motion & craft | 8 | 8 | **8** | Hold-to-confirm, glasses, vessel, story genuinely crafted |
| D6 Copy | 7 | 7 | **7** | Required terms consistent; small slips |
| D7 Friction | 7 | 7 | **7** | Double click, retyping the report ID, `v` |
| D8 Responsive | 7 | 7 | **7** | No overflow on 34 routes; stepper overlap at 390; story buttons truncated |

### Issues found in iteration 2 and what happened to them

| # | Sev | Item | Issue | Status |
|---|---|---|---|---|
| C-01 | H | A5/C1 | Reschedule always failed ("Only approved batches…"); the batch's own load counted against it | ✅ `scheduleBatch` accepts scheduled batches and subtracts the batch's own devices; e2e `ops-regressions.spec.ts` |
| C-02 | H | A4/C2 | `v` typed "v" into the method field; ignored when focus was on a row checkbox | ✅ `preventDefault`, dialog resets on open, shortcut works from checkboxes; e2e |
| C-03 | H | B6/C1 | Recycled passport: "certified data wipe" for an unverified drive, "in progress / not yet" forever | ✅ "Its drive · Drive handled before recycling"; no refurbish/software sections; legs read correctly (`full-passport.tsx`) |
| C-04 | H | A3 | Week picker ignored batch size; staff then saw "over capacity" | ✅ `calendarForBatch` / `firstWeekForBatch` in `lib/capacity.ts` (tested), used by the wizard and the server. 🔒 submitted batches still aren't in `week_loads()` (needs a DB change) |
| C-05 | H | C5 | Lighthouse < 90 on 4 of 5 pages | ⏳ partly: ClayButton without motion, charts on demand; see measurements below |
| M-01 | M | B6 | "Prices tied to ability to pay" as fact | ✅ phrased as FGT's vision (case wording) in 5 places |
| M-02 | M | B6 | Landing CO₂e untagged | ✅ "estimate; factors TO VERIFY" |
| M-03 | M | B6 | Wall heading implied real partners | ✅ demo mode: "Partner Wall · demo — How the Partner Wall will look." |
| M-04 | M | B6/D3 | Pickup and tier descriptions inconsistent | ✅ one `TIER_PITCH` + `TIER_BENEFITS` in `lib/pricing.ts`; pickup "to be confirmed" everywhere; FAQ updated |
| M-05 | M | B5 | Wallet hours | 🔒 migration `20261028000003` (formula already unified) |
| M-06 | M | B5 | "being refurbished" included ready/listed; fund counted as revenue; views inflated | ✅ waiting / on the bench / ready to sell; revenue excludes the fund (shown beside it); share images use a cached lookup so they count at most once per 10 min per code |
| M-07 | M | D7/C2 | Wizard swallowed a click after the acknowledgement error | ✅ no remount; e2e |
| M-08 | M | D7/C1 | Single verify from the table didn't keep the report ID | ✅ table verify always keeps each device's recorded ID |
| M-09 | M | C3 | Partner can write score/week/logistics over REST while submitted | 🔒 needs a BEFORE trigger (DB migration + push); server actions recompute and validate |
| M-10 | M | C2 | Non-atomic receive/sale | ✅ receive is conditional on status (no double insert) and recoverable; 🔒 sale atomicity needs an RPC |
| M-11 | M | D4 | Glass beyond dialogs; infinite live dot; story loops | ✅ live dot pings 3×; every story ambient is finite. ⛔ glass on header/sidebar/dock was a deliberate, recorded team direction (PROGRESS, Stage 3) |
| M-12 | M | C6 | Docs drift | ✅ ADMIN_GUIDE (reschedule, PIF eligibility, bulk verify), DEMO_SCRIPT, HOW_IT_WORKS hosting (Vercel Pro) |
| M-13 | M | D8 | Stepper labels collide at 390 | ✅ phones show only the current step's label |
| M-14 | M | A2/D3 | Mock ≠ real portal | ✅ real nav labels, no fake batch IDs |
| L-01 | L | B2 | UUID batch ID on certificate | ✅ `batchReference()` "B-XXXXXXXX" (tested) |
| L-02 | L | D8 | Story final buttons truncated | ✅ "For businesses" / "From home" (accessible names start with the visible text) |
| L-03 | L | C2 | Soft 404s | ✅ `/verify/<unknown>` is a real 404 with the friendly page. ⛔ `/partner/batches/<bad id>` renders the not-found UI but streams with 200 because of the segment's `loading.tsx` (Next.js behaviour) |
| L-04 | L | C2 | Price dialog NaN | ✅ validated in the dialog with a field error |
| L-05 | L | C1 | Volunteer can't record a failed hardware test | 🔒 needs the `complete_step` RPC changed (DB); staff use Recycle |
| L-06 | L | D1 | New partner: "helping 0 people", time promise | ✅ "Send your first batch." / "Your laptops are on the bench." |
| L-07 | L | D1/C2 | Empty wizard sidebar stats | ✅ dashes until a row is valid |
| L-08 | L | D6 | Second person on public badges; "Ready in" vs bench days; duplicated custody labels; GL/geekloop | ✅ badges neutral; "Drop-off to ready"; custody note only when different. ⛔ `GL-` is the PRD CI-01 format; `@geekloop.test` is the documented demo domain |
| L-09 | L | B5 | "Live" vs ISR | ✅ "Updated every minute" |
| L-10 | L | D2 | "91 volunteer hours" twice | ✅ volunteer section now states FGT's twice-monthly orientation (case fact) |
| L-11 | L | D8 | Mock unreadable at 390 | ⛔ it's captioned as an example; the real dashboard is one tap away from `/demo` |
| L-12 | L | B6 | "for good", "no contract" | ✅ removed |
| S3 | M | A3 | A 20-laptop batch saw no "Open" week | ✅ week labels follow the bench's current load; weeks without room close |
| S4 | M | C4 | RLS and F4 tests depended on earlier runs | ✅ both order-independent (61/61 e2e, 121/121 unit, unit run after e2e) |

**C5 after the iteration-2 fixes** (median of 5, mobile, simulated throttling, HTTP/2 proxy): landing 83 (LCP 2.9 s, TBT 0.44 s), Become a Partner 90, passport story 78 (LCP 3.8 s), partner dashboard 82 (LCP 3.2 s, TBT 0.47 s). CLS ≤ 0.001.

**D7 friction** (`audit/scripts/friction.mjs`): landing → submitted batch for a brand-new partner = **18 interactions** (10 clicks, 8 fields, 119 characters), 8.4 s scripted, **about 73 s** for a person. Staff per 20-laptop batch: approve & schedule 3, receive 1, labels 2, bulk verify 3, certificate 1 = 10 interactions (0.5 per device). Volunteer per device: claim + 4 steps + report ID + OS ≈ 7.

---

## Iteration 3 (audit of `f974901` + `87d4dc3`)

**Evidence collected:** `audit/iter-3/` screenshots (390/1440 for every route; 768/1920 for core screens). A third independent reviewer (fresh agent) walked F1–F5, tried invalid inputs, checked authorization across roles, ran Lighthouse (3 runs per page) and followed DEMO_SCRIPT.

| Item | Self | Reviewer | Final | Evidence (short) |
|---|---|---|---|---|
| A1 Problem identification | 8 | 7 | **7** | Problem sits under the hero mock; no row for the case's named competitors |
| A2 Solution clarity | 7 | 6 | **6** | "Device Passport shows who it helps" not true (passport never shows the recipient, DP-05); landing long |
| A3 Feasibility | 7 | 6 | **6** | Approve-then-Schedule false capacity warning; partner and staff week labels disagree; no volunteer fail path |
| A4 Presentation | 7 | 6 | **6** | Shared live DB (review activity visible on the deployed demo); DEMO_SCRIPT twin batch, one-shot step 12 |
| A5 Technical execution | 8 | 7 | **7** | Capacity double count, inflated views, wallet hours, stale-row success toasts |
| B1 One change | 8 | 7 | **7** | Landing's first visual was a paid-tier portal |
| B2 Target user fit | 8 | 7 | **7** | "None for you" catch row not honest |
| B3 Mission | 8 | 8 | **8** | Small-business buyers counted as "people"; sale dialog defaulted to Student |
| B4 Differentiation | 7 | 6 | **6** | No row for other refurbishers / ITAD (RCT, reBOOT, Quantum) |
| B5 Measurable value | 6 | 5 | **5** | Views inflated by link prefetch; ambiguous "75% of all intake"; no revenue projection vs $240K |
| B6 Honesty | 7 | 6 | **6** | Hard-coded "Now helping a student"; "Refurbished by" on recycled/bench story covers; unlabelled PIF figures and certificate mock; "new from FGT" eyebrow |
| B7 FGT-specificity | 9 | 8 | **8** | "Free Geek wipes them"; GL- prefix |
| C1 Functional completeness | 7 | 7 | **7** | Approve→Schedule bug; no volunteer fail path |
| C2 Robustness | 6 | 5 | **5** | Shared DB; stale-row actions report success; live score accepted 2.5 devices / 1890 |
| C3 Security | 7 | 7 | **7** | Cross-role checks hold; sequential certificate numbers expose partner names on `/verify` |
| C4 Tests | 7 | 7 | **7** | No tests for schedule-after-approve, prefetch views, wallet hours, stale rows |
| C5 Performance | 5 | 5 | **5** | Reviewer medians: home 78, Become a Partner 88, passport 80, partner 80 |
| C6 Code & docs | 7 | 7 | **7** | DEMO/ADMIN/HOW_IT_WORKS inaccuracies listed below |
| D1 5-second test | 7 | 7 | **7** | "Pass it on." headline; desktop passport says "Tap to begin" |
| D2 Hierarchy | 6 | 6 | **6** | Landing and staff overview long; the free/certified message repeated ~8× |
| D3 Consistency | 7 | 7 | **7** | Five names for one device state; Approve vs Approve & schedule |
| D4 Not vibe-coded | 7 | 7 | **7** | Invented mock numbers (captioned); persona gimmick; tickers |
| D5 Motion & craft | 7 | 7 | **7** | Wizard heading overlaps its icon mid-transition; OG word spacing |
| D6 Copy | 7 | 7 | **7** | Grammar slips; sign-up page said "Sign in to Relay." |
| D7 Friction | 8 | 8 | **8** | 4 fields to an account, 10 interactions to a batch |
| D8 Responsive | 9 | 9 | **9** | No overflow on 23 routes at 390/1920; footer links and table checkboxes under 24 px |

### Issues found in iteration 3 and what happened to them

| # | Sev | Item | Issue | Status |
|---|---|---|---|---|
| C-1 | C | A4/C2 | Local and deployed demo share one Supabase project; reviewer activity visible to judges | ✅ reviewer accounts and orgs removed, database re-seeded; README now says the demo data is shared and how to reset it. 🔒 a separate production project is the team's call (needs their Supabase/Vercel access) |
| H-1 | H | A3/C1 | Approved batch counted twice when scheduled | ✅ `scheduleBatch` removes the batch's own load from its current (scheduled or preferred) week; e2e "approve first, then schedule" |
| H-2 | H | B5 | Passport views inflated by `<Link>` prefetch and staff/partner page loads | ✅ `prefetch={false}` on every passport link (incl. `ClayCard`), share images use the cached lookup |
| H-3 | H | B6/A2 | "Device Passport shows who it helps" false; hard-coded "Now helping a student" | ✅ reworded everywhere: the passport shows the journey, the partner's dashboard shows who it helps (by category) |
| H-4 | H | B5/C1 | Skills Wallet hours double | 🔒 migration `20261028000003` must be pushed (formula already single-sourced) |
| H-5 | H | B6 | Story cover "Refurbished by FGT" for recycled/bench devices | ✅ stage-aware ("Recycled responsibly by", "Being refurbished by") |
| H-6 | H | B4 | No row for other refurbishers / ITAD | ✅ "Another refurbisher or IT disposal firm" row (no claims about named firms); HOW_IT_WORKS names RCT, reBOOT, Quantum from the case |
| M-1 | M | B6 | "None for you" catch | ✅ "You give up any trade-in credit and drop off at 180 Sudbury Street…" |
| M-2 | M | A3/D6 | Partner and staff week labels disagree | ✅ staff schedule dialog uses `calendarForBatch` with the batch's own size |
| M-3 | M | B5/B6 | Sale dialog defaulted to Student | ✅ "Not recorded" by default; local (Toronto) sale date |
| M-4 | M | C3/B6 | `/verify` enumerable partner names | ⛔ CI-02 requires the partner name on verification and CI-01 fixes the `GL-YYYY-NNNN` format; documented as a known trade-off |
| M-5 | M | C2 | Stale-row approve/decline/withdraw report success | ✅ all three check the affected row and say "This batch changed…" |
| M-6 | M | B6 | Unlabelled PIF figures, certificate mock | ✅ "Fictional demo data." on `/pay-it-forward`; certificate mock marked "EXAMPLE" |
| M-7 | M | B6 | CO₂e headline | ✅ labelled "if each reused device replaces a new one (estimate; factors TO VERIFY)" |
| M-8 | M | B6 | "New from Free Geek Toronto" eyebrow | ✅ "a new way to work with Free Geek Toronto" |
| M-9 | M | B1 | Landing mock was a paid-tier portal | ✅ "Community Partner", "Download certificate" |
| M-10 | M | A4/C6 | DEMO_SCRIPT twin batch, one-shot step 12 | ✅ script names which batch to open and says to re-seed before each take |
| M-11 | M | C5 | Lighthouse < 90 | ⏳ see measurements; on this shared container results swing ±5–10 |
| M-12 | M | B5/D6 | Ambiguous metric labels | ✅ "actual: N% of all devices received came from partners", "Target: 70% come back" |
| M-13 | M | D6/D3 | Five names for one state | ✅ partners and public: "Back in use"; staff keeps "Sold" where a sale is recorded |
| M-14 | M | A3/C1 | No volunteer fail path | ✅ "Didn't pass? Tell staff" on the hardware-test step writes a note to the device's chain of custody (existing RLS); "Flagged by volunteers" on the staff Overview; e2e |
| M-15 | M | B5/A3 | No revenue figure vs $240K | ✅ HOW_IT_WORKS "What it could earn FGT (illustrative)", every input [ASSUMPTION] |
| M-16 | M | B3 | Businesses counted as people | ✅ "helping N people and M organizations" |
| L-1 | L | D6 | Sign-up heading | ✅ "Join as a Reuse Partner." in sign-up mode |
| L-2 | L | D6 | Grammar | ✅ all four fixed |
| L-3 | L | C2 | Live score accepted invalid rows | ✅ meter scores only rows that pass the server's own Zod schema |
| L-4 | L | C2 | Sale date in UTC | ✅ Toronto date |
| L-5 | L | C3 | Report ID free text; in-memory rate limit; public `/styleguide` | ⛔ report IDs come from FGT's software in unknown formats (output is escaped); per-instance limiting is documented; the styleguide is part of the design-system evidence |
| L-6 | L | B6 | "Faster than most deliveries" | ✅ "From drop-off to ready in under two weeks" |
| L-7 | L | D5 | Craft details | ⏳ wizard transition overlap and OG spacing not reproduced in our captures |
| L-8 | L | D8 | Small tap targets | ✅ footer links ≥ 24 px |
| L-9 | L | C6 | Docs | ✅ README "Core flows"; ADMIN_GUIDE explains Approve vs Approve & schedule and volunteer flags; HOW_IT_WORKS staff override |
| L-10 | L | D2 | Repetition | ⏳ |

**C5 after iteration-3 fixes** (median of 5): landing 79, Become a Partner 86, passport story 79, partner dashboard 83. **Tests:** 63/63 e2e, 122/122 unit.
