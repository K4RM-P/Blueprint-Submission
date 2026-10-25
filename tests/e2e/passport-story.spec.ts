import { expect, test, type Page } from "@playwright/test";
import { watchErrors } from "./helpers";

/**
 * Relay Wrapped (DP-02…DP-06, DP-11, PIF-06): the passport story player, its share
 * images, the full/print view, reduced motion, the four seeded showcase passports
 * and the DP-05 privacy rules.
 */
const FULL = "FGT-WRAPPED2";
const ANON = "FGT-QUEEN7WD";
const BENCH = "FGT-BENCH24Z";
const RECYCLED = "FGT-PARTS4RC";

const current = (page: Page) => page.locator(".story-slide").last();
const expectSlide = (page: Page, key: string) => expect(current(page)).toHaveAttribute("data-slide", key);

/** Width and height from a PNG's IHDR chunk. */
function pngSize(buf: Buffer) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

test("the story plays: tap to begin, arrow keys, tap zones and a deep-linked URL", async ({ page }) => {
  const watch = watchErrors(page);
  await page.goto(`/p/${FULL}`);
  await expectSlide(page, "cover");
  await page.getByRole("button", { name: /tap to begin/i }).click();
  await expectSlide(page, "origin");
  await expect(current(page)).toContainText("Maple Ledger Accounting");

  await page.keyboard.press("ArrowRight");
  await expectSlide(page, "handoff");
  await expect(page).toHaveURL(/[?&]s=3/);
  await page.keyboard.press("ArrowLeft");
  await expectSlide(page, "origin");

  // Right 70% of the stage goes forward, left 30% goes back.
  const box = (await page.locator(".story-stage").boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.85, box.y + box.height * 0.6);
  await expectSlide(page, "handoff");
  await page.mouse.click(box.x + box.width * 0.1, box.y + box.height * 0.6);
  await expectSlide(page, "origin");
  watch.assertClean();
});

test("slides auto-advance, and the pause button and holding both stop them", async ({ page }) => {
  await page.goto(`/p/${FULL}?s=2`);
  await expectSlide(page, "origin");
  await expectSlide(page, "handoff"); // origin is 6s; default expect timeout is 10s

  await page.getByRole("button", { name: "Pause story" }).click();
  await page.waitForTimeout(7000);
  await expectSlide(page, "handoff");
  await page.getByRole("button", { name: "Play story" }).click();

  // Hold to pause.
  const box = (await page.locator(".story-stage").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.6);
  await page.mouse.down();
  await expect(page.getByText("PAUSED", { exact: true })).toBeVisible();
  await page.mouse.up();
  await expect(page.getByText("PAUSED", { exact: true })).toBeHidden();
});

