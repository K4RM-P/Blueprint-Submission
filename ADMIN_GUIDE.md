# Relay admin guide (for Free Geek Toronto staff)

This guide is for the person who runs Relay day to day at Free Geek Toronto. You don't need any technical knowledge. Everything here happens in the **Staff Console** at `/staff` after you sign in.

> In the demo, sign in from `/demo` → **Staff** (Marcus). All organizations and people in the demo are fictional.

---

## Your routine

**Daily, about 10 minutes.** Open **Overview**. The four tiles across the top are your to-do list, and each one links straight to the job:

| Tile | What to do |
|---|---|
| **Partner batches to review** | Approve and schedule new batches (below). The best Batch Value Score is listed first. |
| **Next open bench week** | Nothing to do. It tells you when the bench next has room. |
| **Wipes awaiting verification** | Check each report in your data-sanitization software, then verify in Relay. |
| **Certificates to issue** | Issue the certificate for every batch whose devices are all verified or recycled. |

**On a drop-off day, about 15 minutes per batch.** Receive the batch, add its devices and print QR labels.

**Weekly, about 30 minutes.** Look at **Is the Reuse Partnership working?** on the Overview, record sales, and check **Bench capacity** for the next four weeks.

---

## 1. A new batch arrives from a Reuse Partner

1. **Batches** (or the first Overview tile). Batches are sorted by **Batch Value Score**: uniform batches of newer laptops score highest because they are the fastest to refurbish and sell.
2. Open the batch. You see the partner, what they're sending, their preferred week and their notes.
3. Press **Approve & schedule**, pick a week, and press **Schedule week of …**. (Plain **Approve** accepts the batch now and lets you pick the week later with **Schedule**.)
   - Weeks are marked **Open**, **Limited** or **Full** using your weekly capacity (Settings).
   - If you pick a Full week, Relay warns you and suggests the next open week. You can still press **Schedule anyway**, but you must write a short note saying why.
4. If you can't take the batch, press **Decline** and give a reason. The partner sees the reason.

The partner sees every change on their dashboard straight away.

## 2. Drop-off day: receive the batch

1. Open the batch and press **Receive & add N devices**. Relay creates one device record per laptop, each with its own **Device Passport** code (`FGT-XXXXXXXX`).
2. Optional: type serial numbers into the grid. Serials are private: they never appear on a public page, the app shows them only to staff and the owning partner, and they appear on the partner's certificate. (A volunteer's database access covers the devices assigned to them, serials included.)
3. On the batch page, under the serials, click **Print QR labels for these N** and print the sheet (Avery 5160, 30 labels per page). Stick one label on each laptop. (**QR labels** in the menu prints the 30 most recently received devices; on **Devices** you can also select rows and choose **Labels**.)

**Household donations** (not from a partner): **Devices** → **Household intake**. They follow the same steps, without a partner or certificate.

## 3. Volunteers refurbish

You don't need to do anything here. Volunteers open **My Bench** on their phone, press **Claim next device** (Relay hands out the best-scoring partner devices first) and work through four steps: **Hardware test → Data wipe performed → OS installed → Final QA**.

When a volunteer finishes the wipe, the device waits for you: **volunteers can never verify a wipe.**

If you need to give a device to a specific volunteer: open it under **Devices** and use **Assign volunteer**.

If a laptop fails its hardware test, the volunteer presses **Didn't pass? Tell staff** and writes what's wrong. It appears under **Flagged by volunteers** at the top of the Overview; open the device and repair it or press **Recycle**.

## 4. Verify wipes (staff only)

1. Overview → **Wipes awaiting verification** (or **Devices**, filtered to *Wipe pending verification*).
2. Check each device's report in your data-sanitization software. Relay records the result; it does not perform the wipe.
3. Tick the devices (or the box at the top to select all) and press **Verify N wipes** (keyboard shortcut: `v`). Confirm the method as it appears in your sanitization report. Each device keeps the report ID its volunteer recorded; devices without one are skipped. To verify one device with a different reference, open it and use **Verify wipe** there.

Relay won't let any device become Ready or be sold without a staff-verified wipe. This is enforced by the database, not just the screen.

