# Relay staff guide

For Free Geek Toronto staff. No technical background needed. Relay sits alongside the tools you
already use: it does **not** replace FGT's online store, your data sanitization software, or a
volunteer-scheduling platform. It keeps the record of each partner batch and each laptop, and gives
the business that donated them a certificate and a Device Passport for every laptop.

Sign in at `/login` with your staff email. Everything below starts from the **Staff Console**.

---

## Daily tasks

### 1. Review new batches
1. **Overview** shows "partner batches to review". Click it, or open **Batches**.
2. Batches are sorted by **Batch Value Score**: uniform, newer laptops first.
3. Open a batch to see what the business is sending, their preferred week and any notes.
4. Choose **Approve & schedule**, pick a week (the glasses show how full each week is), and confirm.
   If the week is over capacity, Relay suggests the next open week. You can still schedule it by
   adding a short note, for example "Extra volunteer shift that week".
5. If you can't take a batch, choose **Decline** and write a kind, specific reason (the business sees it).

### 2. Receive devices
1. When the batch arrives, open it and press **Receive & add N devices**. Relay creates one record per
   laptop, each with its own Device Passport code.
2. Serial numbers are optional. To add them quickly, use **Paste or scan serials** on the batch page:
   paste a column from a spreadsheet, or scan each label with a barcode scanner. They fill the list top
   to bottom. Press **Save serials**.
3. Household (non-business) donations: **Devices → Household intake**.

### 3. Print QR labels
**QR labels** prints a sheet of 30 labels (Avery 5160 size). Stick one on each laptop. Each label opens
that laptop's Device Passport.

### 4. Verify data wipes
Volunteers wipe each drive with FGT's sanitization software and enter the report/reference ID it gives
them. Only staff can verify a wipe.
- **A whole batch:** open the batch and press **Verify N wipes** in the "Whole batch" card. Each laptop
  keeps the reference its volunteer recorded. Check the reports in your sanitization software first.
- **One laptop:** open it under **Devices** and press **Verify wipe**.
- **Across batches:** **Devices**, filter "Wipe pending verification", select, press `v`.

### 5. Issue certificates
When every laptop in a batch is verified (or recycled), the batch page shows **Issue certificate**.
Press it once. The business can download the PDF from their dashboard right away. It documents, for
each laptop, the method, the reference ID, the verification date and who verified it. Anyone can check
it's genuine at `/verify/` plus the certificate number.

### 6. Record sales
1. Open a **Ready** or **Listed** laptop under **Devices**.
2. **Set price** (Relay only shows the prices FGT sets).
3. **Record sale**: pick the date, how it was sold and the buyer's category (for example Student). Never
   enter a name. The laptop's passport then says it's in a new home, and the business that donated it
   sees "Now helping a student".
4. To list every ready laptop from a batch at once, use **List N ready in the store** on the batch page.

---

## Settings (Settings in the Staff Console)

| Setting | What it does |
|---|---|
| **Certificate wording** | **Sanitization standard** (optional; leave empty unless FGT has confirmed it follows one, for example "NIST SP 800-88 Clear". When it's empty, certificates don't mention any standard). **Process description**: a short, plain description of what FGT does to each drive. **Disclaimer line**: printed on every certificate and the public check page. |
| **Online store link** | The address of FGT's existing online store. Passports of ready or listed laptops link to it ("Find laptops like this at Free Geek Toronto"). |
| **Capacity** | How many devices the bench can take per week, and how long a device takes to refurbish. This drives the calendar partners see. |
| **Score weights** | How the Batch Value Score balances uniformity, age, volume and laptop share. They must add up to 1. |
| **Impact factors** | Average weight and CO₂e per device type, with a source and review date. They're marked TO VERIFY until FGT confirms them. |
| **Where your money goes** | The price breakdown shown on passports. It shows as "Illustrative" until you tick "confirmed". |
| **Household rules** | What the "Can I donate this?" checker accepts. |

Save each section with its own button. Changes apply everywhere straight away.

---

## Also in the console (quieter)
- **Partners**: every Reuse Partner and their optional membership tier.
- **Volunteers**: invite volunteers and staff, award the Mentor badge.
- **Pay-It-Forward**: the fund ledger and manual entries.

---

## If something breaks

1. **Refresh the page.** Most hiccups are a dropped connection.
2. **Read the message.** Relay explains what's wrong in plain words, for example "Only approved or
   scheduled batches can be received" or "Enter the sanitization method".
3. **A button is missing?** Relay only shows actions that are allowed for that laptop's current stage.
   For example, you can't sell a laptop until its wipe is verified.
4. **A certificate or passport looks wrong?** Don't try to edit history: it can't be changed by
   design. Add a note on the device instead, and contact the Relay team.
5. **Still stuck?** Contact the Relay team (the two student developers who built it) with the page
   address, what you clicked, and the message you saw. For the demo site, the **Reset demo** button on
   `/demo` puts fresh work back in every queue.
