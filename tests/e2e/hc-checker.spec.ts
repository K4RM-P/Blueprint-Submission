import { expect, test, type Page } from "@playwright/test";
import { watchErrors } from "./helpers";

/** HC-01…HC-04: each outcome path of the household checker. */
async function answer(page: Page, item: string, age: string, works: string, business?: number) {
  await page.goto("/donate");
  await page.getByRole("radio", { name: item }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: age }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("radio", { name: works, exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();
  if (business) {
    await page.getByRole("radio", { name: "A business or organization" }).click();
    await page.getByLabel("How many devices?").fill(String(business));
  } else {
    await page.getByRole("radio", { name: "Just me, from home" }).click();
  }
  await page.getByRole("button", { name: "Check my donation" }).click();
}

test("HC-02 accepted — a 4-year-old working laptop", async ({ page }) => {
  const watch = watchErrors(page);
  await answer(page, "Laptops", "3–6 years", "Yes");
  await expect(page.getByRole("heading", { name: /we.d love it/i })).toBeVisible();
  await expect(page.getByText("180 Sudbury Street").first()).toBeVisible();
  watch.assertClean();
});

test("HC-02 recycling only — a broken monitor", async ({ page }) => {
  await answer(page, "Flat-screen monitors", "3–6 years", "No");
  await expect(page.getByRole("heading", { name: /for recycling/i })).toBeVisible();
});

test("HC-02 not accepted — a TV points to Ontario recyclers", async ({ page }) => {
  await answer(page, "Other electronics (TVs, printers, CRTs, appliances)", "Over 10 years", "Yes");
  await expect(page.getByRole("heading", { name: /can.t take this one/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /find a drop-off/i })).toHaveAttribute("href", /recyclemyelectronics/);
});

test("HC-03 business with 5+ devices is routed to the partner program", async ({ page }) => {
  await answer(page, "Laptops", "Under 3 years", "Yes", 20);
  await expect(page.getByRole("heading", { name: /reuse partner/i })).toBeVisible();
  await page.getByRole("link", { name: "See the partner program" }).click();
  await expect(page).toHaveURL(/\/become-a-partner/);
});

test("HC-01 typing a model picks the category", async ({ page }) => {
  await page.goto("/donate");
  await page.getByLabel("Or type the model").fill("Dell Latitude 5420");
  await expect(page.getByText("Sounds like: Laptops.")).toBeVisible();
  await expect(page.getByRole("radio", { name: "Laptops" })).toHaveAttribute("aria-checked", "true");
});
