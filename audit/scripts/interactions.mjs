// Records the key interactions as videos + frame sequences. Usage: node interactions.mjs <outDir>
import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.argv[2] ?? "audit/screenshots-after/interactions";
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const errs = [];
async function ctxFor(role, width = 1280) {
  const ctx = await b.newContext({ viewport: { width, height: width < 500 ? 780 : 900 }, recordVideo: { dir: OUT, size: { width, height: width < 500 ? 780 : 900 } } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push(`${role}: ${e.message}`));
  p.on("console", (m) => m.type() === "error" && errs.push(`${role} console: ${m.text().slice(0, 200)}`));
  if (role) {
    await p.goto(BASE + "/demo");
    await p.getByRole("button", { name: new RegExp(`explore as (a |)${role}`, "i") }).click();
    await p.waitForURL(new RegExp(`/${role}$`), { timeout: 45000 });
  }
  return { ctx, p };
}
const shot = (p, n) => p.screenshot({ path: path.join(OUT, `${n}.png`) });

const ONLY = process.env.ONLY;
if (!ONLY || ONLY === "landing") // 1 · Landing: liquid digits + laptop opening + Baton Run scroll
{
  const { ctx, p } = await ctxFor(null);
  await p.goto(BASE + "/", { waitUntil: "commit" });
  for (const t of [250, 900, 1800, 3200]) { await p.waitForTimeout(t - (t === 250 ? 0 : 0)); await shot(p, `landing-hero-${t}ms`); }
  for (const [i, y] of [900, 1300, 1700, 2100, 2500, 2900].entries()) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(700); await shot(p, `landing-baton-run-${i}`); }
  await ctx.close();
}
if (!ONLY || ONLY === "passport") // 2 · Passport cover + stamps + leg counter (phone)
{
  const { ctx, p } = await ctxFor(null, 390);
  await p.goto(BASE + "/p/FGT-ZWA4TPBB", { waitUntil: "commit" });
  await p.waitForSelector(".passport-cover");
  for (const t of [200, 650, 900, 1300, 2600]) { await p.waitForTimeout(t === 200 ? 200 : 250); await shot(p, `passport-cover-${t}ms`); }
  for (const [i, y] of [500, 800, 1100].entries()) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(800); await shot(p, `passport-stamps-${i}`); }
  await ctx.close();
}
if (!ONLY || ONLY === "wizard") // 3 · Wizard → meter → capacity glasses → submit → baton pass
{
  const { ctx, p } = await ctxFor("partner");
  await p.goto(BASE + "/partner/batches/new");
  await p.getByLabel("Make").fill("Dell");
  await p.getByLabel("Model").fill("Latitude 5420");
  await p.getByLabel("Approx. year").fill("2021");
  await p.getByLabel("Quantity").fill("20");
  await p.waitForTimeout(1200);
  await shot(p, "wizard-meter-excellent");
  await p.getByRole("button", { name: "Continue" }).click();
  await p.waitForTimeout(700);
  const glass = p.getByRole("radio", { name: /Open/ }).first();
  const box = await glass.boundingBox();
  if (box) { await p.mouse.move(box.x + 5, box.y + box.height / 2); await p.waitForTimeout(120); await p.mouse.move(box.x + box.width - 5, box.y + box.height / 2, { steps: 6 }); await p.waitForTimeout(150); await shot(p, "capacity-slosh-hover"); }
  await p.getByRole("radio", { name: /Open/ }).nth(1).click();
  await p.waitForTimeout(250);
  await shot(p, "capacity-select-wave");
  await p.getByRole("button", { name: "Continue" }).click();
  await p.waitForTimeout(500);
  await p.getByRole("button", { name: "Continue" }).click(); // ack missing → shake
  await p.waitForTimeout(200);
  await shot(p, "wizard-error-shake");
  await p.getByText("Our devices will arrive with their drives intact").click();
  await p.getByRole("button", { name: "Continue" }).click();
  await p.waitForTimeout(600);
  await shot(p, "wizard-review");
  await p.getByRole("button", { name: /Submit \d+ devices?/ }).click();
  await p.getByText("Batch sent.").waitFor({ timeout: 30000 });
  for (const t of [300, 1100, 1900, 2500, 2900, 3300, 3800]) { await p.waitForTimeout(t === 300 ? 300 : 400); await shot(p, `submit-baton-pass-${t}ms`); }
  await ctx.close();
}
if (!ONLY || ONLY === "bench") // 4 · Volunteer: claim → checklist → hold-to-confirm wipe → seal
{
  const { ctx, p } = await ctxFor("volunteer", 390);
  let link = await p.locator('a[href^="/volunteer/devices/"]').first().getAttribute("href").catch(() => null);
  if (!link) {
    await p.getByRole("button", { name: /Claim next device/ }).first().click();
    await p.waitForURL(/\/volunteer\/devices\//, { timeout: 30000 });
    link = new URL(p.url()).pathname;
  }
  await p.goto(BASE + link);
  await p.waitForTimeout(800);
  await shot(p, "bench-checklist");
  const hw = p.getByRole("button", { name: /Hardware test — tap to complete/ });
  if (await hw.count()) { await hw.click(); await p.waitForTimeout(1500); }
  const ref = p.getByLabel("Sanitization report ID");
  if (await ref.count()) {
    await ref.fill("BL-482913");
    const hold = p.getByRole("button", { name: /Hold to confirm wipe/ });
    await hold.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await p.waitForTimeout(400);
    const hb = await hold.boundingBox();
    await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await p.mouse.down();
    for (const t of [300, 700, 1050]) { await p.waitForTimeout(t === 300 ? 300 : t === 700 ? 400 : 350); await shot(p, `hold-to-confirm-${t}ms`); }
    await p.waitForTimeout(400);
    await p.mouse.up();
    await p.waitForTimeout(1600);
    await shot(p, "hold-to-confirm-seal");
  }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "_errors.txt"), errs.join("\n"));
console.log(errs.join("\n") || "no errors");
await b.close();
