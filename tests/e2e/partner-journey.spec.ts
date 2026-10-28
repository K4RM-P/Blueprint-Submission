import { expect, test } from "@playwright/test";
import { watchErrors } from "./helpers";

/**
 * PP-01..PP-03: a brand-new business goes from the landing page to a submitted first
 * batch. We count every interaction a person makes and hold it to a budget, and the
 * whole journey must fit in under 2 minutes of machine time (a person adds typing).
 */
test("new partner: landing → submitted first batch in a fixed number of steps, under 2 minutes", async ({ page }) => {
  const w = watchErrors(page);
  const started = Date.now();
  let steps = 0;
  const step = async (fn: () => Promise<unknown>) => {
    steps++;
    await fn();
  };
  const email = `journey-${Date.now()}@geekloop.test`;

  await page.goto("/");
  // 1. Primary CTA on the landing page.
  await step(() => page.getByRole("link", { name: "Become a Reuse Partner" }).first().click());
  await expect(page).toHaveURL(/\/become-a-partner|\/login\?mode=signup/);
  if (page.url().includes("/become-a-partner")) {
    // 2. The same CTA on the program page.
    await step(() => page.getByRole("link", { name: "Become a Reuse Partner" }).first().click());
  }

  // Sign-up asks for the essentials only: 4 fields + 1 button.
  await expect(page.getByLabel("Organization name")).toBeVisible();
  await step(() => page.getByLabel("Your name").fill("Jordan Test"));
  await step(() => page.getByLabel("Organization name").fill("Junction Test Clinic"));
  await step(() => page.getByLabel("Work email").fill(email));
  await step(() => page.getByLabel("Password").fill("a-long-test-password"));
  await expect(page.getByLabel(/Industry|Website|Logo/)).toHaveCount(0);
  await step(() => page.getByRole("button", { name: "Create partner account" }).click());

  // Lands on the wizard; drop-off and the next open week are preselected.
  await expect(page).toHaveURL(/\/partner\/batches\/new/);
  await step(() => page.getByLabel("Make").fill("Lenovo"));
  await step(() => page.getByLabel("Model").fill("ThinkPad T14"));
  await step(() => page.getByLabel("Quantity").fill("15"));
  await step(() => page.getByRole("button", { name: "Continue" }).click());
  await expect(page.getByRole("radio", { name: "Drop-off" })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("radio", { name: /Open,|Limited,/ }).first()).toBeVisible();
  await step(() => page.getByRole("button", { name: "Continue" }).click());
  await step(() => page.getByLabel(/drives intact/).check());
  await step(() => page.getByRole("button", { name: /Submit batch · 15 devices/ }).click());
  await expect(page.getByRole("status").filter({ hasText: "Batch sent." })).toBeVisible();

  const seconds = (Date.now() - started) / 1000;
  console.log(`new-partner journey: ${steps} steps, ${seconds.toFixed(1)} s`);
  // 2 CTA taps + 4 sign-up fields + 1 submit + 3 device fields + 2 Continue + 1 confirmation + 1 submit = 14.
  expect(steps).toBeLessThanOrEqual(14);
  expect(seconds).toBeLessThan(120);
  w.assertClean();
});
