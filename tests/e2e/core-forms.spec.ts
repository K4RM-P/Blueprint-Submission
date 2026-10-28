import { expect, test } from "@playwright/test";
import { signInAs, watchErrors } from "./helpers";

/**
 * Invalid, unexpected and missing input on every form in the core loop gets a clear,
 * friendly message and never a crash (AUTH-03, PP-03, CI-02, DP-10).
 */
test("sign-up: missing and invalid fields explain themselves", async ({ page }) => {
  const w = watchErrors(page);
  await page.goto("/login?mode=signup");
  await page.getByRole("button", { name: "Create partner account" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await expect(page.getByText("Enter your organization's name.")).toBeVisible();
  await page.getByLabel("Work email").fill("not-an-email");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create partner account" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Use at least 10 characters.")).toBeVisible();
  // An existing account gets a pointer to sign in, not an error dump.
  await page.getByLabel("Your name").fill("Priya Test");
  await page.getByLabel("Organization name").fill("Maple Ledger Accounting");
  await page.getByLabel("Work email").fill("demo-partner@geekloop.test");
  await page.getByLabel("Password").fill("a-long-test-password");
  await page.getByRole("button", { name: "Create partner account" }).click();
  await expect(page.getByText(/already exists|Too many sign-ups/)).toBeVisible();
  w.assertClean();
});

test("batch wizard: empty, zero, out-of-range and oversized values are caught before submit", async ({ page }) => {
  const w = watchErrors(page);
  await signInAs(page, "partner");
  await page.goto("/partner/batches/new");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter the make, e.g. Dell.")).toBeVisible();
  await expect(page.getByText("Enter the model, e.g. Latitude 5420.")).toBeVisible();
  await page.getByLabel("Make").fill("Dell");
  await page.getByLabel("Model").fill("Latitude 5420");
  await page.getByLabel("Approx. year").fill("1800");
  await page.getByLabel("Quantity").fill("0");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("That year looks too early.")).toBeVisible();
  await expect(page.getByText("Enter at least 1 device.")).toBeVisible();
  await page.getByLabel("Approx. year").fill("abc");
  await page.getByLabel("Quantity").fill("900");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Over 500? Contact us directly.")).toBeVisible();
  // Recovering works: fix the values and move on.
  await page.getByLabel("Approx. year").fill("");
  await page.getByLabel("Quantity").fill("5");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("radio", { name: "Drop-off" })).toBeVisible();
  w.assertClean();
});

test("verification and passport lookups with junk input are friendly", async ({ page }) => {
  const w = watchErrors(page);
  for (const n of ["GL-2026-9999", "nonsense", "%27%3B--"]) {
    await page.goto(`/verify/${n}`);
    await expect(page.getByRole("heading", { name: "We couldn't find that certificate." })).toBeVisible();
  }
  w.assertClean();
  // Unknown passports answer 404 on purpose (the browser logs the 404 itself), with a friendly page.
  for (const c of ["FGT-ZZZZZZZZ", "hello", "FGT-%3Cscript%3E"]) {
    const res = await page.goto(`/p/${c}`);
    expect(res?.status()).toBe(404);
    await expect(page.locator("main")).toContainText(/(couldn.t|can.t) find|not found|no passport/i);
  }
  // No crash and no server error: the only console lines are the browser's own 404 notices.
  expect(w.errors.filter((e) => !/status of 404/.test(e))).toEqual([]);
});
