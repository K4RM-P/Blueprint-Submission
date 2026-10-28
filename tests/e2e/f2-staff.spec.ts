import { expect, test } from "@playwright/test";
import { signInAs } from "./helpers";

test("F2 — staff approves, schedules and receives the demo batch (OPS-02..04, OPS-07)", async ({ page }) => {
  await signInAs(page, "staff");
  await page.goto("/staff/batches?status=submitted");
  await page.getByRole("link", { name: "Maple Ledger Accounting" }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Maple Ledger Accounting");
  await expect(page.getByRole("main")).toContainText("20 devices");

  await page.getByRole("button", { name: "Approve & schedule" }).click();
  await page.getByRole("radio", { name: /Open,/ }).first().click();
  await page.getByRole("button", { name: /^Schedule week of/ }).click();
  await expect(page.getByText("Scheduled").first()).toBeVisible();

  await page.getByRole("button", { name: /Receive & add 20 devices/ }).click();
  await expect(page.getByRole("heading", { name: "Devices (20)" })).toBeVisible();

  // Bulk-verify wipes waiting for verification.
  await page.goto("/staff/devices?status=wipe_pending_verification");
  await page.getByRole("checkbox", { name: "Select all devices on this page" }).check();
  await page.getByRole("button", { name: /Verify \d+ wipe/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: /^Verify/ }).click();
  await expect(page.getByText(/wipes? verified/)).toBeVisible();
});
