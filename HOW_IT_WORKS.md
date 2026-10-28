# How Relay works (for our team)

A plain-language tour of the parts judges ask about, so either of us can explain them. Each section
ends with **where it lives** in the code.

Relay exists for one change: **Toronto small businesses become a recurring source of uniform laptops
for Free Geek Toronto (FGT).** The core loop is: a business signs up and submits a **batch** → staff
receive it → volunteers refurbish each laptop → a **certified data wipe** is recorded and verified →
the business gets a **certificate** → every laptop has a **Device Passport**, the business's proof of
impact. Everything else supports that loop.

---

## 1. Who can see and do what (the permission model)

There are three kinds of accounts, plus the public:

| Who | Can see | Can do |
|---|---|---|
| **Reuse Partner** (a business) | Its own organization, batches, certificates, and its own devices through a safe view | Submit and edit batches (only while "submitted"), change its profile and opt-ins, download its certificates |
| **Volunteer** | Devices assigned to them, plus the queue of devices waiting | Claim devices and complete checklist steps on their own devices |
| **Staff** | Everything | Approve, schedule and receive batches, verify wipes, issue certificates, record sales, change settings |
| **Public (signed out)** | Device Passports, the Partner Wall, impact totals, certificate checks | Nothing that changes data (except anonymous counters) |

**How it's enforced: row-level security (RLS).** Every table in the database has rules that run
*inside Postgres* on every query, using the signed-in person's ID. For example, the rule on
`donation_batches` says "staff see all rows; anyone else sees only rows where `organization_id` is
their own organization". Even if someone bypassed our web pages and called the database directly
with their login, they would only get their own rows. Our server code also checks the role
(`assertRole`) before every action, so there are two locks on every door.

Some data is never shown to some roles at all:
- Partners can't read the `devices` table directly. They use `partner_devices()`, a database function
  that returns their devices **without** the sanitization reference ID, and shows who bought a device
  only as a category (like "student") once it's sold.
- The public never touches tables. Passports, the Partner Wall and certificate checks go through
  "security definer" functions that return only public-safe fields.
- The secret (service-role) key, which skips RLS, is used in only two places: the seed script and
  the payment webhook. **Reset demo** does not use it: it signs in as the demo staff account, so RLS
  and every trigger still apply.

