import { expect, test } from "@playwright/test";
import { settle, watchErrors } from "./helpers";

/** Every public route built so far must load without console or server errors. */
const PUBLIC_ROUTES = ["/", "/styleguide", "/login", "/signup", "/signup?invite=1", "/demo", "/forgot-password"];

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
