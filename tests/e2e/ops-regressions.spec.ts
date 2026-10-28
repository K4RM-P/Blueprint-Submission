import { expect, test } from "@playwright/test";
import { signInAs, watchErrors } from "./helpers";

/** Regressions found in review: reschedule (OPS-03), the `v` shortcut (OPS-05/07), and recovering from a wizard error (PP-03). */

test("OPS-03 — a scheduled batch can be rescheduled to another week", async ({ page }) => {
  const w = watchErrors(page);
  await signInAs(page, "staff");
  await page.goto("/staff/batches?status=scheduled");
  await page.locator("table tbody a[href^='/staff/batches/']").first().click();
  await page.getByRole("button", { name: "Reschedule" }).click();
  const dialog = page.getByRole("dialog");
  const weeks = dialog.getByRole("radio");
  await weeks.last().click();
  await dialog.getByRole("button", { name: /^Schedule week of/ }).click();
  const warning = dialog.getByRole("alert");
  if (await warning.isVisible().catch(() => false)) {
    await dialog.getByLabel("Or override with a note").fill("Rescheduled in a test run");
    await dialog.getByRole("button", { name: /Schedule anyway/ }).click();
  }
  await expect(page.getByText(/Batch rescheduled/)).toBeVisible();
  w.assertClean();
});

test("OPS-07 — pressing v opens bulk verify without typing into it, and verify works", async ({ page }) => {
  await signInAs(page, "staff");
  await page.goto("/staff/devices?status=wipe_pending_verification");
  await page.getByRole("checkbox", { name: "Select all devices on this page" }).check();
  // focus stays on the checkbox after selecting, exactly as for a real user
  await page.keyboard.press("v");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel(/Sanitization method/)).not.toHaveValue("v");
  await expect(dialog.getByLabel(/Sanitization method/)).toHaveValue(/FGT data-sanitization software/);
  await dialog.getByRole("button", { name: /^Verify/ }).click();
  await expect(page.getByText(/wipes? verified/)).toBeVisible();
});

test("PP-03 — after the data-handling error, ticking the box and one Continue moves on", async ({ page }) => {
  await signInAs(page, "partner");
  await page.goto("/partner/batches/new");
  await page.getByLabel("Make").fill("Lenovo");
  await page.getByLabel("Model").fill("ThinkPad T14");
  await page.getByLabel("Approx. year").fill("2022");
  await page.getByLabel("Quantity").fill("6");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Please confirm so we can wipe the drives for you.")).toBeVisible();
  await page.getByText(/drives intact/).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("cell", { name: /Lenovo ThinkPad T14/ })).toBeVisible();
});

test("OPS-03 — approve first, then schedule in the partner's preferred week: no false capacity warning", async ({ page }) => {
  await signInAs(page, "staff");
  await page.goto("/staff/batches?status=submitted");
  await page.getByRole("link", { name: "Kensington Code Collective" }).first().click();
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await expect(page.getByText(/Batch approved/)).toBeVisible();
  await page.getByRole("button", { name: /^Schedule/ }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /^Schedule week of/ }).click();
  await expect(page.getByText(/Batch scheduled/)).toBeVisible();
  await expect(dialog.getByText(/over capacity/)).toHaveCount(0);
});

test("VW-02 — a volunteer flags a failed hardware test and staff see it on the Overview", async ({ page, browser }) => {
  await signInAs(page, "volunteer");
  await page.getByRole("button", { name: /Claim next device/ }).last().click();
  await page.waitForURL(/\/volunteer\/devices\//);
  await page.getByRole("button", { name: "Didn't pass? Tell staff" }).click();
  await page.getByLabel("What didn't pass?").fill("Screen stays black on power-up");
  await page.getByRole("button", { name: "Tell staff" }).click();
  await expect(page.getByText(/Sent to staff/).first()).toBeVisible();

  const staff = await (await browser.newContext()).newPage();
  await signInAs(staff, "staff");
  await expect(staff.getByRole("heading", { name: "Flagged by volunteers" })).toBeVisible();
  await expect(staff.getByText("Screen stays black on power-up")).toBeVisible();
});

test("OPS-04 — when fewer laptops arrive than declared, only those get passports and the declared count is kept", async ({ page }) => {
  const w = watchErrors(page);
  await signInAs(page, "staff");
  await page.goto("/staff/batches?status=approved");
  await page.getByRole("link", { name: "Annex Architecture Studio" }).first().click();
  await page.getByRole("button", { name: "Fewer arrived?" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("HP ZBook 15 G5").fill("13");
  await dialog.getByRole("button", { name: "Receive & add 13 devices" }).click();
  await expect(page.getByText("Received. 13 devices added with passport codes.")).toBeVisible();
  await expect(page.getByRole("main")).toContainText("15 × HP ZBook 15 G5 declared, 13 arrived");
  w.assertClean();
});

test("PP-03 — ticking the checkbox itself (not its label) clears the error, and one Continue moves on", async ({ page }) => {
  await signInAs(page, "partner");
  await page.goto("/partner/batches/new");
  await page.getByLabel("Make").fill("Dell");
  await page.getByLabel("Model").fill("Latitude 5420");
  await page.getByLabel("Approx. year").fill("2021");
  await page.getByLabel("Quantity").fill("4");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Please confirm so we can wipe the drives for you.")).toBeVisible();
  await page.getByRole("checkbox", { name: /drives intact/ }).click();
  await expect(page.getByText("Please confirm so we can wipe the drives for you.")).toBeHidden();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("cell", { name: /Dell Latitude 5420/ })).toBeVisible();
});
