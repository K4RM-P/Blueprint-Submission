import { expect, test } from "@playwright/test";
import { signInAs, watchErrors } from "./helpers";

test.describe("auth, roles and demo mode (AUTH-01..06)", () => {
  for (const role of ["partner", "staff", "volunteer"] as const) {
    test(`demo ${role} signs in and reaches their dashboard`, async ({ page }) => {
      const w = watchErrors(page);
      await signInAs(page, role);
      await expect(page).toHaveURL(new RegExp(`/${role}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("Demo environment · fictional data")).toBeVisible();
      w.assertClean();
    });
  }

  test("wrong role is redirected to its own dashboard (AUTH-05)", async ({ page }) => {
    await signInAs(page, "partner");
    await page.goto("/staff/devices");
    await expect(page).toHaveURL(/\/partner$/);
    await page.goto("/volunteer");
    await expect(page).toHaveURL(/\/partner$/);
  });

  test("anonymous visitors are sent to sign in with next=", async ({ page }) => {
    await page.goto("/staff/batches");
    await expect(page).toHaveURL(/\/login\?next=%2Fstaff%2Fbatches/);
  });

  test("email + password sign-in honours next (AUTH-01)", async ({ page }) => {
    await page.goto("/login?next=/volunteer/wallet");
    await page.getByLabel("Email").fill("demo-volunteer@geekloop.test");
    await page.getByLabel("Password").fill(process.env.DEMO_PASSWORD ?? "");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/volunteer\/wallet/);
  });

  test("wrong password shows a friendly error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("demo-staff@geekloop.test");
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("That email and password don't match.")).toBeVisible();
  });

  test("sign out returns to the public site", async ({ page }) => {
    await signInAs(page, "staff");
    await page.getByRole("button", { name: /Account menu/ }).first().click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