## 5. Issue the certificate

When every device in a batch is verified or recycled, the batch shows **Issue certificate**. Press it. Relay creates a numbered certificate (`GL-YEAR-NNNN`) that lists each device, its serial if recorded, the wipe method, verification date and outcome, plus a public link anyone can use to check it's genuine (the public page never shows serial numbers).

The partner can download the PDF from their dashboard immediately.

> **Before launch:** the certificate's "statement of process" paragraph is marked *to be confirmed by Free Geek Toronto*. Make sure it describes exactly what you do.

## 6. Sell a device

1. **Devices** → filter **Ready** → open the device.
2. **Set price.** Free Geek Toronto sets every price; Relay only displays it and never suggests or changes one.
3. **Record sale**: date, channel (in store, online or B2B) and, if you know it, the recipient category (for example *Student*). Never enter a name.
4. If the buyer is a digital-inclusion recipient (student, newcomer, senior, low-income household or non-profit) you can apply a **Pay-It-Forward** discount, as long as the fund has enough money. The fund can't go negative.

The device's Device Passport now tells its story to the buyer, and the partner's dashboard counts one more person helped.

## 7. Settings (check once before launch, then rarely)

**Settings** holds everything Relay assumes. Each value starts as a placeholder that Free Geek Toronto should confirm:

| Setting | What it changes |
|---|---|
| **Weekly capacity** | How many devices the bench can take a week. Drives the Open / Limited / Full weeks partners see. |
| **Refurbishment time** (uniform vs mixed) | Used for the volunteer-hours estimate. |
| **Batch Value Score weights** | How batches are ranked. |
| **Where your money goes** | The price breakdown shown on every Device Passport. It must add up to 100%. Until you tick *confirmed*, passports label it *Illustrative*. |
| **Impact factors** | Average weight and CO₂e per device type, with a source and a "last reviewed" date. Shown on the public `/impact` page. Seeded values say **TO VERIFY**. |
| **Accepted items** | What the public "Can I donate this?" checker accepts. |

## 8. People and partners

- **Volunteers** → **Invite a volunteer or staff member**: enter their email and role. They sign up with that email and get the right access. You can award the **Mentor** badge here.
- **Partners**: every Reuse Partner, their tier, membership dates and devices. You can change a tier by hand (for example after an invoice is paid outside Relay). Tiers buy reporting and recognition only, never priority or prices.
- **Pay-It-Forward**: the fund ledger. Use **Record money received** for contributions that didn't go through the online checkout.

## 9. Reports for funders

- **Devices** has a Devices CSV and **Partners** has a Batches CSV, for grant reports.
- The Overview's **Impact to date** uses the same formula as every other page in Relay (`lib/impact.ts`), so the numbers always agree.

---

## If something goes wrong

| Problem | Fix |
|---|---|
| A partner picked a week you can no longer take | Open the batch and press **Reschedule**. Relay warns you if the new week is over capacity and suggests the next open week. |
| A device fails its hardware test | Open it and press **Recycle**, with a reason. It still counts as e-waste kept out of landfill, and its passport says it was recycled responsibly. |
| A wrong note was added | Notes can't be edited or deleted (the chain of custody is append-only). Add a new note that corrects it. |
| Someone can't sign in | They can use **Forgot password** on the sign-in page. Staff and volunteer accounts only work for emails you invited. |
| Demo data looks messy after rehearsals | Run `pnpm seed`. It resets the demo data; the showcase Device Passport codes stay the same. |

## Who can do what

| | Partner | Volunteer | Staff |
|---|---|---|---|
| Submit, edit (while submitted) or withdraw a batch | ✓ | | |
| Approve, decline, schedule, receive a batch | | | ✓ |
| Claim a device, record test, wipe, OS install, QA | | ✓ (own devices) | |
| **Verify a wipe** | | | ✓ only |
| Issue a certificate, set a price, record a sale | | | ✓ |
| See serial numbers | Own batches | Devices assigned to them (the app doesn't show it; the database allows it) | ✓ |
| Change settings, invite people | | | ✓ |

These rules are enforced in the database (row-level security), so they hold even if someone bypasses the screens.
