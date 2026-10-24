# GeekLoop — Product Requirements Document

**Version:** 1.0  
**Competition:** FUSE Society Blueprint 2026 (Partner Business: Free Geek Toronto)  
**Team:** [Member 1], [Member 2]  
**Deadline:** Friday, October 30, 2026, 11:59 PM ET (target submission: Friday 6:00 PM ET)  
**Status:** Approved for build

> **How to use this document.** This PRD is the single source of truth for what GeekLoop is and why. Claude Code reads it before every build stage. Requirement IDs (e.g. `PP-03`) are referenced in commits, tests and the build plan. **P0** = must ship for the demo. **P1** = ship if time allows. **P2** = out of scope for the competition; mention only as "future roadmap" in the pitch.
>
> Every number marked **[ASSUMPTION]** is a placeholder the team must validate (via the official FGT question form) or replace with a cited source before submission. Never present an assumption as a fact in the video or on Devpost.

---

## 1. Summary

GeekLoop is a web platform that makes the value Free Geek Toronto (FGT) creates **visible** — to the businesses that donate, the customers who buy, and the volunteers who refurbish — and converts that visibility into **mission-aligned, recurring revenue** and a **steady supply of uniform, high-value laptops**.

It has three core modules on one shared device-tracking backbone:

1. **Partner Portal** — a tiered B2B Reuse Partnership program. Businesses submit bulk laptop batches, receive data-sanitization certificates and a live ESG impact dashboard.
2. **Device Passport** — every refurbished device gets a QR code linking to its public story: who donated it, who refurbished it, when its data was wiped, its environmental impact, and a transparent explanation of what the purchase price funds.
3. **Volunteer Skills Wallet** — every device a volunteer works on is logged to their profile, unlocking skill badges they can share with employers.

Plus two P1 add-ons: **Pay-It-Forward** (cross-subsidy fund for discounted devices) and a **"Can I Donate This?"** household checker.

---

## 2. The Problem

### 2.1 Root problem statement

> **Free Geek Toronto creates real environmental, social and economic value, but none of its stakeholders can see it — so businesses don't partner, customers misunderstand pricing, and volunteers drift away.** The most damaging consequence is that FGT has **zero corporate partners**, which means it receives almost none of the bulk, uniform laptops that are fastest to refurbish and most valuable to sell — while sales now make up ~77% of its revenue.

### 2.2 Evidence from the case

| Symptom | Case evidence |
|---|---|
| No corporate supply | "Free Geek Toronto currently has no corporate partners or sponsors." "Without corporate relationships, FGT misses an opportunity to secure bulk laptop donations from local businesses." |
| Inefficient, mismatched donations | Irregular devices "necessitate additional time and resources for refurbishment"; a "consistent stream of uniform laptop donations would streamline the refurbishment process." FGT wants to "encourage organizations to donate large quantities of uniform laptops." |
| Declining donations | Trade-in and buyback programs mean "the most valuable and most uniform devices rarely reach organizations like FGT." (63% of Canadians, 71% of Gen Z bought refurbished/open-box/traded-in tech — Best Buy Canada / Angus Reid 2026.) |
| Revenue dependence | Sales ≈ 77% of revenue (2025); grants are "project-based and time-limited." |
| Customer misconceptions | Customers assume products are free, confuse FGT with Free Geek Vancouver, and "lack clarity on how products are priced and on the impact their purchase has." |
| Volunteer retention | "More volunteer hours… the more technology it can refurbish"; FGT "faces ongoing challenges in recruiting and retaining volunteers." |
| Underused Community Hub | The Hub "is now underutilized" since COVID. |
| Constraints | 1 full-time + 5 part-time staff; 30–40 volunteers; ~$240K average annual revenue (2023–25); limited capital, space; data security and environmental compliance obligations. |

### 2.3 Why this problem over the alternatives

| Alternative focus | Why it ranks lower |
|---|---|
| Customer misconceptions alone | Real, but its revenue effect is indirect; GeekLoop solves it as a by-product via the Device Passport. |
| Volunteer scheduling / management | FGT **already plans to adopt** a volunteer management platform — building another would duplicate it. GeekLoop's Skills Wallet *complements* it (impact + credentials, not scheduling). |
| Community Hub bookings | Low revenue upside and requires staff time FGT doesn't have. GeekLoop fills the Hub through Champion-tier corporate volunteer days instead. |
| Household donation triage alone | Improves efficiency but doesn't bring in *better* devices. Included as a P1 add-on. |
| Raising prices / higher-margin customers | Explicitly ruled out by the case ("The Central Tension"). |

### 2.4 How GeekLoop resolves the central tension

GeekLoop grows revenue by **increasing and improving supply** and **adding B2B membership revenue from businesses**, never by raising prices for the communities FGT serves or by moving into off-mission services. Every revenue stream directly increases technology reuse, digital inclusion, or skills development.

---

## 3. Goals, Non-Goals, Success Metrics

### 3.1 Goals
- G1. Recruit corporate Reuse Partners and turn them into a recurring source of uniform laptops.
- G2. Create a new, recurring, non-grant revenue stream (partner memberships).
- G3. Reduce refurbishment time per device by prioritizing uniform batches.
- G4. Correct customer misconceptions about pricing, "free" products and the Free Geek network.
- G5. Improve volunteer retention by making impact and skills visible.
- G6. Respect FGT's constraints: ~$0 upfront cost, minimal staff time, data-security compliance.

