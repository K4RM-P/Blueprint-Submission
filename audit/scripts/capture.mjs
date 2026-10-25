// Full-page screenshots of every route × role × width. Usage: node audit/scripts/capture.mjs <outDir> [filter]
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.argv[2] ?? "audit/screenshots";
const FILTER = process.argv[3] ? new RegExp(process.argv[3]) : null;
const WIDTHS = (process.env.WIDTHS ?? "360,768,1280,1600").split(",").map(Number);
fs.mkdirSync(OUT, { recursive: true });

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += Math.round(innerHeight * 0.6)) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

async function firstHref(page, url, re) {
  await page.goto(BASE + url, { waitUntil: "load" });
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  return hrefs.find((h) => h && re.test(h)) ?? null;
}

async function login(ctx, role) {
  const page = await ctx.newPage();
  await page.goto(BASE + "/demo");
  await page.getByRole("button", { name: new RegExp(`explore as (a |)${role}`, "i") }).click();
  await page.waitForURL(new RegExp(`/${role}$`), { timeout: 45000 });
  return page;
}

const browser = await chromium.launch();
const errors = [];

async function shoot(ctxPage, name, url) {
  if (FILTER && !FILTER.test(name)) return;
  for (const w of WIDTHS) {
    await ctxPage.setViewportSize({ width: w, height: w < 500 ? 780 : w < 1000 ? 1024 : 900 });
    try {
      await ctxPage.goto(BASE + url, { waitUntil: "load", timeout: 60000 });
      await ctxPage.waitForTimeout(700);
      await scrollThrough(ctxPage);
      await ctxPage.screenshot({ path: path.join(OUT, `${name}@${w}.png`), fullPage: true });
      const overflow = await ctxPage.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 1) errors.push(`${name}@${w}: horizontal overflow ${overflow}px`);
    } catch (e) {
      errors.push(`${name}@${w}: ${e.message.split("\n")[0]}`);
    }
  }
  console.log("✓", name);
}

// Public
const pub = await browser.newContext();
const pp = await pub.newPage();
pp.on("console", (m) => m.type() === "error" && errors.push(`console(public ${pp.url()}): ${m.text().slice(0, 200)}`));
const publicRoutes = [
  ["home", "/"], ["about", "/about"], ["become-a-partner", "/become-a-partner"], ["donate", "/donate"], ["impact", "/impact"],
  ["partners", "/partners"], ["pay-it-forward", "/pay-it-forward"], ["round-up", "/pay-it-forward/round-up"], ["login", "/login"],
  ["signup", "/signup"], ["forgot-password", "/forgot-password"], ["demo", "/demo"], ["styleguide", "/styleguide"], ["not-found", "/nope-404"],
];

// Discover dynamic ids with the staff account
const staffCtx = await browser.newContext();
const sp = await login(staffCtx, "staff");
sp.on("console", (m) => m.type() === "error" && errors.push(`console(staff ${sp.url()}): ${m.text().slice(0, 200)}`));
const staffDevice = await firstHref(sp, "/staff/devices", /^\/staff\/devices\/[^/?]+$/);
const staffBatch = await firstHref(sp, "/staff/batches", /^\/staff\/batches\/[^/?]+$/);
const passportHref = await firstHref(sp, "/partners", /^\/p\//) ;
let passport = passportHref;
if (!passport) {
  await sp.goto(BASE + (staffDevice ?? "/staff/devices"));
  const html = await sp.content();
  const m = html.match(/FGT-[A-Z0-9]{8}/);
  passport = m ? `/p/${m[0]}` : null;
}
await sp.goto(BASE + "/staff/batches?status=certified").catch(() => {});
const certHtml = await sp.content();
const cert = certHtml.match(/GL-[A-Z0-9-]+/)?.[0] ?? null;
fs.writeFileSync(path.join(OUT, "_ids.json"), JSON.stringify({ staffDevice, staffBatch, passport, cert }, null, 2));

for (const [n, u] of publicRoutes) await shoot(pp, `public-${n}`, u);
if (passport) await shoot(pp, "public-passport", passport);
await shoot(pp, "public-volunteer-profile", "/v/aisha-rahman");
if (cert) await shoot(pp, "public-verify", `/verify/${cert}`);

const staffRoutes = [["overview", "/staff"], ["batches", "/staff/batches"], ["devices", "/staff/devices"], ["fund", "/staff/fund"], ["labels", "/staff/labels"], ["partners", "/staff/partners"], ["settings", "/staff/settings"], ["volunteers", "/staff/volunteers"]];
if (staffBatch) staffRoutes.push(["batch-detail", staffBatch]);
if (staffDevice) staffRoutes.push(["device-detail", staffDevice]);
for (const [n, u] of staffRoutes) await shoot(sp, `staff-${n}`, u);

const partnerCtx = await browser.newContext();
const ptp = await login(partnerCtx, "partner");
ptp.on("console", (m) => m.type() === "error" && errors.push(`console(partner ${ptp.url()}): ${m.text().slice(0, 200)}`));
const pBatch = await firstHref(ptp, "/partner/batches", /^\/partner\/batches\/[0-9a-f-]{36}$/);
const partnerRoutes = [["dashboard", "/partner"], ["batches", "/partner/batches"], ["new-batch", "/partner/batches/new"], ["membership", "/partner/membership"], ["report", "/partner/report"], ["settings", "/partner/settings"]];
if (pBatch) partnerRoutes.push(["batch-detail", pBatch]);
for (const [n, u] of partnerRoutes) await shoot(ptp, `partner-${n}`, u);

const volCtx = await browser.newContext();
const vp = await login(volCtx, "volunteer");
vp.on("console", (m) => m.type() === "error" && errors.push(`console(volunteer ${vp.url()}): ${m.text().slice(0, 200)}`));
const vDevice = await firstHref(vp, "/volunteer", /^\/volunteer\/devices\/[^/?]+$/);
const volRoutes = [["bench", "/volunteer"], ["wallet", "/volunteer/wallet"], ["settings", "/volunteer/settings"]];
if (vDevice) volRoutes.push(["device", vDevice]);
for (const [n, u] of volRoutes) await shoot(vp, `volunteer-${n}`, u);

fs.writeFileSync(path.join(OUT, "_errors.txt"), errors.join("\n"));
console.log(errors.join("\n"));
await browser.close();
