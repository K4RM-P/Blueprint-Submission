# Relay demo script (about 3 minutes of the 8-minute presentation)

**Before recording**
- Run `pnpm seed` against the demo project to reset the data. It's idempotent, and the passport codes come out the same every time.
- Use a 1440×900 browser window, plus a phone (or DevTools at 390 px) for the passport and the bench.
- Open these tabs in this order: `/` · `/demo` (×3 roles in separate browser profiles, or sign out between them) · a passport in a private window.
- Switch on "reduce motion" only if the recording stutters. The app still looks finished with it on.

Times are cumulative. The core loop runs about **3 minutes 15 seconds**. Record each role as its own clip and cut the page loads and typing: a judge sees every step, never a spinner.

---

How the time splits: about **75%** on the core (the Reuse Partner pipeline and the Device Passport), the supporting features as they come up, and one line on the "also included" extras at the end.

### 0:00 – 0:25 · The problem and the promise (landing)
1. `/`: hold on the hero, *"Free laptop retirement for Toronto businesses · Pass it on."* Read the line under it. Point to **Become a Reuse Partner**.
2. Scroll one screen to **Why Relay exists**: *0 corporate partners · 77% of revenue from sales · 63% of Canadians buy refurbished or traded-in tech.* Say: *"Free Geek Toronto's best supply, uniform business laptops, goes to trade-ins. Relay gives businesses a reason to choose Free Geek Toronto: a free, certified data wipe and proof of who their laptops help."*

### 0:25 – 0:40 · Why a business would switch (Become a Partner)
3. `/become-a-partner` → scroll to **Your options for old laptops**: trade-in, reseller, paid disposal, recycling drop-off, the drawer, then the **Reuse Partnership** row. One sentence: *"Free, certified, and the story doesn't end."*

### 0:40 – 1:10 · F1: a Reuse Partner sends a batch (Partner)
4. `/demo` → **Partner** (Priya at Maple Ledger Accounting).
5. **Donate a batch** → Dell · Latitude 5420 · 2021 · quantity **20** · Working. The **Batch Value Score** vessel rises to **Excellent**. Read the tip: uniform batches are the fastest to refurbish.
6. Continue → **drop-off**, pick an **Open** week from the capacity glasses (weeks with no room for this batch have a lid). Continue → tick the data-handling box → **Submit**. The vessel fills (the one celebration). **Back to dashboard**: the batch shows **Submitted**.

### 1:10 – 1:40 · F2: staff run intake (Staff)
7. **Staff** → Overview: the four partner-pipeline tiles and the capacity glasses.
8. **Batches** (open batches, best score first) → Maple Ledger's batch for the week you just picked (the seed has another 20 × Dell batch from Maple Ledger for a different week; either works) → **Approve & schedule** → pick a week → **Receive & add 20 devices**. Each gets its own `FGT-` Device Passport code.
9. On the batch page → **Print QR labels for these 20** → the 30-up sheet. *"Each laptop gets its passport sticker."*

### 1:40 – 1:55 · F3: the volunteer bench (Volunteer, on a phone)
10. **Volunteer** (Aisha) → **Claim next device** → **Hardware test** → **hold** **Data wipe performed** (liquid fills) → **OS installed** → **Final QA**. A badge coin drops in.

### 1:55 – 2:20 · F4: the certified data wipe (Staff)
11. **Devices** → filter *Wipe pending verification* → select all → **`v`** → **Verify** (each device keeps the report ID its volunteer recorded). Say: *"Only staff can verify a wipe, and the database enforces it."* (The method field names Free Geek Toronto's own software until FGT confirms its standard.)
12. Open **Queen West Design Co.**'s fully verified batch → **Issue certificate** (this works once per seed: run `pnpm seed` before each take) (sky stamp) → the PDF for two seconds → `/verify/GL-…`: genuine, no serial numbers.

### 2:20 – 2:50 · F5: the Device Passport (phone, signed out)
13. Open `/p/FGT-WRAPPED2` (already sold to a student, so no need to record the sale live). **Tap to begin** and let it play, or tap right: donated by **Maple Ledger Accounting** → **Certified data wipe: Its old data, wiped** (sky seal) → *Aisha brought it back to life* → Linux Mint → kg kept out of landfill → **Where your money goes** (*Illustrative*) → **Why isn't it free?** → the collectible card.
14. Tap ✕ for the full passport: **Donated by Maple Ledger Accounting · A Reuse Partner** and **Certified data wipe · Verified** on the cover. Say: *"This is the impact made visible, to the buyer and the business. No serial numbers, report IDs, price or buyer."*

### 2:50 – 3:10 · F6: why partners come back, and whether it's working
15. Partner dashboard: *"Your laptops are helping N people"*, the certificate, **Your laptops' Device Passports**. **Impact report** → the LinkedIn card and suggested post.
16. Staff Overview → **Is the Reuse Partnership working?**: partner laptops a month, partner laptops reach Ready faster than household donations, repeat partners, partner-laptop sales, passport views per sold device. *"These are the numbers we'd review with Free Geek Toronto after the pilot. The targets are our assumptions until FGT confirms them."*

### 3:10 – 3:20 · Also included, and the money
17. One line, no clicks: *"Relay also includes a Pay-It-Forward fund, a 'Can I donate this?' checker for households, and optional paid memberships. The Community tier is free; the real value to Free Geek Toronto is more and better laptops, without raising prices for the people it serves."*

Optional extra clip (if time allows in the edit): staff → **Devices** → filter **Ready** → open one → **Set price** → **Record sale** → recipient **Student**, then that device's passport.

**Showcase passports** (fixed codes from `pnpm seed`; also listed on `/demo` under "Scan a Device Passport", and `FGT-WRAPPED2` is the featured passport on the landing page):

| Code | Story |
|---|---|
| `FGT-WRAPPED2` | The full relay: Maple Ledger → Aisha → sold, with a Pay-It-Forward subsidy. 13 slides. **Use this one for the video.** |
| `FGT-QUEEN7WD` | Anonymous: the donor and volunteer opted out, so it says "a Toronto business" / "an FGT volunteer". |
| `FGT-BENCH24Z` | Still on the bench with Jordan: ends on "Its next leg is coming soon." |
| `FGT-PARTS4RC` | Recycled after its hardware test: "Its parts live on through responsible recycling." |

Deep link any slide with `?s=N` (e.g. `/p/FGT-WRAPPED2?s=13` is the collectible card). On a phone over Wi-Fi: run `pnpm dev -H 0.0.0.0`, then open `http://<your-laptop-LAN-IP>:3000/p/FGT-WRAPPED2`. For the printed QR codes to point at your laptop, set `NEXT_PUBLIC_SITE_URL=http://<LAN-IP>:3000` in `.env.local` first.

---

**Recovery tips:** if a step fails live, re-run `pnpm seed` and refresh. Every demo account works from `/demo`. If the partner already upgraded to Champion during a rehearsal, re-seed so the Membership page shows the upgrade path again.
