import { expect, test } from "@playwright/test";
import { signInAs, watchErrors } from "./helpers";

test.describe("F1 — partner first donation (PP-01..PP-07)", () => {
  test("a new business signs up, onboards and submits an Excellent batch", async ({ page }) => {
    const w = watchErrors(page);
    const email = `f1-${Date.now()}@geekloop.test`;

    await page.goto("/become-a-partner");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Retire your laptops");
    await page.getByRole("link", { name: "Become a Reuse Partner" }).first().click();

    await page.getByLabel("Your name").fill("Robin Test");
    await page.getByLabel("Organization name").fill("Riverdale Test Bookkeeping");
    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Password").fill("a-long-test-password");
    await page.getByRole("button", { name: "Create partner account" }).click();

    // Onboarding (PP-02)
    await expect(page).toHaveURL(/\/partner\/settings\?welcome=1/);
    await page.getByLabel("Industry").fill("Bookkeeping");
    await page.getByLabel("Number of employees").selectOption("11-50");
    await page.getByRole("switch", { name: "Show us on the Partner Wall" }).click();
    await page.getByRole("button", { name: "Save and start a batch" }).click();

    // Wizard (PP-03, PP-04, PP-05)
    await expect(page).toHaveURL(/\/partner\/batches\/new/);
    await page.getByLabel("Make").fill("Dell");
    await page.getByLabel("Model").fill("Latitude 5420");
    await page.getByLabel("Approx. year").fill("2021");
    await page.getByLabel("Quantity").fill("20");
    await expect(page.getByRole("meter", { name: "Batch Value Score" }).last()).toHaveAttribute("aria-valuetext", /Excellent/);
    await page.getByRole("button", { name: "Continue" }).click();

    // Community tier: pickup disabled, choose the first open week.
    await expect(page.getByRole("radio", { name: "Pickup" })).toBeDisabled();
    const openWeek = page.getByRole("radio", { name: /Open,/ }).first();
    await openWeek.click();
    await expect(openWeek).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: "Continue" }).click();

    // Data handling: must acknowledge.
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Please confirm so we can wipe the drives for you.")).toBeVisible();
    await page.getByLabel(/drives intact/).check();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("cell", { name: /Dell Latitude 5420/ })).toBeVisible();
    await page.getByRole("button", { name: "Submit batch · 20 devices" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Batch sent." })).toBeVisible();

    await page.getByRole("link", { name: "Back to dashboard" }).click();
    await expect(page.getByText("20 × Dell Latitude 5420").first()).toBeVisible();
    await expect(page.getByText("Submitted").first()).toBeVisible();
    w.assertClean();
  });

  test("submitted batches can be edited; reviewed ones cannot", async ({ page }) => {
    await signInAs(page, "partner");
    await page.goto("/partner/batches");
    await page.getByRole("link", { name: /Open batch: 20 × Dell Latitude 5420/ }).first().click();
    await expect(page.getByRole("link", { name: "Edit batch" })).toBeVisible();
    await page.goto("/partner/batches");
    await page.getByRole("link", { name: /Open batch: 12 × Lenovo ThinkPad T480/ }).click();
    await expect(page.getByRole("link", { name: "Edit batch" })).toHaveCount(0);
    await expect(page.getByText("GL-")).toBeVisible();
    const url = page.url();
    await page.goto(`${url}/edit`);
    await expect(page).toHaveURL(url);
  });
});