**Where it lives:** `supabase/migrations/20261024000002_rls.sql` (all RLS rules),
`supabase/migrations/20261024000003_logic.sql` (the safe functions), `lib/auth.ts` (`requireRole`,
`assertRole`), `proxy.ts` (sends each role to its own app), `tests/unit/rls.test.ts` (tries to break
the rules and checks it can't).

## 2. The device status machine and the chain of custody

Every device moves through fixed stages:

```
received → testing → wipe pending verification → wipe verified → refurbishing → ready → listed → sold
                     (any stage before sold) ──────────────────────────────────────────→ recycled
```

- A device can only move one step forward along that line (or to "recycled"). The database refuses
  anything else, such as jumping from "received" to "sold".
- Only **staff** can move a device to "wipe verified". A volunteer finishing the wipe step moves it
  to "wipe pending verification", and it waits there for staff.
- Nothing can become ready, listed or sold until the wipe is verified.

These rules are **database triggers**, so no button, script or API call can skip them.

**The chain of custody** is the table `device_events`. Every status change, assignment, checklist step,
sale and note adds a row: who did it, when, from which stage to which. There is **no update or delete
rule** on this table for anyone, so history can only be added to, never changed. That's what lets a
certificate say exactly what happened to each device.

Bulk actions (verify 20 wipes, complete a step for 5 laptops) are loops over the normal one-device
path, so every device still gets its own events and every rule still applies to each one.

**Where it lives:** `lib/status-machine.ts` (the same rules in TypeScript, so the UI can show only valid
buttons; tested in `tests/unit/status-machine.test.ts`), the `guard_device`, `log_device_change` and
`guard_device_events` triggers in `supabase/migrations/20261024000003_logic.sql`, and the volunteer
checklist function `complete_step()` in the same file.

## 3. Certificates: how they're made and verified

A certificate **documents** that each device in a batch went through FGT's data sanitization process.
It doesn't claim a guarantee or a legal standard FGT hasn't confirmed.

1. A volunteer wipes a drive with FGT's sanitization software and enters the **report/reference ID**
   the software gives them (one per device).
2. A staff member checks that report and **verifies** the wipe in Relay (one device or the whole batch).
3. When every device in the batch is verified (or recycled), staff press **Issue certificate**. Relay
   gives it the next number (`GL-2026-0001`, …), builds a PDF and stores it privately.
4. The PDF lists, for each device: make and model, serial (if recorded), method, reference ID,
   verification date, who verified it, and the outcome (reused or recycled). It ends with FGT's
   process description and a disclaimer, and has a QR code to the public check page.
5. Anyone can open `/verify/GL-…` to confirm the certificate is real: partner name, device count,
   how many were wiped and verified, dates. **Never** serial numbers or reference IDs.

Staff edit the wording in **Settings → Certificate wording**: an optional **sanitization standard**
(empty by default; when empty, no standard appears anywhere), a short **process description**, and a
**disclaimer line**.

**Where it lives:** `lib/certificate-wording.ts` (defaults and rules), `lib/pdf/certificate.tsx` (the PDF),
`lib/pdf/certificate-data.ts` (collects the data), `server/actions/certificates.ts` (issuing),
`app/api/certificates/[number]/route.ts` (download), `app/(public)/verify/[number]/page.tsx` (public check),
`lib/certificate-number.ts` (numbering), `tests/unit/certificate.test.tsx`, `tests/e2e/f4-certificate.spec.ts`.

## 4. How the Device Passport protects privacy

Every laptop gets a QR label with a code like `FGT-WRAPPED2`. Scanning it opens `/p/FGT-…`: a short
story (who donated it, its certified data wipe, the volunteer who rebuilt it, the impact, where the
buyer's money goes), plus a full static view.

Privacy rules:
- The passport is built by `get_passport_story()`, a database function that returns only public-safe
  fields. Serial numbers, sanitization reference IDs, who bought it and the price paid **are never
  returned**, so they can't leak into the page, the share image or anything else.
- The donating business is named **only if it opted in** ("Name us on Device Passports"). Otherwise it
  says "a Toronto business". The volunteer's first name appears **only if they opted in**; otherwise
  "an FGT volunteer". Both opt-ins are **off by default** and take effect immediately.
- Dates are shown, but not the people or notes behind each step.
- When a **signed-in partner opens one of its own laptops**, the story opens with "This was one of your
  laptops, *their name*" and ends with a thank-you. We check ownership with `partner_devices()`, which
  RLS already limits to that partner's organization, so nobody else ever sees the personal version.
- Passport views are counted as one number per device; partners see only the total for their laptops.

**Where it lives:** `app/(public)/p/[code]/page.tsx`, `lib/passport-story.ts` (turns the data into slides;
tested), `lib/queries/passport.ts` (`getPassportStory`, `getPassportOwner`), `components/passport/`,
`supabase/migrations/20261025000001_passport_story.sql`, and the privacy tests in
`tests/e2e/privacy.spec.ts`, `passport-story.spec.ts` and `f5-passport.spec.ts`.

## 5. The Batch Value Score and the capacity calendar

**Batch Value Score (0–100)** tells staff which batches help FGT most, and tells the business how good
their batch is while they fill in the form. It mixes four things, each from 0 to 1:

| Part | What it measures | Default weight |
|---|---|---|
| Uniformity | How much of the batch is one identical model (identical laptops are refurbished fastest) | 40% |
| Youth | How new the devices are (newer = more reusable) | 25% |
| Volume | How many devices (more = more impact per drop-off) | 20% |
| Laptop share | How much of the batch is laptops (FGT's most-needed device) | 15% |

Score = weighted sum × 100. Labels: Excellent (75+), Good (50+), Fair (25+), Low. Staff can change the weights in
Settings (they must add up to 1). The browser shows the score live, but the server recomputes it on
submit, so it can't be faked from the form.

**Capacity calendar.** Staff set how many devices the bench can take per week (default 20). For each of
the next 8 weeks Relay adds up the devices in approved and scheduled batches. A week is **Open** below 70% of
capacity, **Limited** from 70%, and **Full** (closed to partners) once it's over capacity. The wizard
preselects the next open week. If staff schedule a batch into a full week, Relay warns, suggests the
next open week, and lets them override with a note.

**Where it lives:** `lib/batch-score.ts` and `lib/capacity.ts` (pure functions, tested in
`tests/unit/batch-score.test.ts` and `tests/unit/capacity.test.ts`), the wizard in
`components/partner/batch-wizard.tsx`, scheduling in `server/actions/staff.ts` (`scheduleBatch`).

## 6. Program metrics (is it working?)

The staff overview has a **Reuse Partnership** section, computed only from data Relay already records:
partner laptops received per month, active partners and how many sent a second batch (retention),
average days from intake to ready for uniform partner batches vs. household donations (from the
chain-of-custody timestamps), sales of partner vs. household devices (revenue only from recorded
prices), and passport views on partner laptops. In demo mode it's labelled as fictional seed data.

**Where it lives:** `lib/program-metrics.ts` (tested in `tests/unit/program-metrics.test.ts`),
`app/staff/page.tsx`.
