import { expect, test } from "@playwright/test";
import { signInAs } from "./helpers";

test("F4 — staff issues a certificate; it verifies publicly without serials (OPS-08, CI-01, CI-02)", async ({ page }) => {
  await signInAs(page, "staff");
  await page.goto("/staff/batches?status=in_refurbishment");
  await page.getByRole("link", { name: "Queen West Design Co." }).click();
  await page.getByRole("button", { name: "Issue certificate" }).click();
  // The seal stamps in, then the page refreshes into the certificate panel: either shows the new number.
  const issued = page.getByRole("main").getByText(/^GL-\d{4}-\d{4}$/).first();
  await expect(issued).toBeVisible();
  const number = (await issued.textContent())!.match(/GL-\d{4}-\d{4}/)![0];

  const pdf = await page.request.get(`/api/certificates/${number}`);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");

  await page.goto(`/verify/${number}`);
  await expect(page.getByRole("heading", { name: "This certificate is genuine." })).toBeVisible();
  await expect(page.getByText("Queen West Design Co.")).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/LE\d{7}|SN\d+/);
});
