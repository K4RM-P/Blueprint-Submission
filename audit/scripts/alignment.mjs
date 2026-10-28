// Alignment pass screenshots at 1440 and 390. Usage: node audit/scripts/alignment.mjs <outDir>
// Screens: landing, Become a Partner, partner dashboard, batch wizard, staff overview, volunteer bench,
// certificate PDF (page 1), passport (public + partner-personalized).
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.argv[2] ?? "audit/alignment-after";
const CODE = process.env.CODE ?? "FGT-WRAPPED2";
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

async function certificate(page) {
  const href = `/api/certificates/${process.env.CERT ?? "GL-2026-0001"}`;
  const res = await page.request.get(BASE + href);
  if (!res.ok()) { errors.push(`certificate: HTTP ${res.status()}`); return; }
  const pdf = path.join(OUT, "certificate.pdf");
  fs.writeFileSync(pdf, await res.body());
  for (const w of WIDTHS) {
    // Same PDF page rasterised at two widths, so it lines up with the other @1440/@390 pairs.
    execFileSync("pdftoppm", ["-png", "-singlefile", "-f", "1", "-l", "1", "-scale-to-x", String(w), "-scale-to-y", "-1", pdf, path.join(OUT, `certificate@${w}`)]);
  }
  console.log("✓ certificate", href);
}

const browser = await chromium.launch(process.env.PW_EXEC ? { executablePath: process.env.PW_EXEC } : {});
const pub = await (await browser.newContext()).newPage();
pub.on("console", (m) => m.type() === "error" && errors.push(`console(public ${pub.url()}): ${m.text().slice(0, 200)}`));
if (process.env.ONLY === "certificate") { await certificate(await login(browser, "partner")); await browser.close(); process.exit(0); }
await shoot(pub, "landing", "/");
await shoot(pub, "become-a-partner", "/become-a-partner");
await shoot(pub, "passport-public", `/p/${CODE}`, { full: false });
await shoot(pub, "passport-public-full", `/p/${CODE}?view=full`);
const partner = await login(browser, "partner");
await shoot(partner, "partner-dashboard", "/partner");
await shoot(partner, "batch-wizard", "/partner/batches/new");
await shoot(partner, "passport-partner", `/p/${CODE}`, { full: false });
await shoot(partner, "passport-partner-full", `/p/${CODE}?view=full`);
await certificate(partner);
await shoot(await login(browser, "staff"), "staff-overview", "/staff");
await shoot(await login(browser, "volunteer"), "volunteer-bench", "/volunteer");
await browser.close();
console.log(errors.length ? errors.join("\n") : "no errors");