test("deep links open a slide, and the finale offers sharing", async ({ page }) => {
  await page.goto(`/p/${FULL}?s=4`);
  await expectSlide(page, "erased");
  await expect(current(page)).toContainText(/Every byte erased/);

  await page.goto(`/p/${FULL}?s=99`);
  await expectSlide(page, "finale");
  await expect(page.getByRole("button", { name: "Share my laptop's story" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View full passport" })).toHaveAttribute("href", `/p/${FULL}?view=full`);
  await page.getByRole("button", { name: "Replay" }).click();
  await expectSlide(page, "cover");
});

test("share images: 1080×1920 story PNG and 1200×630 Open Graph PNG", async ({ page, request }) => {
  const story = await request.get(`/p/${FULL}/story.png`);
  expect(story.status()).toBe(200);
  expect(story.headers()["content-type"]).toBe("image/png");
  expect(pngSize(await story.body())).toEqual({ width: 1080, height: 1920 });

  const download = await request.get(`/p/${FULL}/story.png?download=1`);
  expect(download.headers()["content-disposition"]).toContain(`relay-${FULL}-story.png`);

  await page.goto(`/p/${FULL}`);
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBeTruthy();
  const ogRes = await request.get(new URL(og!).pathname + new URL(og!).search);
  expect(ogRes.status()).toBe(200);
  expect(pngSize(await ogRes.body())).toEqual({ width: 1200, height: 630 });
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");

  expect((await request.get(`/p/FGT-ZZZZZZZZ/story.png`)).status()).toBe(404);
});

test("the full passport view and print", async ({ page }) => {
  await page.goto(`/p/${FULL}?view=full`);
  await expect(page.getByRole("link", { name: /play its story/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Why isn.t it free/i })).toBeVisible();
  await expect(page.getByText(/independent non-profit/).first()).toBeVisible();
  await expect(page.getByText(/Illustrative/).first()).toBeVisible();
  await expect(page.getByText(/TO VERIFY/).first()).toBeVisible();

  // Printing the story URL prints the flat passport instead of the player.
  await page.goto(`/p/${FULL}`);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".story-root")).toBeHidden();
  await expect(page.locator(".story-print-only")).toBeVisible();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("no auto-advance, crossfades only, and numbers at their final values", async ({ page }) => {
    const watch = watchErrors(page);
    await page.goto(`/p/${FULL}?s=2`);
    await expectSlide(page, "origin");
    await page.waitForTimeout(7000);
    await expectSlide(page, "origin");
    await page.keyboard.press("ArrowRight");
    await expectSlide(page, "handoff");
    await page.goto(`/p/${FULL}?s=8`);
    await expectSlide(page, "numbers");
    await expect(current(page)).toContainText("2.1 kilograms");
    // No 3D: the booklet cover is never drawn.
    await page.goto(`/p/${FULL}`);
    await expectSlide(page, "cover");
    await expect(page.locator(".story-stage .passport-cover")).toBeHidden();
    watch.assertClean();
  });
});

test("each showcase passport tells its own story", async ({ page }) => {
  const keys = async (code: string) => {
    await page.goto(`/p/${code}`);
    return (await page.locator(".story-seg").count()) as number;
  };

  // (a) full attribution, sold, Pay-It-Forward
  expect(await keys(FULL)).toBe(12);
  await page.goto(`/p/${FULL}?s=9`);
  await expectSlide(page, "money");
  await expect(current(page)).toContainText("Someone paid it forward");

  // (b) anonymous: fallbacks only
  await page.goto(`/p/${ANON}?s=2`);
  await expect(current(page)).toContainText("a Toronto business");
  await page.goto(`/p/${ANON}?s=5`);
  await expect(current(page)).toContainText(/An FGT volunteer brought it/i);
  const anonHtml = await (await page.request.get(`/p/${ANON}?view=full`)).text();
  expect(anonHtml).not.toContain("Queen West Design");
  expect(anonHtml).not.toContain("Tomás");

  // (c) in progress: ends on the next leg
  await page.goto(`/p/${BENCH}?s=99`);
  await page.goto(`/p/${BENCH}?s=${(await page.locator(".story-seg").count()) - 1}`);
  await expectSlide(page, "next_leg");
  await expect(current(page)).toContainText("Its next leg is coming soon");

  // (d) recycled: short and respectful, no price breakdown
  await page.goto(`/p/${RECYCLED}?s=5`);
  await expectSlide(page, "recycled");
  await expect(current(page)).toContainText("Its parts live on through responsible recycling");
  const recycledHtml = await (await page.request.get(`/p/${RECYCLED}`)).text();
  expect(recycledHtml).not.toContain('data-slide="money"');
});

test("DP-05: private fields never appear in any passport HTML", async ({ request }) => {
  for (const code of [FULL, ANON, BENCH, RECYCLED]) {
    for (const path of [`/p/${code}`, `/p/${code}?view=full`, `/p/${code}?s=99`]) {
      const html = await (await request.get(path)).text();
      expect(html).not.toMatch(/\bBL-\d{6}\b/); // sanitization report IDs
      expect(html).not.toMatch(/\b(LE|HP|DE|AP)\d{7}\b/); // seeded serial numbers
      expect(html).not.toMatch(/serial_number|wipe_report_ref|recipient_category|price_cents|sale_channel/);
      expect(html).not.toMatch(/\$\d+\.\d{2}/); // no prices
    }
  }
});
