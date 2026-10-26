// Full-page shots of the hierarchy screens at 1440 and 390. Usage: node audit/scripts/hierarchy.mjs <outDir>
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.argv[2] ?? "audit/hierarchy-after";
const WIDTHS = [1440, 390];
fs.mkdirSync(OUT, { recursive: true });
const errors = [];

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += Math.round(innerHeight * 0.6)) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

async function shoot(page, name, url, { full = true } = {}) {
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: w < 500 ? 844 : 900 });
    await page.goto(BASE + url, { waitUntil: "load", timeout: 90000 });
    await page.waitForTimeout(1200);
    if (full) await scrollThrough(page);
    await page.screenshot({ path: path.join(OUT, `${name}@${w}.png`), fullPage: full });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 1) errors.push(`${name}@${w}: horizontal overflow ${overflow}px`);
  }
  console.log("✓", name);
}

async function login(browser, role) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`console(${role} ${page.url()}): ${m.text().slice(0, 200)}`));
  await page.goto(BASE + "/demo");
  await page.getByRole("button", { name: new RegExp(`^${role}\\b`, "i") }).click();
  await page.waitForURL(new RegExp(`/${role}$`), { timeout: 60000 });
  return page;
}

const browser = await chromium.launch(process.env.PW_EXEC ? { executablePath: process.env.PW_EXEC } : {});
const pub = await (await browser.newContext()).newPage();
pub.on("console", (m) => m.type() === "error" && errors.push(`console(public ${pub.url()}): ${m.text().slice(0, 200)}`));
await shoot(pub, "landing", "/");
await shoot(pub, "become-a-partner", "/become-a-partner");
await shoot(pub, "demo", "/demo");
// The passport is a full-screen story; capture its first slide and the full passport view.
await shoot(pub, "passport", "/p/FGT-WRAPPED2", { full: false });
await shoot(pub, "passport-full", "/p/FGT-WRAPPED2?view=full");
await shoot(await login(browser, "partner"), "partner-dashboard", "/partner");
await shoot(await login(browser, "staff"), "staff-overview", "/staff");
await shoot(await login(browser, "volunteer"), "volunteer-bench", "/volunteer");
await browser.close();
console.log(errors.length ? errors.join("\n") : "no errors");
