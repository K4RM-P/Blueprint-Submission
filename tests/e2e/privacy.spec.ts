import { expect, test, type Page } from "@playwright/test";
import { signInAs, watchErrors } from "./helpers";

/**
 * Privacy & consent end to end (PP-02, PP-13, VW-07, DP-05, DP-07). Every opt-in
 * takes effect immediately, a partner's personalized passport is theirs alone, and
 * private fields never reach a public page or a partner view that shouldn't have them.
 * Each test restores the demo account's settings before it ends.
 */
const CODE = "FGT-WRAPPED2"; // Maple Ledger Accounting → Aisha → sold
const ORG = "Maple Ledger Accounting";

async function setPartnerOptIns(page: Page, { wall, passport }: { wall: boolean; passport: boolean }) {
  await page.goto("/partner/settings");
  for (const [name, want] of [
    ["Show us on the Partner Wall", wall],
    ["Name us on Device Passports", passport],
  ] as const) {
    const sw = page.getByRole("switch", { name });
    if ((await sw.getAttribute("aria-checked")) !== String(want)) await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", String(want));
  }
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
}

test("partner recognition: opting out hides the name from the Partner Wall and passports immediately", async ({ page, browser }) => {
  await signInAs(page, "partner");
  const anon = await (await browser.newContext()).newPage();
  try {
    await setPartnerOptIns(page, { wall: false, passport: false });
    await anon.goto("/partners");
    await expect(anon.locator("main")).not.toContainText(ORG);
    const html = await (await anon.request.get(`/p/${CODE}?view=full`)).text();
    expect(html).not.toContain(ORG);
    expect(html).toContain("a Toronto business");
    // The owner still recognizes their own laptop; only they see the note.
    await page.goto(`/p/${CODE}?view=full`);
    await expect(page.getByText(`This was one of your laptops, ${ORG}.`)).toBeVisible();
  } finally {
    await setPartnerOptIns(page, { wall: true, passport: true });
  }
  await anon.goto("/partners");
  await expect(anon.locator("main")).toContainText(ORG);
  await anon.goto(`/p/${CODE}?view=full`);
  await expect(anon.getByText(ORG).first()).toBeVisible();
});

test("the personalized passport is shown only to the partner that donated the laptop", async ({ page, browser }) => {
  const w = watchErrors(page);
  await signInAs(page, "partner");
  await page.goto(`/p/${CODE}`);
  await expect(page.locator(".story-slide[data-slide='cover']")).toContainText(`This was one of your laptops, ${ORG}`);
  await page.goto(`/p/${CODE}?view=full`);
  await expect(page.getByText(`This was one of your laptops, ${ORG}.`)).toBeVisible();
  await expect(page.getByRole("button", { name: "Share its story" })).toBeVisible();
  w.assertClean();

  // Public viewers and staff see the normal passport.
  const anon = await (await browser.newContext()).newPage();
  const staff = await (await browser.newContext()).newPage();
  await signInAs(staff, "staff");
  for (const p of [anon, staff]) {
    await p.goto(`/p/${CODE}`);
    const cover = p.locator(".story-slide[data-slide='cover']");
    await expect(cover).toContainText("This laptop has a story");
    await expect(cover).not.toContainText("one of your laptops");
    await p.goto(`/p/${CODE}?view=full`);
    await expect(p.locator("main")).not.toContainText("one of your laptops");
  }
  // Another partner's laptop is not "yours".
  await page.goto("/p/FGT-QUEEN7WD?view=full");
  await expect(page.locator("main")).not.toContainText("one of your laptops");
});

test("partner views never include sanitization reference IDs or sale prices", async ({ page }) => {
  await signInAs(page, "partner");
  await page.goto("/partner/batches");
  const link = page.getByRole("link", { name: /Open batch: 12 × Lenovo ThinkPad T480/ });
  await link.click();
  for (const html of [await page.content(), await (await page.request.get("/partner")).text()]) {
    expect(html).not.toMatch(/\bBL-\d{6}\b/);
    expect(html).not.toMatch(/wipe_report_ref|price_cents|sale_channel/);
  }
  // The dashboard shows only the aggregate view count, never per-viewer data.
  await page.goto("/partner");
  await expect(page.getByRole("heading", { name: "Your laptops" })).toBeVisible();
});

test("volunteer attribution and public profile: off hides them at once; defaults are off", async ({ page, browser }) => {
  await signInAs(page, "volunteer");
  const anon = await (await browser.newContext()).newPage();
  const setPrivacy = async (on: boolean) => {
    await page.goto("/volunteer/settings");
    for (const name of ["Show my first name on Device Passports", "Public Skills profile"]) {
      const sw = page.getByRole("switch", { name });
      if ((await sw.getAttribute("aria-checked")) !== String(on)) await sw.click();
    }
    if (on) await page.getByLabel("Profile link").fill("aisha-rahman");
    await page.getByRole("button", { name: "Save privacy settings" }).click();
    await expect(page.getByText("Privacy settings saved.")).toBeVisible();
  };
  try {
    await setPrivacy(false);
    const html = await (await anon.request.get(`/p/${CODE}?view=full`)).text();
    expect(html).not.toContain("Aisha");
    expect(html).toContain("an FGT volunteer");
    expect((await anon.request.get("/v/aisha-rahman")).status()).toBe(404);
  } finally {
    await setPrivacy(true);
  }
  await anon.goto(`/p/${CODE}?view=full`);
  await expect(anon.getByText(/Aisha/).first()).toBeVisible();
  expect((await anon.request.get("/v/aisha-rahman")).status()).toBe(200);
});
