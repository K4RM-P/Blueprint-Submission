import { expect, test } from "@playwright/test";
import { watchErrors } from "./helpers";

/** Every public route built so far must load without console or server errors. */
const PUBLIC_ROUTES = ["/", "/styleguide"];

for (const route of PUBLIC_ROUTES) {
  test(`loads ${route} cleanly`, async ({ page }) => {
    const w = watchErrors(page);
    const res = await page.goto(route);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("main")).toBeVisible();
    await page.waitForLoadState("networkidle");
    w.assertClean();
  });
}

test("demo banner shows in demo mode", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Demo environment · fictional data")).toBeVisible();
});
