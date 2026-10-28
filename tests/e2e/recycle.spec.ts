import { expect, test } from "@playwright/test";
import { settle, signInAs, watchErrors } from "./helpers";

/**
 * OPS-06 / OPS-08 / DP-02: a device recycled before its wipe was verified must record what
 * happened to its drive, so the partner's certificate accounts for every drive and the
 * passport never claims a wipe is "in progress" forever.
 */
test("recycling an unverified device requires the drive handling, and the passport shows it", async ({ page, browser }) => {
  const w = watchErrors(page);
  await signInAs(page, "staff");
  await page.goto("/staff/devices?status=received");
  await page.locator("table tbody a[href^='/staff/devices/']").first().click();
  await page.waitForURL(/\/staff\/devices\/[0-9a-f-]{36}$/);
  const code = (await page.locator("main").textContent())!.match(/FGT-[2-9A-HJ-NP-Z]{8}/)![0];

  await page.getByRole("button", { name: "Recycle" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Reason").fill("Swollen battery, unsafe to refurbish");
  const confirm = dialog.getByRole("button", { name: "Recycle device" });
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel("What happened to the drive?").selectOption("Drive physically destroyed");
  await confirm.click();
  await expect(page.getByText(/updated/)).toBeVisible();

  const anon = await (await browser.newContext()).newPage();
  await anon.goto(`/p/${code}?view=full`);
  await settle(anon);
  await expect(anon.getByText("Drive handled before recycling").first()).toBeVisible();
  await expect(anon.getByText("Wipe in progress")).toHaveCount(0);
  // A recycled laptop is never sold, so the pricing sections don't apply.
  await expect(anon.getByRole("heading", { name: "Where your money goes" })).toHaveCount(0);
  w.assertClean();
});
