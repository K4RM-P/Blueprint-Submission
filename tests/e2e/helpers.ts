import { expect, type Page } from "@playwright/test";

/** Collects console errors and failed server responses; call `assertClean()` at the end. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("response", (res) => {
    if (res.status() >= 500) errors.push(`HTTP ${res.status()} ${res.url()}`);
  });
  return {
    errors,
    assertClean: () => expect(errors, errors.join("\n")).toEqual([]),
  };
}

export async function settle(page: Page) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(800);
}

export async function signInAs(page: Page, role: "partner" | "staff" | "volunteer") {
  await page.goto("/demo");
  await page.getByRole("button", { name: new RegExp(`^${role}\\b`, "i") }).click();
  await page.waitForURL(new RegExp(`/${role}$`), { timeout: 30_000 });
}
