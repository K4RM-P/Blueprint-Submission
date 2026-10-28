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
