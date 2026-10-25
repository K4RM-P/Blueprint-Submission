// Full-page landing shots. Usage: node landing-full.mjs <outDir> [widths]
// Scrolls through the page first so in-view animations settle before capture.
import { chromium } from "@playwright/test";
const [outDir, widths = "360,768,1280,1600"] = process.argv.slice(2);
const BASE = process.env.BASE ?? "http://localhost:3000";
const b = await chromium.launch();
for (const w of widths.split(",").map(Number)) {
  const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 780 : 900 }, reducedMotion: process.env.REDUCED ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
  p.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 200)));
  await p.goto(BASE + "/", { waitUntil: "load" });
  await p.waitForTimeout(2200);
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(120); }
  await p.waitForTimeout(800);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${outDir}/landing@${w}.png`, fullPage: true });
  await p.screenshot({ path: `${outDir}/landing-fold@${w}.png` });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(w, "overflow", ov, errs.join(" | "));
  await ctx.close();
}
await b.close();
