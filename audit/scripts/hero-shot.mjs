// Viewport shots of the hero at several moments. Usage: node hero-shot.mjs <outPrefix> <width> [times ms,...] [scrollY]
import { chromium } from "@playwright/test";
const [out, w, times = "2000", sy = "0"] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +w < 500 ? 780 : 900 }, reducedMotion: process.env.REDUCED ? "reduce" : "no-preference" });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 300)));
p.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 300)));
await p.goto((process.env.BASE ?? "http://localhost:3000") + "/", { waitUntil: "commit" });
let last = 0;
for (const t of times.split(",").map(Number)) {
  await p.waitForTimeout(t - last); last = t;
  if (+sy) { await p.evaluate((y) => window.scrollTo(0, y), +sy); await p.waitForTimeout(900); }
  await p.screenshot({ path: `${out}-${t}.png` });
}
console.log(errs.join("\n"));
await b.close();
