// Frame sequences: hero entrance (every 120ms) and the scroll story. Usage: node landing-frames.mjs <outDir> [width]
import { chromium } from "@playwright/test";
const [out, w = "1280"] = process.argv.slice(2);
const BASE = process.env.BASE ?? "http://localhost:3000";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +w < 500 ? 780 : 900 } });
const p = await ctx.newPage();
await p.goto(BASE + "/", { waitUntil: "load" });
await p.waitForTimeout(1500);
// warm cache, then reload so the entrance is captured from the first paint
await p.goto(BASE + "/", { waitUntil: "commit" });
const t0 = Date.now();
for (let i = 0; i < 14; i++) {
  await p.screenshot({ path: `${out}/entrance-${w}-${String(i).padStart(2, "0")}.png` });
  const next = t0 + (i + 1) * 120;
  await p.waitForTimeout(Math.max(0, next - Date.now()));
}
await p.waitForTimeout(1200);
await p.mouse.move(+w * 0.85, 300);
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/pointer-${w}-right.png` });
await p.mouse.move(+w * 0.15, 700);
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/pointer-${w}-left.png` });
const h = await p.evaluate(() => document.documentElement.scrollHeight);
let k = 0;
for (let y = 0; y < Math.min(h, 4800); y += 300) {
  await p.mouse.wheel(0, 300);
  await p.waitForTimeout(450);
  await p.screenshot({ path: `${out}/scroll-${w}-${String(k++).padStart(2, "0")}.png` });
}
await b.close();
