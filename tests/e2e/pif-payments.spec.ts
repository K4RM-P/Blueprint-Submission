import { expect, test } from "@playwright/test";
import { signInAs, watchErrors } from "./helpers";

/** Stage 8 with PAYMENT_PROVIDER=mock (PIF-01…PIF-05, PP-12). */
test("PIF-01 — a visitor contributes $10 through the mock checkout", async ({ page }) => {
  const watch = watchErrors(page);
  await page.goto("/pay-it-forward");
  await page.getByRole("radio", { name: "$10" }).click();
  await page.getByRole("button", { name: "Contribute $10.00" }).click();
  await page.waitForURL(/\/checkout\/mock\?token=/);
  await expect(page.getByText("No real money")).toBeVisible();
  await page.getByRole("button", { name: "Pay $10.00" }).click();
  await page.waitForURL(/\/pay-it-forward\?thanks=1000/);
  await expect(page.getByRole("status")).toContainText("$10.00");
  watch.assertClean();
});

test("PIF-02 — the store round-up adds the change to the fund", async ({ page }) => {
  await page.goto("/pay-it-forward/round-up");
  // Order total $233.99 → round up to $235.00.
  await page.getByRole("button", { name: "Add $1.01" }).click();
  await page.waitForURL(/\/checkout\/mock/);
  await page.getByRole("button", { name: "Pay $1.01" }).click();
  await page.waitForURL(/\/pay-it-forward\/round-up\?thanks=101/);
  await expect(page.getByRole("status")).toContainText("$1.01");
});

test("PIF-05 — a forged checkout token is refused", async ({ page }) => {
  await page.goto("/checkout/mock?token=eyJyZWYiOiJ4In0.bm9wZQ");
  await expect(page.getByRole("heading", { name: /expired/ })).toBeVisible();
  const res = await page.request.post("/api/payments/webhook", { form: { token: "eyJyZWYiOiJ4In0.bm9wZQ" }, maxRedirects: 0 });
  expect(res.status()).toBe(303);
  expect(res.headers()["location"]).toContain("error=invalid");
});

test("PP-12 / PIF-04 — partner upgrades to Champion and the staff ledger shows the sponsorship", async ({ page }) => {
  await signInAs(page, "partner");
  await page.goto("/partner/membership");
  await page.getByRole("button", { name: "Upgrade to Champion" }).click();
  await page.waitForURL(/\/checkout\/mock/);
  await page.getByRole("button", { name: "Pay $1,500.00" }).click();
  await page.waitForURL(/\/partner\/membership\?paid=champion/);
  await expect(page.getByRole("heading", { level: 1, name: "Champion Partner" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("sponsored laptops");
});
