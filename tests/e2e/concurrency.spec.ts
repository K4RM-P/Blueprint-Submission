import { expect, test, type Browser, type Page } from "@playwright/test";
import { signInAs } from "./helpers";

/**
 * Several judges share the demo accounts. Two sessions of the same account work at
 * the same time without stepping on each other, Reset demo refills the queues, and
 * the showcase passports stay intact (AUTH-06, VW-01, PP-03).
 */
async function session(browser: Browser, role: "partner" | "staff" | "volunteer"): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await signInAs(page, role);
  return page;
}

test("Reset demo refills the bench and the staff queue; showcase passports stay intact", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByText(/Showcase passports are intact\./)).toBeVisible({ timeout: 30_000 });
  const staff = await session(page.context().browser()!, "staff");
  await staff.goto("/staff/batches?status=submitted");
  await expect(staff.locator("main a[href^='/staff/batches/']").first()).toBeVisible();
});

test("two volunteer sessions claim at the same moment and get different devices", async ({ browser }) => {
  const [a, b] = await Promise.all([session(browser, "volunteer"), session(browser, "volunteer")]);
  await Promise.all([
    a.getByRole("button", { name: /Claim next device/ }).last().click(),
    b.getByRole("button", { name: /Claim next device/ }).last().click(),
  ]);
  await Promise.all([a.waitForURL(/\/volunteer\/devices\//), b.waitForURL(/\/volunteer\/devices\//)]);
  expect(a.url()).not.toBe(b.url());
});

test("two partner sessions submit batches at the same time; both succeed", async ({ browser }) => {
  const pages = await Promise.all([session(browser, "partner"), session(browser, "partner")]);
  await Promise.all(
    pages.map(async (p, i) => {
      await p.goto("/partner/batches/new");
      await p.getByLabel("Make").fill("Dell");
      await p.getByLabel("Model").fill(`Latitude 54${i}0`);
      await p.getByLabel("Quantity").fill("6");
      await p.getByRole("button", { name: "Continue" }).click();
      await p.getByRole("button", { name: "Continue" }).click();
      await p.getByLabel(/drives intact/).check();
      await p.getByRole("button", { name: /Submit batch · 6 devices/ }).click();
      await expect(p.getByRole("status").filter({ hasText: "Batch sent." })).toBeVisible();
    }),
  );
});

test("staff can't change a showcase passport in demo mode", async ({ browser }) => {
  const staff = await session(browser, "staff");
  await staff.goto("/staff/devices?q=FGT-BENCH24Z");
  await staff.locator("table tbody a[href^='/staff/devices/']").first().click();
  await staff.waitForURL(/\/staff\/devices\/[0-9a-f-]{36}$/);
  await staff.getByRole("button", { name: /^Move to ready/ }).click();
  await expect(staff.getByText(/showcase Device Passport/)).toBeVisible();
  const anon = await (await browser.newContext()).newPage();
  await anon.goto("/p/FGT-BENCH24Z?view=full");
  await expect(anon.locator("main")).toContainText(/Being refurbished|On the volunteer bench/);
});
