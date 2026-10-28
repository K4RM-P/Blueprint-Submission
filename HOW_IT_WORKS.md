# How Relay works

A plain-language explanation of what Relay changes for Free Geek Toronto (FGT), how the pieces fit, and what it costs. For the click-by-click staff routine, see `ADMIN_GUIDE.md`. For the video path, see `DEMO_SCRIPT.md`.

---

## The one change

**Relay turns Toronto small businesses into a recurring source of uniform laptops for Free Geek Toronto.**

### The problem (from the case)
- FGT's supply of high-value, uniform laptops is shrinking: trade-in and buyback programs mean "the most valuable and most uniform devices rarely reach organizations like FGT."
- FGT has **no corporate partners or sponsors**.
- Sales are about **77% of revenue** (2025), so fewer good laptops means less money for the mission. Grants (19%) are project-based and time-limited.
- Raising prices or chasing higher-margin customers is ruled out by the mission.

### Why businesses don't donate today
A business retiring 10–50 laptops has no reason to pick FGT over a trade-in, a reseller, paid IT disposal or a recycling drop-off: there's no documented data wipe, no visible impact and no recognition.

### Why this problem, and not another
| Alternative | Why we didn't lead with it |
|---|---|
| Customer misconceptions (prices, "free") | Real, but the effect on revenue is indirect. Relay fixes it as a by-product: every Device Passport explains why the computer isn't free. |
| Volunteer scheduling | FGT already plans a volunteer management platform. Relay's bench and Skills Wallet complement it rather than duplicate it. |
| Community Hub bookings | Low revenue upside and needs staff time FGT doesn't have. |
| Household donation triage | Saves time but doesn't bring in *better* devices. Included as a small extra (the "Can I donate this?" checker). |

Uniform business laptops are the one input that improves both sides of FGT's tension at once: they are faster to refurbish (operational efficiency) and easier to sell at FGT's existing prices (revenue), and every one of them becomes an affordable computer for someone in Toronto (mission).

---

## The core loop

```
Reuse Partner signs up (free)
   → submits a batch (live Batch Value Score, picks an open week)
   → staff approve and schedule it (capacity-aware)
   → staff receive it: each laptop gets a QR Device Passport
   → volunteers test, wipe, install Linux Mint, check
   → staff verify every wipe (certified data wipe)
   → staff issue a numbered certificate
   → laptop is sold at FGT's prices; its Device Passport shows the partner who it helps
   ↺ the partner sees their impact, shares it, and sends the next batch
```

| Step | Who | What Relay records | What's enforced |
|---|---|---|---|
| Become a Reuse Partner | Business office manager or IT lead | Organization, contact, recognition opt-ins | Free tier needs no payment. |
| Submit a batch | Partner | Models, quantities, years, condition, week | Score recomputed on the server; full weeks can't be chosen. |
| Approve and schedule | Staff | Decision, week, override note | Over-capacity scheduling needs a written note. |
| Receive | Staff | One device per laptop, unique passport code | Codes use an unambiguous alphabet and are unique. |
| Refurbish | Volunteer | Hardware test, wipe performed (report ID), OS, final QA | Volunteers only touch devices assigned to them. |
| Verify the wipe | **Staff only** | Method, report or reference ID, verifier, time | Database trigger: no device reaches Ready or Sold without a staff-verified wipe. |
| Certificate | Staff | Number, devices, serials (private), outcome | Only when every device is verified or recycled. |
| Sell | Staff | Price, channel, recipient *category* (never a name) | Relay never sets prices. |
| Device Passport | Public | Donor (if opted in), volunteer first name (if opted in), dates, impact | Never shows serials, report IDs, buyer or price paid. |

Every step writes to an **append-only chain of custody** (`device_events`) that nobody, including staff, can edit or delete.

---

## The numbers behind it

All formulas live once in `lib/` with unit tests; every screen calls the same function.

