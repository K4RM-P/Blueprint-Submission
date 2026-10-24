import { expect, test } from "@playwright/test";
import { signInAs } from "./helpers";

/** PP-10 annual report PDF and PP-11 LinkedIn card for the demo partner (Impact tier). */
test("PP-10 / PP-11 — partner downloads the report and sees the LinkedIn card", async ({ page }) => {
  await signInAs(page, "partner");
  await page.goto("/partner/report");
  await expect(page.getByRole("heading", { name: "LinkedIn impact card" })).toBeVisible();

  const pdf = await page.request.get("/api/reports/annual");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");

  const img = page.getByRole("img", { name: /LinkedIn impact card/ });
  await expect(img).toBeVisible();
  const src = await img.getAttribute("src");
  const png = await page.request.get(src!);
  expect(png.headers()["content-type"]).toContain("image/png");
  await expect(page.getByLabel("Suggested post")).toHaveValue(/Maple Ledger Accounting gave \d+ retired/);
});

test("PP-11 — the card is private to its own organization", async ({ request }) => {
  const res = await request.get("/api/og/partner/00000000-0000-4000-8000-000000000000");
  expect(res.status()).toBe(403);
});
