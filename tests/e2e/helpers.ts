import { expect, type Page } from "@playwright/test";

/** Collects console errors and failed server responses; call `assertClean()` at the end. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
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

export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "";

export async function signInAs(page: Page, role: "partner" | "staff" | "volunteer") {
  await page.goto("/demo");
  await page.getByRole("button", { name: new RegExp(`explore as (a |)${role}`, "i") }).click();
  await page.waitForURL(new RegExp(`/${role}(\\b|/|$)`));
}