- **Batch Value Score (0–100)** (`lib/batch-score.ts`): 40% uniformity (share of the most common model) + 25% youth (newer is better, 8-year horizon) + 20% volume (20+ devices is full marks) + 15% laptop share. ≥75 Excellent · 50–74 Good · 25–49 Fair · <25 Low. Weights are editable in Settings.
- **Capacity** (`lib/capacity.ts`): each week's load = devices in batches scheduled that week, against the weekly capacity in Settings (20 devices, a placeholder). Under 70% is Open, 70–100% Limited, over 100% Full.
- **Impact** (`lib/impact.ts`): kg kept out of landfill = weight of devices reused or recycled; CO₂e avoided = per-device factor for reused devices only; volunteer hours = refurbishment minutes (uniform vs mixed) ÷ 60. Every factor is marked **TO VERIFY** until FGT supplies a cited value.
- **Program metrics** (`lib/program-metrics.ts`): the staff Overview's "Is the Reuse Partnership working?" section.

---

## Is it working? (the metrics)

| Metric | Year-1 target [ASSUMPTION] | Where it's measured |
|---|---|---|
| Partner laptops received | 250 a year (about 21 a month) | Staff Overview |
| Intake-to-Ready time, partner vs household | 40% faster | Staff Overview (from the chain of custody) |
| Partners who come back with a second batch | 70% | Staff Overview |
| Partner laptops sold, and revenue | — | Staff Overview |
| Passport views per sold device | 0.5 | Staff Overview, Device Passport analytics |
| Active Reuse Partners | 10 | Staff Overview |
| Pay-It-Forward raised | $2,000 a year | Fund ledger |

The demo shows these metrics computed from fictional demo data.

---

## What it costs FGT

| Item | Upfront | Ongoing |
|---|---|---|
| Software | $0 (open source, GPL-3.0) | — |
| Hosting (Vercel; Pro, since Hobby is for non-commercial use) | $0 | about $20 a month |
| Database, sign-in and storage (Supabase) | $0 | $0–$25 a month |
| Domain (optional) | $0–$20 | about $20 a year |
| QR labels (existing printer, Avery 5160 sheets) | about $30 | about $10 a month |
| Payments (Stripe, only for optional memberships and the fund) | $0 | per-transaction fees |
| **Total** | **about $50** | **about $30–$55 a month** |
| Staff time | about 4 hours to set up and learn | about 1–2 hours a week |

It fits FGT's constraints: no new hardware or space, the existing data-sanitization software stays the system of record, the existing shop and online store keep selling, and volunteers do most of the data entry at the bench.

## Proposed launch timeline

| When | What |
|---|---|
| Weeks 1–2 | FGT confirms the process wording on the certificate, weekly capacity, price breakdown and impact factors in Settings. Deploy, print labels, a one-hour staff walkthrough with `ADMIN_GUIDE.md`. |
| Weeks 3–8 | Pilot with 3 Reuse Partners from FGT's network. Volunteers use the bench during their normal shifts. |
| Month 3 | Review the Overview metrics against the targets above. Adjust capacity and score weights. |
| Months 4–12 | Open sign-up to more Toronto businesses; optional paid tiers only after the free program works. |

## Business model, in one line

The free **Community** tier *is* the program: FGT never charges for reuse. The value to FGT is more and better laptops sold at its existing prices. Optional Impact ($500) and Champion ($1,500) memberships buy extra reporting and recognition, never priority or influence over prices; they are memberships, not donations, so no tax receipt. All prices are [ASSUMPTION] until FGT confirms them.

## Mission guardrails built into the code

- Relay never sets or changes a price.
- Pay-It-Forward money can only be a discount for digital-inclusion recipients, and the fund can't go negative.
- Paid tiers never change the batch queue order (it's sorted by Batch Value Score only).
- Household donations of computers and accessories are still accepted, just triaged by the checker.

## What we need Free Geek Toronto to confirm

1. The exact data-sanitization process and software, and whether it produces a report per device (certificate wording).
2. Average sale price of a refurbished laptop.
3. Refurbishment time for a typical laptop, and how much faster uniform batches are.
4. Weekly bench capacity.
5. How a device's price is split across costs (the "Where your money goes" breakdown).
6. Cited impact factors (weight and CO₂e per device type).
7. Whether FGT can issue tax receipts (Relay assumes not, and never implies one).
8. Membership prices, if FGT wants paid tiers at all.
