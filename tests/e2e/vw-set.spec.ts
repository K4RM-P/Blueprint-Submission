import { expect, test } from "@playwright/test";
import { signInAs, watchErrors } from "./helpers";

/**
 * Friction cut for uniform batches (VW-01, VW-02): claim several at once, then finish
 * steps for all identical devices together. Runs after F3 so F3 still earns its badges.
 */
test("volunteer set mode: identical devices in one checklist, one wipe reference per device (VW-02)", async ({ page }) => {
  const w = watchErrors(page);
  await signInAs(page, "volunteer");
  await page.goto("/volunteer/set?make=Nope&model=Nothing");
  await expect(page.getByText("No matching devices on your bench.")).toBeVisible();

  await page.goto("/volunteer");
  await page.getByRole("button", { name: /Claim \d+ at once/ }).first().click();
  await expect(page.getByText(/devices? claimed/)).toBeVisible();
  await page.getByRole("link", { name: /Work on all \d+ .* together/ }).first().click();
  await page.waitForURL(/\/volunteer\/set\?/);

  await page.getByRole("button", { name: /Hardware test passed · \d+ devices/ }).click();
  await expect(page.getByText(/devices? done/).first()).toBeVisible();
  const keepGoing = page.getByRole("button", { name: "Keep going" });
  if (await keepGoing.isVisible()) await keepGoing.click();

  // Scanner-style entry: each Enter jumps to the next device. A duplicate is refused.
  const refs = page.getByLabel(/^Reference for FGT-/);
  const n = await refs.count();
  expect(n).toBeGreaterThanOrEqual(2);
  await refs.first().focus();
  const stamp = Date.now();
  for (let i = 0; i < n; i++) {
    await page.keyboard.type(i <= 1 ? `SET-DUP-${stamp}` : `SET-REF-${stamp}-${i}`);
    await page.keyboard.press("Enter");
  }
  const hold = page.getByRole("button", { name: /Hold to confirm \d+ wipes/ });
  await hold.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Two devices have the same reference. Each wipe has its own report.")).toBeVisible();
  await refs.nth(1).fill(`SET-REF-${stamp}-b`);
  await hold.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Staff will verify each wipe/)).toBeVisible();

  await page.getByRole("button", { name: /Mark installed · \d+/ }).click();
  await expect(page.getByRole("button", { name: /Final QA passed · \d+ devices/ })).toBeVisible();
  const close = page.getByRole("button", { name: "Keep going" });
  if (await close.isVisible()) await close.click();
  await page.getByRole("button", { name: /Final QA passed · \d+ devices/ }).click();
  await expect(page.getByText(/Handed to staff/)).toBeVisible();
  w.assertClean();
});
