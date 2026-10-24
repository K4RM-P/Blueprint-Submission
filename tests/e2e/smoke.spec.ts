import { expect, test } from "@playwright/test";
import { settle, signInAs, watchErrors } from "./helpers";

/** Every public route built so far must load without console or server errors. */
const PUBLIC_ROUTES = ["/become-a-partner", "/", "/styleguide", "/login", "/signup", "/signup?invite=1", "/demo", "/forgot-password"];

for (const route of PUBLIC_ROUTES) {
  test(`loads ${route} cleanly`, async ({ page }) => {
    const w = watchErrors(page);
    const res = await page.goto(route);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("main")).toBeVisible();
    await settle(page);
    w.assertClean();
  });
}

test("demo banner shows in demo mode", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Demo environment · fictional data")).toBeVisible();
});

const ROLE_ROUTES: Record<"partner" | "staff" | "volunteer", string[]> = {
  partner: ["/partner", "/partner/batches", "/partner/batches/new", "/partner/settings"],
  staff: ["/staff"],
  volunteer: ["/volunteer"],
};

for (const [role, routes] of Object.entries(ROLE_ROUTES) as [keyof typeof ROLE_ROUTES, string[]][]) {
  test(`${role} routes load cleanly`, async ({ page }) => {
    const w = watchErrors(page);
    await signInAs(page, role);
    for (const route of routes) {
      const res = await page.goto(route);
      expect(res?.status(), route).toBeLessThan(400);
      await expect(page.locator("main h1").first()).toBeVisible();
      await settle(page);
    }
    w.assertClean();
  });
}
