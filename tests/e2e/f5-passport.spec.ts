import { expect, test } from "@playwright/test";
import { settle, signInAs, watchErrors } from "./helpers";

/**
 * F5 — sale and passport (DP-02…DP-06, DP-10, PIF-06).
 * Staff sells a ready device to a Student with a Pay-It-Forward subsidy; the public
 * passport tells its story with opt-in attribution and never leaks private fields.
 */
test("F5 — staff records a sale; the passport renders and hides private fields", async ({ page, browser }) => {
  await signInAs(page, "staff");
  await page.goto("/staff/devices?status=ready");
  await page.locator("table tbody a[href^='/staff/devices/']").first().click();
  await page.waitForURL(/\/staff\/devices\/[0-9a-f-]{36}$/);

  const code = (await page.locator("main").textContent())!.match(/FGT-[2-9A-HJ-NP-Z]{8}/)![0];
  const facts = page.locator("dl");
  const serial = (await facts.locator("dt:text-is('Serial') + dd").first().textContent())?.trim() ?? "—";
  const reportRef = (await facts.locator("dt:text-is('Report ID') + dd").first().textContent())?.trim() ?? "—";

  // Set a price, then record the sale with a small subsidy.
  await page.getByRole("button", { name: /set price|price \$/i }).click();
  await page.getByLabel("Price (CAD)").fill("180");
  await page.getByRole("dialog").getByRole("button", { name: /save/i }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: "Record sale" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Recipient category").selectOption("student");
  await dialog.getByLabel(/Pay-It-Forward subsidy/).fill("20");
  await dialog.getByRole("button", { name: "Record sale" }).click();
  await expect(page.getByText(/Sale recorded/)).toBeVisible();

  // A fresh, signed-out visitor scans the QR code.
  const anon = await (await browser.newContext()).newPage();
  const watch = watchErrors(anon);
  // The QR opens the Relay Wrapped story; the static passport is ?view=full.
  await anon.goto(`/p/${code}`);
  await expect(anon.locator(".story-slide[data-slide='cover']")).toBeVisible();
  await anon.goto(`/p/${code}?view=full`);
  await settle(anon);
  // The code shows twice since the passport cover was added (cover + header); either proves it rendered.
  await expect(anon.getByText(code).first()).toBeVisible();
  await expect(anon.getByText(/Refurbished by Free Geek Toronto/).first()).toBeVisible();
  await expect(anon.getByText(/independent non-profit/).first()).toBeVisible();
  await expect(anon.getByRole("heading", { name: /Why isn.t (this|it) free/i })).toBeVisible();
  await expect(anon.getByRole("heading", { name: /Where your money goes/i })).toBeVisible();
  await expect(anon.getByText(/Pay-It-Forward fund/).first()).toBeVisible();
  await expect(anon.getByText("In its new home")).toBeVisible();

  // DP-05: no serial, no sanitization report ID, no sale price in either view's HTML.
  for (const path of [`/p/${code}`, `/p/${code}?view=full`, `/p/${code}?s=12`]) {
    const html = await (await anon.request.get(path)).text();
    if (serial !== "—") expect(html).not.toContain(serial);
    if (reportRef !== "—") expect(html).not.toContain(reportRef);
    expect(html).not.toMatch(/wipe_report_ref|serial_number|recipient_category|price_cents/);
    expect(html).not.toContain("$180.00");
  }
  watch.assertClean();
});

test("F5 — an unknown passport code is a friendly 404 linking to /about (DP-10)", async ({ page }) => {
  await page.goto("/p/FGT-ZZZZZZZZ");
  await expect(page.getByRole("link", { name: /about/i }).first()).toBeVisible();
  await expect(page.locator("main")).toContainText(/(couldn.t|can.t) find|not found|no passport/i);
});
