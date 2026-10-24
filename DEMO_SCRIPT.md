# Relay demo script (about 3 minutes of the 8-minute presentation)

**Before recording**
- Run `pnpm seed` against the demo project to reset the data. It's idempotent, and the passport codes come out the same every time.
- Use a 1440×900 browser window, plus a phone (or DevTools at 390 px) for the passport and the bench.
- Open these tabs in this order: `/` · `/demo` (×3 roles in separate browser profiles, or sign out between them) · a passport in a private window.
- Switch on "reduce motion" only if the recording stutters. The app still looks finished with it on.

Times are cumulative.

---

### 0:00 – 0:20 · The public face (landing)
1. `/`: hold on the hero ("Old laptops. New loops."). Point to the live **devices back in use** counter.
2. Scroll slowly through **The Loop**: the liquid fills Donated → Wiped & verified → Refurbished → In someone's hands, and each station shows a real number.
3. Say: *"Free Geek Toronto has zero corporate partners. Relay gives businesses a reason to send uniform laptops, and shows everyone where they go."*

### 0:20 – 0:55 · F1: a partner donates (Partner)
4. `/demo` → **Explore as a Partner** (Maple Ledger Accounting, Impact tier).
5. **New batch** → Dell · Latitude 5420 · 2021 · quantity **20** · Working. The **Batch Value Score** vessel rises to **Excellent**. Read the tip aloud.
6. Next → **drop-off**, then pick an **Open** week from the capacity glasses (Full weeks have a lid).
7. Next → tick the data-handling box → **Submit**. The vessel fills to the score (the one celebration); then open **Dashboard**: the batch shows **Submitted**.

### 0:55 – 1:25 · F2 + F4: staff run intake and prove the wipe (Staff)
8. **Explore as Staff** → Overview: 4 pebbles, the capacity glasses for the next 4 weeks, pending approvals.
9. **Batches**: the queue is sorted by score, with Maple Ledger's batch on top. Open it → **Approve** → **Schedule** (no capacity warning) → **Receive** → bulk-add 20 devices. Each gets a unique `FGT-` passport code.
10. **QR labels** → show the print preview of the 30-up sheet. (One sentence: "Volunteers stick these on.")
11. **Devices** → filter *Wipe pending verification* → select all → press **`v`** → method + report reference → verify. Say: *"Only staff can verify a wipe, and the database enforces it."*
12. Open **Queen West Design Co.**'s fully verified batch → **Issue certificate** (sky stamp). Open the PDF for 2 seconds, then `/verify/GL-…`: genuine, with no serial numbers.

### 1:25 – 1:50 · F3: the volunteer bench (Volunteer, on a phone)
13. **Explore as a Volunteer** (Aisha) → **Claim next device**.
14. Tap **Hardware test** → **hold** the **Data wipe performed** tile (liquid fills) and enter the report ID → **OS installed** (Linux Mint) → **Final QA**.
15. A badge coin drops in. Open the **Skills Wallet**: badges with progress rings, plus "Passports you're on".

### 1:50 – 2:25 · F5: sale and passport (Staff → phone)
16. Staff → **Devices** → filter **Ready** → open one → **Set price** → **Record sale** → recipient **Student**, Pay-It-Forward subsidy $20.
17. On the phone (signed out), open that device's passport `/p/FGT-…`.
18. Scroll: the cover card, then the stamps (*Donated by Maple Ledger Accounting* → *Data wiped & verified* → *Refurbished by Aisha* → *In its new home*), the impact pebbles, **Where your money goes** (with the *Illustrative* tag), **Why isn't it free?**, and the Free Geek network note.
19. Say: *"No serial numbers, no wipe report IDs, no price paid — never on the public page."*

### 2:25 – 2:50 · F6: the partner sees impact (Partner)
20. Partner dashboard: "Your laptops are now helping **N people**", the recipient categories, devices over time.
21. **Impact report** → **Download annual report** (show page 1 for 2 seconds) → the **LinkedIn card** and suggested post → **Copy text**.

### 2:50 – 3:00 · Revenue without raising prices
22. `/pay-it-forward` → $10 → test checkout → Pay → thank-you banner. One line on **memberships**: "Partners pay for reporting and recognition, never for priority or prices."
23. (Optional, if time) `/donate`: a business with 20 laptops is routed to the partner program.

---

**Recovery tips:** if a step fails live, re-run `pnpm seed` and refresh. Every demo account works from `/demo`. If the partner already upgraded to Champion during a rehearsal, re-seed so the Membership page shows the upgrade path again.
