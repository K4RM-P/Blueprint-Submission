# Relay demo script (about 3 minutes of the 8-minute presentation)

The whole demo follows **one batch through the core loop**: a business signs up and submits a batch →
staff intake → volunteers refurbish → certified data wipe → certificate → Device Passport, the
business's proof of impact. One line at the end covers the included extras.

**Before recording**
- Run `pnpm seed` to reset the data (idempotent; passport codes come out the same every time). On a shared
  deployment, press **Reset demo** on `/demo` instead.
- 1440×900 browser window, plus a phone (or DevTools at 390 px) for the bench and the passport.
- Tabs: `/` · `/demo` (one browser profile per role, or sign out between them) · a private window for the public passport.

Times are cumulative.

---

### 0:00 – 0:20 · The promise (landing)
1. `/`: hold on the hero. Point to **Become a Reuse Partner** and the featured Device Passport.
2. Say: *"Free Geek Toronto's supply of uniform laptops is shrinking and it has no corporate partners, while
   device sales are about 77% of its revenue. Relay turns Toronto small businesses into a recurring source of
   those laptops: a free, documented data wipe, no hassle, and a Device Passport that proves who each laptop helps."*

### 0:20 – 0:50 · A business sends its first batch (Partner)
3. `/demo` → **Partner** (Priya at Maple Ledger Accounting). *(A brand-new business does the same in under two minutes: name, organization, email, password, then straight into this form.)*
4. **Donate a batch** → Dell · Latitude 5420 · 2021 · quantity **20**. The **Batch Value Score** rises to **Excellent**.
5. **Continue**: drop-off and the next open week are already chosen → **Continue** → tick *drives intact* → **Submit**.
   Point at **Quick answers**: data security, cost (free), why not trade in, membership isn't a donation.

### 0:50 – 1:25 · Staff intake in seconds (Staff)
6. **Staff** → Overview: the partner pipeline tiles, then the **Reuse Partnership** metrics (demo figures).
7. **Batches** → Maple Ledger's batch on top → **Approve & schedule** → **Receive & add 20 devices**. Each gets a `FGT-` passport code.
8. **Paste or scan serials** → paste 20 serials → **Save 20 serials**. **QR labels** → the 30-up sheet.

### 1:25 – 1:50 · Volunteers refurbish as a set (Volunteer, on a phone)
9. **Volunteer** (Aisha) → **Claim 5 at once** → **Work on all 5 … together**.
10. **Hardware test passed · 5** → paste five sanitization references (one per laptop) → **hold** to confirm 5 wipes →
    **Mark installed · 5** → **Final QA passed · 5**. *"Each laptop still has its own reference and its own record."*

### 1:50 – 2:15 · Certified data wipe and certificate (Staff)
11. The batch → **Verify N wipes** (only staff can, and the database enforces it).
12. Open **Queen West Design Co.**'s fully verified batch → **Issue certificate** (sky stamp). Open the PDF for two
    seconds: method, reference ID, verification date and who verified it, for every device. Then `/verify/GL-…`:
    genuine, no serial numbers or reference IDs.

### 2:15 – 2:50 · The Device Passport: proof of impact (Partner → phone)
13. **Partner** → **Your laptops**: every laptop, its stage, "Now helping a student", and total passport views.
14. Open `FGT-WRAPPED2`: *"This was one of your laptops, Maple Ledger Accounting."* Let it play: donated by a Reuse Partner →
    **certified data wipe** → *Aisha brought it back to life* → impact → **Where your money goes** (*Illustrative*) → the card
    and *"Thank you, Maple Ledger Accounting."* → **Share**.
15. On the phone, signed out, scan the same passport: the public version. *"No serial numbers, no reference IDs, no buyer, no price."*

### 2:50 – 3:00 · Also included
16. One line, no clicks: *"Relay also includes a Pay-It-Forward fund, a 'Can I donate this?' checker for households,
    Skills Wallet badges and optional memberships. The free tier is the program; the real value to Free Geek Toronto is
    more and better laptops."*

---

**Showcase passports** (fixed codes from `pnpm seed`; also listed on `/demo` under "Scan a Device Passport", and `FGT-WRAPPED2` is the featured passport on the landing page):

| Code | Story |
|---|---|
| `FGT-WRAPPED2` | The full relay: Maple Ledger → Aisha → sold, with a Pay-It-Forward subsidy. 12 slides. **Use this one for the video.** |
| `FGT-QUEEN7WD` | Anonymous: the donor and volunteer opted out, so it says "a Toronto business" / "an FGT volunteer". |
| `FGT-BENCH24Z` | Still on the bench with Jordan: ends on "Its next leg is coming soon." |
| `FGT-PARTS4RC` | Recycled after its hardware test: "Its parts live on through responsible recycling." |

Deep link any slide with `?s=N` (e.g. `/p/FGT-WRAPPED2?s=12` is the card). On a phone over Wi-Fi: run `pnpm dev -H 0.0.0.0`, then open `http://<your-laptop-LAN-IP>:3000/p/FGT-WRAPPED2`. For the printed QR codes to point at your laptop, set `NEXT_PUBLIC_SITE_URL=http://<LAN-IP>:3000` in `.env.local` first.

---

**Recovery tips:** if a step fails live, press **Reset demo** on `/demo` (or re-run `pnpm seed`) and refresh. Every demo account works from `/demo`.