### 3.2 Non-goals (competition scope)
- Replacing FGT's existing online store, point-of-sale, or sanitization software.
- Volunteer shift scheduling (FGT's planned platform covers this).
- Issuing charitable tax receipts (FGT is described as a non-profit, not a registered charity).
- Live payment processing (Stripe **test mode** only).
- Native mobile apps (responsive web only).

### 3.3 Success metrics (pitch + in-app dashboards)

| Metric | Target, Year 1 [ASSUMPTION] | Measured in |
|---|---|---|
| Active Reuse Partners | 10 (6 Community, 3 Impact, 1 Champion) | Staff dashboard |
| Partner-sourced laptops received | 250 / year | Staff dashboard |
| Share of intake that is uniform (≥ 5 of same model) | ≥ 40% | Batch Value Score report |
| Membership revenue | $4,500 / year (3 × $500 + 1 × $1,500 + sponsorships) | Staff dashboard |
| Avg. refurbish time per partner laptop vs. mixed donation | −40% | Device event timestamps |
| Partner renewal rate | ≥ 70% | Staff dashboard |
| Passport scans per sold device | ≥ 0.5 | Passport view counter |
| Volunteers active 3+ months | +20% vs. baseline | Volunteer wallet activity |
| Pay-It-Forward dollars raised (P1) | $2,000 / year | Fund ledger |

---

## 4. Users and Personas

| Persona | Role in app | Need | Case segment |
|---|---|---|---|
| **Priya, Office Manager at a 60-person accounting firm** | `partner` | Responsibly retire 20 three-year-old laptops with proof data was destroyed, and something to show in the firm's ESG / community report. | Technology donors; Small and Medium-sized Businesses |
| **Marcus, FGT Operations Lead (the 1 full-timer)** | `staff` | See what's coming in, never exceed volunteer capacity, prove data was wiped, report impact to funders — in minutes, not hours. | Internal |
| **Aisha, volunteer, newcomer to Canada building an IT résumé** | `volunteer` | Show employers real, verifiable hands-on experience. | Volunteers and trainees |
| **Daniel, college student buying a $200 laptop** | public (no login) | Trust that the device is safe and reliable, understand why it isn't free, feel good about the purchase. | Device buyers; Low-income groups |
| **Linh, coordinator at a newcomer-services non-profit** | public / P1 | Get affordable devices for clients; may receive Pay-It-Forward-subsidized devices. | Organizational buyers |

---

## 5. Solution Overview

### 5.1 Modules

| ID | Module | Priority | Problems solved |
|---|---|---|---|
| PP | Partner Portal (tiered Reuse Partnership) | P0 | No corporate partners; uniform supply; revenue; Hub use (Champion tier) |
| OPS | Staff Operations Console | P0 | Efficiency; capacity; compliance; reporting |
| DP | Device Passport + public site | P0 | "Products are free" misconception; network confusion; pricing clarity; partner retention |
| VW | Volunteer Bench + Skills Wallet | P0 (bench), P1 (badges/profile) | Volunteer retention; employability |
| CI | Certificates + Impact Engine | P0 | Data-security proof; ESG value for partners |
| PIF | Pay-It-Forward fund + memberships checkout | P1 | Mission-aligned revenue; affordability |
| HC | "Can I Donate This?" household checker | P1 | Unwanted donations |

### 5.2 The flywheel

```
Partners donate uniform laptops
        ↓
Faster refurbishment (Batch Value Score prioritizes them) → more inventory
        ↓
More sales — every device carries a Passport
        ↓
Buyers & partners SEE the impact (Passport + live ESG dashboard)
        ↓
Partners share impact on LinkedIn, renew, upgrade tiers → new partners join
        ↺
Volunteers power the middle step; the Skills Wallet rewards them for it.
```

---

## 6. Business Model

### 6.1 Reuse Partnership tiers

| Tier | Price/yr [ASSUMPTION] | Includes |
|---|---|---|
| **Community Partner** | Free | Batch submission, drop-off scheduling, per-batch data-sanitization certificate, basic impact summary |
| **Impact Partner** | $500 | Everything above + pickup request option, live ESG impact dashboard, downloadable branded annual impact report, shareable LinkedIn impact card, logo on public Partner Wall |
| **Champion Partner** | $1,500 | Everything above + one hosted employee volunteer day at the FGT Community Hub per year, featured placement on Partner Wall, 10 "sponsored laptops" credited to the Pay-It-Forward fund in the partner's name |

Rationale: SMBs increasingly need ESG/community-impact reporting, and the free tier removes all friction for the first donation (acquisition), while paid tiers monetize **reporting and recognition** — not disposal itself — so FGT never charges for the core reuse act. Fees are framed as **membership / sponsorship**, not donations (no tax receipts implied).

### 6.2 Revenue streams created or strengthened

1. **Membership fees** (new, recurring, non-grant).
2. **Increased device sales** from more, better, uniform inventory (existing stream, strengthened; prices unchanged).
3. **Pay-It-Forward contributions** (P1): optional customer round-ups and partner sponsorships that fund discounted devices for referral-agency clients — a cross-subsidy that keeps access tied to ability to pay.
4. **Champion volunteer days** fill the underused Community Hub and expose employees to FGT (future individual donors and buyers).

### 6.3 Unit economics model (all [ASSUMPTION] — validate with FGT)

| Input | Placeholder | Source to validate |
|---|---|---|
| Average sale price of a refurbished laptop | $180 | FGT question form / FGT online store listings |
| Refurb time, mixed household donation | 120 min | FGT question form |
| Refurb time, uniform batch device | 60 min | FGT question form |
| Share of partner laptops sellable (rest recycled for parts) | 80% | FGT question form |
| Average laptops per partner per year | 25 | Assumption: SMB 3–4-year refresh cycle |

Year-1 illustrative projection (base case): 10 partners × 25 laptops = 250 laptops × 80% sellable × $180 = **$36,000 gross device sales**, plus **$3,000 membership** (3 × $500 + 1 × $1,500) and Champion sponsorship of 10 laptops. Volunteer time saved vs. the same number of mixed devices: 200 × 60 min = **200 volunteer hours**. Show a conservative scenario (5 partners) and an ambitious one (20 partners) in the pitch. All of these figures must be labelled as assumptions.

### 6.4 Cost to FGT

| Item | Upfront | Ongoing |
|---|---|---|
| Software build | $0 (built by team; open-source license) | — |
| Hosting (Vercel Hobby/Pro) | $0 | $0–$20/mo |
| Database/auth/storage (Supabase Free → Pro) | $0 | $0–$25/mo |
| Domain (optional; can use a subdomain) | $0–$20 | ~$20/yr |
| QR label printing (existing printer + label sheets) | ~$30 | ~$10/mo |
| Payments (Stripe) | $0 | Per-transaction fees only |
| Staff time | ~4 hours setup/training | ~1–2 hours/week |
| **Total** | **≈ $50** | **≈ $0–$55/mo** |

### 6.5 Competitive positioning

- **Quantum Lifecycle** (for-profit ITAD): scale and commercial services; positioned on disposal. GeekLoop positions FGT on **local, visible social impact** — a partner can see the student who received their laptop's category, which Quantum cannot offer.
- **reBOOT Canada**: strong brand and >14,000 donations/year. GeekLoop gives FGT a **digital brand-building engine** (Passports + LinkedIn impact cards) it currently lacks.
- **RCT**: charitable status and school-board partnerships. GeekLoop targets **Toronto SMBs** that are too small for formal ITAD contracts but want proof of responsible disposal.

### 6.6 Mission guardrails (enforced in product)
- Device prices are never set or changed by GeekLoop; it displays prices FGT sets.
- Pay-It-Forward funds can only be applied as **discounts** for devices going to digital-inclusion recipients.
- Partner tiers buy **recognition and reporting**, never priority access to devices or influence over pricing.
- Household donations are still accepted (computers and accessories), just triaged.

---

## 7. Functional Requirements

### 7.1 Authentication, roles, and demo access (AUTH)

| ID | Requirement | P |
|---|---|---|
| AUTH-01 | Email/password sign-in and sign-up via Supabase Auth. | P0 |
| AUTH-02 | Roles: `partner`, `staff`, `volunteer`. Public pages need no login. | P0 |
| AUTH-03 | Partner sign-up creates an `organizations` row and links the user as its owner. | P0 |
| AUTH-04 | Staff and volunteer accounts are created by staff (invite or create), not self-serve. | P0 |
| AUTH-05 | Route protection by role via middleware; unauthorized access redirects to the user's home dashboard. | P0 |
| AUTH-06 | **Demo mode** (`NEXT_PUBLIC_DEMO_MODE=true`): `/demo` page with one-click sign-in as Demo Partner, Demo Staff, Demo Volunteer — so judges can explore without signing up. Banner on every page: "Demo environment — fictional data." | P0 |
| AUTH-07 | Password reset flow. | P1 |

### 7.2 Partner Portal (PP)

| ID | Requirement | P |
|---|---|---|
| PP-01 | Public "Become a Reuse Partner" page explaining tiers, process, data security, and impact, with sign-up CTA. | P0 |
| PP-02 | Partner onboarding: organization name, industry, employee-count range, website, logo upload, contact info, public-recognition opt-in (Partner Wall + Passport attribution). | P0 |
| PP-03 | **Batch submission wizard** (multi-step): (1) device line items — category, make, model, approx. year, quantity, condition; (2) logistics — drop-off or pickup (pickup only for Impact/Champion), preferred week from capacity-aware calendar; (3) data handling — confirm devices will be submitted with drives intact and that FGT will sanitize them; (4) review and submit. | P0 |
| PP-04 | Capacity-aware calendar: shows the next 8 weeks with availability (Open / Limited / Full) based on staff capacity settings and already-scheduled batches. | P0 |
| PP-05 | Live **Batch Value Score** preview while filling the form (see §9.3), with plain-language tips, e.g. "Batches of 5+ identical laptops under 5 years old are refurbished fastest." | P0 |
| PP-06 | Batch list and detail pages with status timeline (Submitted → Approved/Declined → Scheduled → Received → In Refurbishment → Completed). | P0 |
| PP-07 | Device-level journey view per batch: each device's status, and once sold, its recipient category (e.g. "Student", "Newcomer") — never personal data. | P0 |
| PP-08 | Download data-sanitization certificate PDF per batch once issued. | P0 |
| PP-09 | **Impact dashboard** (Impact/Champion; Community sees summary only): devices received, devices reused, devices recycled responsibly, kg e-waste diverted, est. CO₂e avoided, recipients by category, volunteer hours supported, chart over time. | P0 |
| PP-10 | **Downloadable annual impact report** (PDF) branded with partner logo + FGT. | P1 |
| PP-11 | **LinkedIn impact card**: generated image (1200×627) with partner name and key stats, plus share link and suggested post text. | P1 |
| PP-12 | Membership page: current tier, benefits, upgrade via checkout (see PIF-04). | P1 |
| PP-13 | Organization settings: edit profile, logo, recognition opt-ins, add colleagues to the organization. | P1 |

### 7.3 Staff Operations Console (OPS)

| ID | Requirement | P |
|---|---|---|
| OPS-01 | Overview dashboard: pending approvals, next 4 weeks' capacity load, devices by pipeline status, devices sold this month, revenue this month (sales recorded + memberships + PIF), active partners, active volunteers. | P0 |
| OPS-02 | Batch queue sorted by Batch Value Score (desc) with filters (status, partner tier, week). | P0 |
| OPS-03 | Approve / decline (with reason) / schedule batches. Scheduling warns if the week would exceed capacity and suggests the next open week; staff may override with a note. | P0 |
| OPS-04 | **Receive batch**: create device records fast — "bulk add" N identical devices from a line item in one action, then edit serial numbers per device (serial optional at intake). Each device gets a unique passport code. | P0 |
| OPS-05 | Device table: search, filter by status/batch/category, bulk status change, column for assigned volunteer. | P0 |
| OPS-06 | Device detail: specs, status, full event timeline (chain of custody), assign volunteer, set price, record sale (sale date, channel: in-store/online/B2B, optional recipient category, optional PIF subsidy applied). | P0 |
| OPS-07 | **Wipe verification**: only staff can mark a device `wipe_verified`, entering sanitization method and the report/reference ID from FGT's existing sanitization software. | P0 |
| OPS-08 | **Certificate issuance**: enabled only when every device in a batch is `wipe_verified` (or later status) or `recycled`. Generates a numbered PDF certificate stored in Supabase Storage. | P0 |
| OPS-09 | **QR label sheet**: select devices → print-ready page of labels (QR + passport code + model) sized for standard label sheets. | P0 |
| OPS-10 | Partner management: list, tier, membership dates, batches, total devices; change tier manually. | P0 |
| OPS-11 | Volunteer management: create volunteer accounts, see devices worked, badges, last activity; award manual "Mentor" badge. | P1 |
| OPS-12 | Settings: weekly refurbishment capacity, refurb-time assumptions, impact factors (with source/citation field), price-transparency breakdown, accepted-items list for household checker. | P0 |
| OPS-13 | Household (non-partner) intake: create devices not linked to a partner batch. | P0 |
| OPS-14 | CSV export of devices and batches (for funder/grant reporting). | P1 |

### 7.4 Volunteer Bench & Skills Wallet (VW)

| ID | Requirement | P |
|---|---|---|
| VW-01 | "My Bench": devices assigned to me + "claim next device" from the ready-for-refurb queue (highest Batch Value Score first). Mobile-friendly for use at the workbench. | P0 |
| VW-02 | Per-device checklist: Hardware test → Data wipe performed (enter sanitization report ID) → OS installed (default: open-source OS, e.g. Linux Mint; record OS) → Final QA. Each step writes a `device_events` row with actor. | P0 |
| VW-03 | Volunteer cannot mark `wipe_verified`; completing "wipe performed" moves the device to `wipe_pending_verification` for staff. | P0 |
| VW-04 | **Skills Wallet**: devices refurbished, steps completed by type, estimated hours contributed, list of passports I appear on. | P0 |
| VW-05 | **Badges** auto-awarded per §9.5, with toast/celebration on unlock. | P1 |
| VW-06 | Public volunteer profile `/v/[handle]` (opt-in): first name, badges, devices refurbished count, member-since — linkable from a résumé/LinkedIn. | P1 |
| VW-07 | Privacy settings: opt in/out of first-name attribution on Passports and the public profile. Default: off. | P0 |

### 7.5 Device Passport & Public Site (DP)

| ID | Requirement | P |
|---|---|---|
| DP-01 | Public landing page: what GeekLoop/FGT does, live impact counters, Partner Wall preview, CTAs (Become a Partner, Can I Donate?, Shop at FGT, Volunteer). | P0 |
| DP-02 | **Passport page** `/p/[code]`: device model and specs, refurbished-on date, journey timeline (Donated → Data wiped & verified → Refurbished → Ready), donor (org name/logo only if opted in, else "a Toronto business" / "a community member"), refurbishing volunteer first name (only if opted in), est. kg e-waste and CO₂e avoided, open-source software installed, and **"Where your money goes"** price-transparency breakdown. | P0 |
| DP-03 | Passport prominently states: "Refurbished by **Free Geek Toronto**, an independent non-profit. Free Geek locations operate independently — products, prices and services vary by city." | P0 |
| DP-04 | Passport explains "Why isn't this free?" in plain language (refurbishing, data security, wages for people facing employment barriers, keeping prices tied to ability to pay). | P0 |
| DP-05 | Passport never shows serial numbers, sanitization report IDs, recipient identity, or sale price paid. | P0 |
| DP-06 | Passport view counter (anonymous, aggregate). | P0 |
| DP-07 | Partner Wall `/partners`: opted-in partners by tier with logos and devices-reused counts. | P0 |
| DP-08 | `/about` page: FGT mission, Free Geek network independence, pricing philosophy, data-security process. | P0 |
| DP-09 | Public impact page `/impact`: aggregate stats + methodology (impact factors with citations). | P0 |
| DP-10 | Invalid passport codes show a friendly 404 with a link to `/about`. | P0 |
| DP-11 | Passport supports printing and is fully readable on a small phone screen (it will be scanned from a laptop sticker). | P0 |

### 7.6 Certificates & Impact Engine (CI)

| ID | Requirement | P |
|---|---|---|
| CI-01 | Certificate PDF contents: certificate number (`GL-YYYY-NNNN`), FGT name and address (180 Sudbury Street Unit C3, Toronto, ON), partner name, batch ID, date received, date issued, issuing staff name, device table (category, make/model, serial if recorded, sanitization method, verification date, outcome: reused/recycled), statement of process, QR code linking to a public verification page. | P0 |
| CI-02 | Public verification page `/verify/[certificate_number]`: confirms certificate exists, partner name, device count, issue date — no serials. | P0 |
| CI-03 | Impact calculation is a single pure module (`lib/impact.ts`) using factors from settings; same numbers everywhere (passport, partner dashboard, public impact page, reports). | P0 |
| CI-04 | Impact factors stored with value, unit, source title, source URL, and "last reviewed" date; displayed on methodology page. | P0 |

### 7.7 Pay-It-Forward & Memberships (PIF) — P1

| ID | Requirement | P |
|---|---|---|
| PIF-01 | `/pay-it-forward` page: explains the fund; one-time contributions ($5/$10/$25/custom) via checkout. | P1 |
| PIF-02 | Embeddable "Round up for digital inclusion" widget/link FGT can place in its existing online store's checkout confirmation (demonstrated on a mock checkout page). | P1 |
| PIF-03 | Fund ledger: contributions in; subsidies out (staff applies subsidy when recording a sale to a qualifying recipient category). Balance can't go negative. | P1 |
| PIF-04 | Membership upgrade checkout (Impact/Champion) updates tier and membership dates on success. | P1 |
| PIF-05 | Payment provider abstraction: `stripe` (test mode keys only) or `mock` (default in demo if no keys). Webhook handler for Stripe. | P1 |
| PIF-06 | Passport shows "This device was made more affordable by the Pay-It-Forward fund" when a subsidy was applied. | P1 |

### 7.8 "Can I Donate This?" Household Checker (HC) — P1

| ID | Requirement | P |
|---|---|---|
| HC-01 | Public `/donate` page: user picks a category (or types a model) and answers 2–3 questions (age, working condition). | P1 |
| HC-02 | Rules engine (staff-configurable accepted-items list) returns: **Accepted** (with drop-off info and what to bring), **Accepted for recycling only**, or **Not accepted** (with a pointer to Ontario's approved electronics recycling options). | P1 |
| HC-03 | If user indicates they're donating on behalf of a business with 5+ devices, route them to the Partner program. | P1 |
| HC-04 | Log anonymous checker outcomes for staff analytics (counts of accepted vs. redirected). | P1 |

---

## 8. Key User Flows

**F1 — Partner first donation (P0 demo path).** Landing → Become a Partner → sign up → onboarding → New Batch wizard (20 × Dell Latitude 5420, 2021, working) → sees Batch Value Score "Excellent" → picks an open week → submits → dashboard shows "Submitted".

**F2 — Staff processes the batch.** Staff dashboard → batch queue (top by score) → approve + schedule (capacity check passes) → on drop-off day: Receive → bulk-add 20 devices → print QR labels.

**F3 — Volunteer refurbishes.** My Bench → claim device → hardware test ✔ → wipe performed (report ID) ✔ → OS installed (Linux Mint) ✔ → final QA ✔ → device awaits wipe verification → badge unlocked.

**F4 — Staff verifies and certifies.** Staff verifies wipes (bulk) → batch fully verified → Issue Certificate → PDF generated → partner gets it on their dashboard.

**F5 — Sale and passport.** Staff sets price, records sale (recipient category: Student; optional PIF subsidy) → buyer scans QR on laptop → Passport shows donor, volunteer, impact, "Where your money goes".

**F6 — Partner sees impact.** Partner dashboard updates: device reused → recipient category → impact counters → generate LinkedIn card.

The **demo video** follows F1→F6 end to end.

---

## 9. Business Rules

### 9.1 Device status machine

```
received → testing → wipe_pending_verification → wipe_verified → refurbishing → ready → listed → sold
   │           │                │
   └───────────┴────────────────┴──→ recycled   (terminal; allowed from any pre-sale state, requires reason)
```
- `wipe_pending_verification → wipe_verified`: **staff only**.
- No device may reach `ready`, `listed`, or `sold` without passing `wipe_verified`. Enforced in the database (trigger) and the server layer.
- Every transition writes an append-only `device_events` row (actor, from, to, note, timestamp). Events cannot be updated or deleted (RLS + no update/delete policies).

### 9.2 Batch status machine
`submitted → approved → scheduled → received → in_refurbishment → completed`; `submitted → declined` (terminal, requires reason). `completed` is set automatically when every device in the batch is `sold`, `listed`, `ready`, or `recycled` AND a certificate is issued.

### 9.3 Batch Value Score (0–100)
Helps staff prioritize the batches with the best unit economics.
```
uniformity = (quantity of the most common make+model) / total quantity        → 0..1
youth      = clamp((max_age_years - avg_age_years) / max_age_years, 0, 1)     → max_age_years default 8
volume     = clamp(total_quantity / 20, 0, 1)
laptopShare= laptops / total devices
score      = round(100 * (0.40*uniformity + 0.25*youth + 0.20*volume + 0.15*laptopShare))
Label: ≥ 75 Excellent · 50–74 Good · 25–49 Fair · < 25 Low
```
Weights live in settings. The formula is implemented once in `lib/batch-score.ts` with unit tests.

### 9.4 Capacity
- `settings.weekly_capacity_devices` (default 20 [ASSUMPTION]).
- Week load = devices in batches scheduled for that week + carry-over backlog of devices in pre-`ready` states ÷ remaining weeks (simple: just scheduled devices for v1).
- Calendar status: Open (< 70%), Limited (70–100%), Full (> 100%). Partners can't choose Full weeks; staff can override with a note.

### 9.5 Badges (auto-awarded, idempotent)

| Slug | Name | Criterion |
|---|---|---|
| `first-boot` | First Boot | 1 device completed final QA |
| `diagnostician` | Diagnostician | 10 hardware tests |
| `data-guardian` | Data Guardian | 10 wipes performed that were later staff-verified |
| `open-source-installer` | Open Source Installer | 10 open-source OS installs |
| `bench-regular` | Bench Regular | 25 devices completed |
| `century` | Century Club | 100 devices completed |
| `mentor` | Mentor | Awarded manually by staff |

### 9.6 Impact calculation
- `kg_diverted = Σ weight_kg` of devices reused or responsibly recycled (default weight by category from settings).
- `co2e_avoided_kg = Σ co2e_factor_by_category` for **reused** devices only.
- `volunteer_hours = Σ refurb minutes` (from settings by uniform vs. mixed) ÷ 60.
- All factors are [ASSUMPTION] placeholders seeded with `source_title = "TO VERIFY"`. **Before submission, the team must replace them with cited values** (e.g. manufacturers' published product carbon footprint reports for comparable laptop models) and show citations on `/impact`.

### 9.7 Price transparency
- Staff-configurable breakdown (percentages summing to 100) shown on every passport: e.g. Refurbishing & testing, Data security, Fair wages & training, Operations & space, Digital-inclusion programs. Seeded values are **illustrative** and labelled "Illustrative — to be confirmed by Free Geek Toronto" until staff edit them.

---

## 10. Information Architecture (Routes)

```
Public
/                         Landing
/partners                 Partner Wall
/become-a-partner         Program + tiers
/p/[code]                 Device Passport
/verify/[certNumber]      Certificate verification
/impact                   Public impact + methodology
/about                    FGT, network independence, pricing, data security
/donate                   Can I Donate This? (P1)
/pay-it-forward           Fund (P1)
/v/[handle]               Volunteer public profile (P1)
/demo                     Demo role switcher (demo mode only)
/login, /signup

Partner (/partner)
/partner                  Dashboard + impact
/partner/batches          List
/partner/batches/new      Wizard
/partner/batches/[id]     Detail + device journeys + certificate
/partner/report           Annual report / LinkedIn card (P1)
/partner/membership       Tier + upgrade (P1)
/partner/settings         Org profile + opt-ins

Staff (/staff)
/staff                    Overview
/staff/batches            Queue
/staff/batches/[id]       Approve/schedule/receive/certify
/staff/devices            Table
/staff/devices/[id]       Detail + timeline + sale
/staff/labels             QR label sheet
/staff/partners           Partners
/staff/volunteers         Volunteers
/staff/fund               PIF ledger (P1)
/staff/settings           Capacity, factors, transparency, accepted items

Volunteer (/volunteer)
/volunteer                My Bench
/volunteer/devices/[id]   Checklist
/volunteer/wallet         Skills Wallet + badges
/volunteer/settings       Privacy opt-ins
```

---

## 11. Data Model (PostgreSQL / Supabase)

All tables have `id uuid primary key default gen_random_uuid()` and `created_at timestamptz default now()` unless noted. Money is stored in **integer cents**. Enums are Postgres enums.

**profiles** — `id uuid PK references auth.users`, `role user_role (partner|staff|volunteer)`, `full_name text`, `display_first_name text`, `organization_id uuid null → organizations`, `public_handle text unique null`, `attribution_opt_in bool default false`, `public_profile_opt_in bool default false`.

**organizations** — `name`, `slug unique`, `industry`, `employee_range`, `website`, `logo_path`, `contact_email`, `contact_phone`, `tier partner_tier (community|impact|champion) default community`, `membership_started_at`, `membership_expires_at`, `wall_opt_in bool default false`, `passport_attribution_opt_in bool default false`.

**donation_batches** — `organization_id`, `submitted_by → profiles`, `status batch_status`, `logistics (dropoff|pickup)`, `preferred_week date` (Monday), `scheduled_week date null`, `pickup_address text null`, `notes`, `decline_reason`, `value_score int`, `data_handling_ack bool`, `received_at`, `completed_at`.

**batch_line_items** — `batch_id`, `category device_category (laptop|desktop|monitor|tablet|accessory|other)`, `make`, `model`, `approx_year int`, `quantity int check > 0`, `condition (working|partially_working|not_working|unknown)`.

**devices** — `passport_code text unique` (8 chars, unambiguous alphabet, e.g. `FGT-7K3M9Q2X`), `batch_id null`, `line_item_id null`, `source (partner|household)`, `category`, `make`, `model`, `cpu`, `ram_gb`, `storage_gb`, `serial_number text null` (private), `approx_year`, `status device_status`, `assigned_volunteer_id null`, `wipe_method text null`, `wipe_report_ref text null` (private), `wipe_performed_by null`, `wipe_verified_by null`, `wipe_verified_at null`, `os_installed text null`, `is_open_source_os bool`, `refurbished_by null`, `refurbished_at null`, `price_cents int null`, `sold_at null`, `sale_channel (in_store|online|b2b) null`, `recipient_category (student|newcomer|senior|low_income_household|nonprofit|small_business|general|undisclosed) null`, `pif_subsidy_cents int default 0`, `recycled_reason null`, `weight_kg numeric null`, `passport_views int default 0`.

**device_events** (append-only) — `device_id`, `actor_id`, `event_type (status_change|step_completed|assigned|note|sale|subsidy)`, `from_status`, `to_status`, `step (hardware_test|wipe_performed|wipe_verified|os_installed|final_qa) null`, `note`, `metadata jsonb`.

**certificates** — `certificate_number text unique`, `batch_id unique`, `organization_id`, `issued_by`, `issued_at`, `device_count`, `pdf_path`.

**badges** — `slug unique`, `name`, `description`, `icon`, `criterion_type`, `threshold`.  
**volunteer_badges** — `volunteer_id`, `badge_id`, `awarded_at`, `awarded_by null`; unique (volunteer_id, badge_id).

**fund_transactions** (P1) — `type (contribution|subsidy|sponsorship)`, `amount_cents` (positive in, negative out), `organization_id null`, `device_id null`, `provider (stripe|mock|manual)`, `provider_ref`, `note`.

**membership_payments** (P1) — `organization_id`, `tier`, `amount_cents`, `provider`, `provider_ref`, `period_start`, `period_end`.

**settings** (single row, `id int PK = 1`) — `weekly_capacity_devices int`, `refurb_minutes_uniform int`, `refurb_minutes_mixed int`, `batch_score_weights jsonb`, `max_device_age_years int`, `price_breakdown jsonb`, `price_breakdown_confirmed bool`, `accepted_items jsonb`.

**impact_factors** — `category`, `avg_weight_kg`, `co2e_avoided_kg_per_reuse`, `source_title`, `source_url`, `last_reviewed date`.

**checker_logs** (P1) — `category`, `outcome`, `is_business bool`.

**Views / RPC (security definer, public-safe):**
- `get_passport(code text)` → only public-safe fields (respects opt-ins; increments view counter).
- `public_impact_totals()` → aggregates.
- `verify_certificate(number text)` → number, partner name, device count, issued_at.
- `partner_wall()` → opted-in orgs with reuse counts.

---

## 12. Permissions (Row Level Security)

| Table | Partner | Volunteer | Staff | Public (anon) |
|---|---|---|---|---|
| organizations | read/update own | — | all | via `partner_wall()` only |
| donation_batches | CRUD own org (update only while `submitted`) | — | all | — |
| batch_line_items | same as batch | — | all | — |
| devices | read devices in own org's batches (no `wipe_report_ref`) | read devices assigned to self + ready-for-refurb queue; update via server actions only | all | via `get_passport()` only |
| device_events | read for own org's devices | insert for assigned devices; read own | read/insert all | — |
| certificates | read own | — | all | via `verify_certificate()` |
| badges | read | read | all | read |
| volunteer_badges | — | read own | all | via public profile if opted in |
| settings / impact_factors | read | read | all | read impact_factors |
| fund_transactions | read own sponsorships | — | all | aggregate via RPC |

Rules: `device_events` has **no update/delete** policy for anyone. Status transitions happen only in server actions (using the authenticated user's client, never the service role for user-initiated actions); the service role key is used only for seed scripts and payment webhooks.

---

## 13. Non-Functional Requirements

- **Security & privacy:** secrets only in env vars; Zod validation on every server action and route handler; no PII on public pages; serial numbers and sanitization references visible only to staff and the owning partner (serials on the certificate only); rate-limit public form endpoints; security headers via `next.config`. GeekLoop records sanitization; it does not perform it — FGT's existing tools remain the system of record.
- **Accessibility (digital inclusion is the mission):** WCAG 2.1 AA — semantic HTML, keyboard navigation, visible focus, 4.5:1 contrast, alt text, form labels and error messages; plain-language copy (aim for grade 8 reading level on public pages).
- **Performance:** public pages (esp. Passport) server-rendered, LCP < 2.5 s on 4G; Lighthouse ≥ 90 performance/accessibility on `/` and `/p/[code]`.
- **Responsiveness:** works from 360 px wide; volunteer bench and passport are mobile-first.
- **Reliability:** graceful empty, loading and error states everywhere; no unhandled promise rejections; app works fully in demo mode with **no Stripe keys**.
- **Open source:** repository licensed under GPL-3.0 (or MIT) — consistent with FGT's open-source value.
- **Language:** English.

---

## 14. Technical Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js (latest stable, App Router) + TypeScript (`strict`) |
| Styling/UI | Tailwind CSS + shadcn/ui; lucide-react icons |
| Data/Auth/Storage | Supabase (Postgres, Auth, Storage, RLS) via `@supabase/ssr` |
| Migrations | Supabase CLI SQL migrations in `supabase/migrations` |
| Validation/Forms | Zod + React Hook Form |
| Charts | Recharts |
| QR | `qrcode` |
| PDF | `@react-pdf/renderer` (server-side) |
| Images (LinkedIn card) | `next/og` (ImageResponse) |
| Payments (P1) | Stripe Checkout, test mode only, behind a `PaymentProvider` interface with a `mock` implementation |
| Testing | Vitest (unit), Playwright (e2e) |
| Package manager | pnpm |
| Hosting | Vercel (app) + Supabase (hosted project) |

**Folder structure**
```
app/(public)/…  app/partner/…  app/staff/…  app/volunteer/…  app/api/…
components/ui (shadcn)  components/<feature>/…
lib/supabase/{server,client,middleware}.ts
lib/{impact,batch-score,capacity,badges,status-machine,passport-code,certificate-number}.ts
lib/payments/{provider,stripe,mock}.ts
lib/validation/*.ts   (Zod schemas)
server/actions/<feature>.ts
supabase/migrations/*.sql  supabase/seed.ts
tests/unit  tests/e2e
```

**Environment variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DEMO_MODE`, `PAYMENT_PROVIDER` (`mock`|`stripe`), `STRIPE_SECRET_KEY` (test key `sk_test_…` only), `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Commit `.env.example`, never `.env.local`.

---

## 15. Design System

> **Superseded by `UI_UX_DESIGN.md`** (claymorphism + liquid motion, Apple-level restraint). That file is authoritative for all visual and interaction decisions; the notes below are a summary only.

- **Feel:** warm, trustworthy, community-first — closer to a good public-library website than a startup dashboard. Clear, generous spacing; big tap targets.
- **Palette (tokens):** primary deep green (reuse/circularity), accent warm orange (energy, CTAs), neutral slate, success/warning/danger semantic colors. Avoid copying Free Geek's official branding; GeekLoop is presented as a tool *for* FGT, with "Free Geek Toronto" named in text.
- **Type:** one clean sans-serif (e.g. Inter or system UI), 16 px minimum body.
- **Signature components:** Journey timeline (used on passport, batch, device detail); Impact stat cards; Batch Value Score meter; Capacity calendar; Badge chips.
- **Copy voice:** plain, warm, specific. "Your 20 laptops are now helping 16 students and newcomers get online." not "Utilization metrics updated."
- Dark mode: nice-to-have (P2).

---

## 16. Seed / Demo Data

All seeded organizations and people are **fictional** (no real company names). Seed script is idempotent and resets demo data.

- Settings and impact factors (marked TO VERIFY).
- 7 badges.
- Accounts: `demo-partner@geekloop.test`, `demo-staff@geekloop.test`, `demo-volunteer@geekloop.test` (+ 4 more volunteers). Passwords generated into `.env.local` as `DEMO_PASSWORD`, displayed only on `/demo` when demo mode is on.
- 8 partner orgs across tiers (e.g. "Maple Ledger Accounting", "Harbourfront Dental Group", "Brightpath Logistics", "Queen West Design Co."), 5 opted in to the wall.
- ~14 batches across every status, including one perfect demo batch (20 × same model, 2021) currently `submitted`.
- ~120 devices across every status with realistic event timelines spanning the last 6 months, ~45 sold with recipient categories, some with PIF subsidies.
- 2 issued certificates.
- Fund transactions totalling a positive balance.

---

## 17. Testing & Quality

- **Unit (Vitest):** batch score, capacity calendar, impact calc, status machine transitions (valid/invalid), badge awarding, passport-code generator (uniqueness, alphabet), certificate-number format.
- **E2E (Playwright):** F1 partner submits batch; F2/F4 staff approves, receives, verifies, issues certificate; F3 volunteer completes checklist; F5 passport renders with opt-in rules respected and private fields absent; unauthorized role redirects.
- **Security checks:** anon cannot select from base tables; partner A cannot read partner B's batch; volunteer cannot set `wipe_verified`; events cannot be updated.
- **Manual QA:** 360 px phone pass on passport and bench; keyboard-only pass on wizard; Lighthouse run.
- **Definition of done (each stage):** typecheck, lint, tests pass; feature works in the browser against seed data; no console errors; committed.

---

## 18. Build Plan (summary — full instructions in `KICKOFF_PROMPT.md`)

| Stage | Content | P | Target |
|---|---|---|---|
| 0 | Project setup, conventions, CLAUDE.md | P0 | Sat |
| 1 | Database schema, RLS, RPCs, seed | P0 | Sat–Sun |
| 2 | Auth, roles, layouts, demo mode | P0 | Sun |
| 3 | Partner Portal (onboarding, wizard, batches) | P0 | Sun–Mon |
| 4 | Staff Operations Console | P0 | Mon |
| 5 | Volunteer Bench + Skills Wallet | P0/P1 | Tue |
| 6 | Certificates + Impact Engine + partner dashboard | P0 | Tue |
| 7 | Device Passport + public site | P0 | Wed |
| 8 | Pay-It-Forward + memberships | P1 | Wed |
| 9 | Household checker + reports + LinkedIn card | P1 | Wed–Thu |
| 10 | Hardening, tests, accessibility, deploy, README | P0 | Thu |
| — | Video, Devpost, form; buffer | — | Thu–Fri |

**Two-person split after Stage 2:** Person A owns Partner + Public (Stages 3, 7, 9); Person B owns Staff + Volunteer + Certificates (Stages 4, 5, 6). Work on separate git branches, merge daily. Stage 1 schema is shared — change it only via new migrations and tell each other.

---

## 19. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| SMBs won't pay for membership | Free tier removes barrier; paid tiers sell reporting/recognition SMBs need anyway; pilot with 3 partners before committing. |
| Volunteer capacity can't absorb partner volume | Capacity calendar caps intake; uniform batches need less time per device. |
| Data-security liability | GeekLoop records, never performs, sanitization; staff-only verification; append-only chain of custody; certificate states the process FGT actually follows (to be confirmed by FGT). |
| Staff adoption (tiny team) | Minimal clicks (bulk add, bulk verify), volunteers do most data entry at the bench, ~1–2 h/week staff time. |
| Inaccurate impact claims | Factors cited and configurable; methodology page; conservative defaults. |
| Overlap with FGT's planned volunteer platform | Skills Wallet focuses on impact and credentials, not scheduling; can link to that platform. |
| Build overrun | Strict P0/P1 scope; stage checkpoints; Friday is buffer, not build time. |

---

## 20. Open Questions for FGT (submit via the official question form)

1. What is the average sale price of a refurbished laptop at FGT?
2. Roughly how long does refurbishing a typical laptop take for a volunteer, and how much faster is it when many are the same model?
3. Approximately how many devices does FGT receive and refurbish per week/month, and what share are laptops?
4. Have businesses ever donated in bulk, and what stopped it from becoming regular?
5. What data-sanitization process/software and standard does FGT use, and does it produce a report per device?
6. Is FGT a registered charity able to issue tax receipts?
7. Which online store platform does FGT use?
8. Roughly how is a device's price allocated across costs (for the transparency breakdown)?

---

## 21. Rubric Mapping (for the Devpost page and video)

| Criterion | Where GeekLoop earns it |
|---|---|
| Problem Identification | §2: root problem, case evidence, explicit comparison against alternatives |
| Solution Clarity | §5–7: three modules, each tied to a named symptom; F1–F6 demo flow |
| Feasibility | §6.4 ≈ $50 upfront; §9.4 capacity-aware intake; minimal staff time; [ASSUMPTION]s validated |
| Presentation Clarity | Video follows problem → root cause → demo F1–F6 → business model → costs/timeline/metrics |
| Technical bonus | Deployed, authenticated, role-based, RLS-secured app with tests and demo mode |

---

## 22. Glossary
- **ITAD:** IT Asset Disposition — retiring business IT equipment securely.
- **ESG:** Environmental, Social, Governance reporting.
- **Uniform batch:** many devices of the same make/model, which can be refurbished with one repeated process.
- **Passport code:** the unique short code printed as a QR label on each device.
- **Pay-It-Forward fund:** contributions that lower prices for devices going to digital-inclusion recipients.
