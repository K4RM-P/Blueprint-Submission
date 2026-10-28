// Friction numbers for the scorecard (D7): the new-partner journey from the landing page to a
// submitted batch, counted in interactions, with a scripted run time and a human estimate.
// Usage: PW_CHROMIUM_PATH=/opt/pw-browsers/chromium node audit/scripts/friction.mjs [baseUrl]
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
let clicks = 0, fields = 0, typed = 0;
const click = async (l) => { clicks++; await l.click(); };
const fill = async (l, v) => { fields++; typed += String(v).length; await l.fill(String(v)); };

const t0 = Date.now();
await page.goto(BASE + "/");
await click(page.getByRole("link", { name: "Become a Reuse Partner" }).first());
await page.waitForURL(/become-a-partner/);
await click(page.getByRole("link", { name: "Become a Reuse Partner" }).first());
await fill(page.getByLabel("Your name"), "Robin Friction");
await fill(page.getByLabel("Organization name"), "Friction Check Bookkeeping");
await fill(page.getByLabel("Work email"), `friction-${Date.now()}@geekloop.test`);
await fill(page.getByLabel("Password"), "a-long-test-password");
await click(page.getByRole("button", { name: "Create partner account" }));
await page.waitForURL(/\/partner\/settings\?welcome=1/);
// Every onboarding field is optional: one click goes straight to the wizard.
await click(page.getByRole("button", { name: "Save and start a batch" }));
await page.waitForURL(/\/partner\/batches\/new/);
await fill(page.getByLabel("Make"), "Dell");
await fill(page.getByLabel("Model"), "Latitude 5420");
await fill(page.getByLabel("Approx. year"), "2021");
await fill(page.getByLabel("Quantity"), "20");
await click(page.getByRole("button", { name: "Continue" }));
await click(page.getByRole("radio", { name: /Open,/ }).first());
await click(page.getByRole("button", { name: "Continue" }));
await click(page.getByLabel(/drives intact/));
await click(page.getByRole("button", { name: "Continue" }));
await click(page.getByRole("button", { name: /Submit batch/ }));
await page.getByRole("status").filter({ hasText: "Batch sent." }).waitFor();
const scripted = (Date.now() - t0) / 1000;

// Human estimate: ~1.2 s per click (find + press), ~2 s to move into a field, ~0.25 s per character typed,
// plus ~15 s reading the Become a Partner page before committing.
const human = Math.round(clicks * 1.2 + fields * 2 + typed * 0.25 + 15);
console.log(JSON.stringify({ clicks, fields, charactersTyped: typed, interactions: clicks + fields, scriptedSeconds: scripted, humanEstimateSeconds: human }));
await b.close();
