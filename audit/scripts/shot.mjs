// Quick viewport shot(s). Usage: node shot.mjs <url> <width> <out.png> [scrollY,...] [waitMs] [role]
import { chromium } from "@playwright/test";
const [url, w, out, ys = "0", wait = "1500", role] = process.argv.slice(2);
const BASE = process.env.BASE ?? "http://localhost:3000";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +w < 500 ? 780 : 900 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 300)));
p.on("pageerror", (e) => errs.push("pageerror " + e.message.slice(0, 300)));
if (role) {
  await p.goto(BASE + "/demo");
  await p.getByRole("button", { name: new RegExp(`explore as (a |)${role}`, "i") }).click();
  await p.waitForURL(new RegExp(`/${role}$`), { timeout: 45000 });
}
await p.goto(BASE + url, { waitUntil: "load" });
await p.waitForTimeout(+wait);
const list = ys.split(",").map(Number);
for (let i = 0; i < list.length; i++) {
  await p.evaluate((y) => window.scrollTo(0, y), list[i]);
  await p.waitForTimeout(900);
  await p.screenshot({ path: list.length > 1 ? out.replace(".png", `-${i}.png`) : out });
}
console.log("overflow", await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), errs.join("\n"));
await b.close();
