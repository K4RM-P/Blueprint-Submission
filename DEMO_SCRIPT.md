# Relay demo script (about 3 minutes of the 8-minute presentation)

**Before recording**
- Run `pnpm seed` against the demo project to reset the data. It's idempotent, and the passport codes come out the same every time.
- Use a 1440×900 browser window, plus a phone (or DevTools at 390 px) for the passport and the bench.
- Open these tabs in this order: `/` · `/demo` (×3 roles in separate browser profiles, or sign out between them) · a passport in a private window.
- Switch on "reduce motion" only if the recording stutters. The app still looks finished with it on.

Times are cumulative.

---

How the time splits: about **75%** on the core (the Reuse Partner pipeline and the Device Passport), the supporting features as they come up, and one line on the "also included" extras at the end.

### 0:00 – 0:20 · The promise (landing)
1. `/`: hold on the hero. Read the line under "Pass it on.": *free laptop retirement, a certified data wipe for every drive, and a Device Passport that shows who each laptop helps.* Point to **Become a Reuse Partner** and the live **devices back in use** counter.
2. Say: *"Free Geek Toronto's supply of good, uniform laptops is shrinking and it has zero corporate partners, while device sales are about 77% of its revenue. Businesses have no reason to pick it over a trade-in. Relay gives them one: free, certified data destruction and a visible record of who their laptops help."*
3. Scroll through **the relay**: business → certified data wipe → volunteer bench → Device Passport → impact back to the business. Stop on the **Device Passport** panel (the featured passport card and the code field).

### 0:20 – 0:55 · F1: a business becomes a Reuse Partner and sends a batch (Partner)
4. `/demo` → **Partner** (Priya at Maple Ledger Accounting).
5. **Donate a batch** → Dell · Latitude 5420 · 2021 · quantity **20** · Working. The **Batch Value Score** vessel rises to **Excellent**. Read the tip aloud: uniform batches are the fastest to refurbish.
6. Next → **drop-off**, then pick an **Open** week from the capacity glasses (Full weeks have a lid).
7. Next → tick the data-handling box → **Submit**. The vessel fills to the score (the one celebration); then open **Dashboard**: the batch shows **Submitted**.

### 0:55 – 1:30 · F2 + F4: staff run intake and certify the wipe (Staff)
8. **Staff** → Overview: the partner pipeline tiles (batches to review, next open bench week, wipes awaiting verification, certificates to issue), then incoming partner batches and the capacity glasses.
9. **Batches**: the queue is sorted by score, with Maple Ledger's batch on top. Open it → **Approve** → **Schedule** (no capacity warning) → **Receive** → bulk-add 20 devices. Each gets a unique `FGT-` Device Passport code.
10. **QR labels** → show the print preview of the 30-up sheet. ("Each laptop gets its passport sticker.")
11. **Devices** → filter *Wipe pending verification* → select all → press **`v`** → method + report reference → verify. Say: *"Only staff can verify a wipe, and the database enforces it."*
12. Open **Queen West Design Co.**'s fully verified batch → **Issue certificate** (sky stamp). Open the PDF for 2 seconds, then `/verify/GL-…`: genuine, with no serial numbers.

### 1:30 – 1:45 · F3: the volunteers who make it possible (Volunteer, on a phone)
13. **Volunteer** (Aisha) → the bench says where the next laptop came from and that her work lands on its Device Passport → **Claim next device**.
14. Tap **Hardware test** → **hold** the **Data wipe performed** tile (liquid fills) → **OS installed** → **Final QA**. A badge coin drops in. One line on the **Skills Wallet**.

### 1:45 – 2:30 · F5: the Device Passport (Staff → phone)
15. Staff → **Devices** → filter **Ready** → open one → **Set price** → **Record sale** → recipient **Student**.
16. On the phone (signed out), scan the passport `/p/FGT-WRAPPED2`. It opens **Relay Wrapped**: the booklet opens → *"This laptop has a story."* → **Tap to begin**.
17. Let it play (or tap right): **Leg 1 · Donated by a Reuse Partner**: *Its first job was at Maple Ledger Accounting* → the handoff → **Certified data wipe: Every byte erased** (sky seal) → *Aisha brought it back to life* → Linux Mint → kg kept out of landfill → **Where your money goes** (*Illustrative*) → **Why isn't it free?** → the collectible card → **Share my laptop's story**.
18. Tap ✕ for the full passport: **Donated by Maple Ledger Accounting · A Reuse Partner** and **Certified data wipe · Verified** sit right on the cover. Say: *"This is what makes the impact visible to buyers and to the business. No serial numbers, no report IDs, no price paid, no buyer."*

**Showcase passports** (fixed codes from `pnpm seed`; also listed on `/demo` under "Scan a Device Passport", and `FGT-WRAPPED2` is the featured passport on the landing page):

| Code | Story |
|---|---|
| `FGT-WRAPPED2` | The full relay: Maple Ledger → Aisha → sold, with a Pay-It-Forward subsidy. 12 slides. **Use this one for the video.** |
| `FGT-QUEEN7WD` | Anonymous: the donor and volunteer opted out, so it says "a Toronto business" / "an FGT volunteer". |
| `FGT-BENCH24Z` | Still on the bench with Jordan: ends on "Its next leg is coming soon." |
| `FGT-PARTS4RC` | Recycled after its hardware test: "Its parts live on through responsible recycling." |

Deep link any slide with `?s=N` (e.g. `/p/FGT-WRAPPED2?s=12` is the card). On a phone over Wi-Fi: run `pnpm dev -H 0.0.0.0`, then open `http://<your-laptop-LAN-IP>:3000/p/FGT-WRAPPED2`. For the printed QR codes to point at your laptop, set `NEXT_PUBLIC_SITE_URL=http://<LAN-IP>:3000` in `.env.local` first.

### 2:30 – 2:50 · F6: why partners come back (Partner)
19. Partner dashboard: "Your laptops are helping **N people**", certificates issued, then **Your laptops' Device Passports**: open one to show the partner can follow its own laptops.
20. **Impact report** → **Download annual report** (2 seconds) → the **LinkedIn card** and suggested post.

### 2:50 – 3:00 · Also included, and the money
21. One line, no clicks needed: *"Relay also includes a Pay-It-Forward fund, a 'Can I donate this?' checker for households, and optional paid memberships. The Community tier is free; the real value to Free Geek Toronto is more and better laptops, without raising prices for the people it serves."* (If time: footer → **Pay it forward** → $10 → test checkout.)

---

**Recovery tips:** if a step fails live, re-run `pnpm seed` and refresh. Every demo account works from `/demo`. If the partner already upgraded to Champion during a rehearsal, re-seed so the Membership page shows the upgrade path again.
