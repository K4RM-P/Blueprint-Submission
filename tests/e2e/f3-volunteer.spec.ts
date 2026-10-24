import { expect, test } from "@playwright/test";
import { signInAs } from "./helpers";

test.use({ viewport: { width: 360, height: 780 } });

test("F3 — volunteer claims a device and completes the checklist on a phone (VW-01..05)", async ({ page }) => {
  await signInAs(page, "volunteer");
  await page.getByRole("button", { name: /Claim next device/ }).last().click();
  await page.waitForURL(/\/volunteer\/devices\//);

  await page.getByRole("button", { name: /Hardware test — tap to complete/ }).click();
  await expect(page.getByText("Badge unlocked")).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Diagnostician");
  await page.getByRole("button", { name: "Keep going" }).click();

  await page.getByLabel("Sanitization report ID").fill("BL-990001");
  const hold = page.getByRole("button", { name: /Hold to confirm wipe/ });
  await hold.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Wipe recorded. Staff will verify it.")).toBeVisible();

  await page.getByRole("button", { name: "Mark OS installed" }).click();
  // 10th open-source install unlocks a second badge.
  await expect(page.getByRole("dialog")).toContainText("Open Source Installer");
  await page.getByRole("button", { name: "Keep going" }).click();
  await page.getByRole("button", { name: /Final QA — tap to complete/ }).click();
  await expect(page.getByText(/All four steps done/)).toBeVisible();
});
