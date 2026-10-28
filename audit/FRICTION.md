# Data-entry friction: before and after

Relay only helps if it saves Free Geek Toronto more time than it costs. We counted every
**interaction** (a click, a tap, focusing a field, typing or scanning one value, pressing a
key that matters) for the three flows staff and volunteers repeat for every device.

**Method.** Counted by hand on the running app, then re-counted in the Playwright specs that
drive the same flows (`tests/e2e/f2-staff.spec.ts`, `f3-volunteer.spec.ts`, `vw-set.spec.ts`).
"Per device" divides the total by the number of devices. Typing or scanning one value counts as one
interaction, however many characters it has. Navigation to the page you start on is not counted.

**Uniform batch used for the numbers:** 20 identical laptops for intake and verification (a typical
partner batch); a set of 5 identical laptops for the volunteer bench (what one volunteer claims at once).

## Before (commit c9db69c)

### Intake (staff), batch of 20

| Step | Interactions |
|---|---|
| Receive & add 20 devices (one button, already bulk) | 1 |
| Per device: focus the serial field, type or scan the serial | 2 × 20 = 40 |
| Save changes | 1 |
| **Total** | **42 → 2.10 per device** |

### Volunteer checklist, per device

| Step | Interactions |
|---|---|
| Claim next device (opens the device) | 1 |
| Hardware test tile | 1 |
| Data wipe: focus the report ID field, type or scan the ID | 2 |
| Data wipe: hold to confirm | 1 |
| Mark OS installed (OS prefilled) | 1 |
| Final QA tile | 1 |
| Back to My Bench | 1 |
| **Total** | **8 per device** |

### Wipe verification (staff), batch of 20

The only bulk path was the Devices table: filter to "wipe pending", then tick each device of this batch
(other batches' devices are mixed in the same filter).

| Step | Interactions |
|---|---|
| Filter: wipe pending verification | 1 |
| Tick each of the batch's 20 devices | 20 |
| Press `v` (or Verify) | 1 |
| Confirm Verify in the dialog (method prefilled) | 1 |
| **Total** | **23 → 1.15 per device** |

Bulk status change for the batch (list every ready device in the store) followed the same pattern:
filter + 20 ticks + choose status = **22 → 1.10 per device**.

**All three flows, per device: 2.10 + 8 + 1.15 = 11.25 interactions.**

## After (this change)

### Intake (staff), batch of 20

The batch page has a **Paste or scan serials** box: paste a column from a spreadsheet, or scan each
label (scanners end every scan with Enter, which is a new line). Serials fill the devices without one,
top to bottom; duplicates and extras are flagged before saving. One button saves them all.

| Step | Interactions |
|---|---|
| Receive & add 20 devices | 1 |
| Focus the paste box | 1 |
| Paste the list (or: 20 scans, see note) | 1 |
| Save 20 serials | 1 |
| **Total** | **4 → 0.20 per device** (scanning instead of pasting: 23 → 1.15) |

### Volunteer bench, set of 5 identical laptops

**Claim 5 at once** puts five devices on the bench; identical ones show **Work on all 5 … together**.
Steps that need no per-device data (hardware test, OS install, final QA) are one tap for the whole set.
The data wipe still records **one sanitization reference per device**: paste a list (matched in order)
or scan, and each scan's Enter jumps to the next device.

| Step | Interactions |
|---|---|
| Claim 5 at once | 1 |
| Open "Work on all 5 together" | 1 |
| Hardware test passed · 5 devices | 1 |
| Data wipe: focus the first reference field, paste 5 references | 2 |
| Hold to confirm 5 wipes | 1 |
| Mark installed · 5 (OS prefilled) | 1 |
| Final QA passed · 5 devices | 1 |
| **Total** | **8 → 1.60 per device** (scanning instead of pasting: 12 → 2.40) |

The single-device checklist is unchanged and still there for one-off household donations.

### Wipe verification (staff), batch of 20

The batch page has a **Whole batch** card: **Verify 20 wipes** (each device keeps the reference its
volunteer recorded) and **List N ready in the store**.

| Step | Interactions |
|---|---|
| Verify 20 wipes | 1 |
| Confirm Verify in the dialog (method prefilled) | 1 |
| **Total** | **2 → 0.10 per device** |

Bulk status change for the batch: **List N ready in the store** = **1 → 0.05 per device**.

**All three flows, per device: 0.20 + 1.60 + 0.10 = 1.90 interactions.**

## Result

| Flow | Before (per device) | After (per device) | Change |
|---|---|---|---|
| Intake (serials) | 2.10 | 0.20 (scan: 1.15) | −90% (scan: −45%) |
| Volunteer checklist | 8.00 | 1.60 (scan: 2.40) | −80% (scan: −70%) |
| Wipe verification | 1.15 | 0.10 | −91% |
| Batch status change | 1.10 | 0.05 | −95% |
| **Intake + bench + verification** | **11.25** | **1.90** (all scanned: 3.65) | **−83%** (scanned: −68%) |

Target was at least 50% fewer interactions per device for uniform batches. Met in every flow, with
pasting or scanning.

## Rules that did not change

- **Per-device sanitization references.** Set mode refuses to record a wipe unless every device has
  its own reference, and refuses duplicates in the same submission (`completeStepBulk`,
  `server/actions/volunteer.ts`). Each device still goes through its own `complete_step()` call.
- **Staff-only wipe verification.** Enforced by the `guard_device` trigger; the batch button calls the
  same `verifyWipes` action as before.
- **Append-only device events.** Every device still gets its own `device_events` rows; bulk actions are
  loops over the per-device path, not a shortcut around it.
- **The status machine.** Unchanged; bulk actions skip any device that isn't in the right state and say so.
- **Hold to confirm** stays on the data-wipe step: it's the one deliberate confirmation in the flow.
