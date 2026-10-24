import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { settle } from "./helpers";

/** WCAG 2.1 AA (PRD §13) on the key public pages. Signed-in pages are covered by the flow tests. */
const PAGES = ["/", "/become-a-partner", "/partners", "/impact", "/about", "/donate", "/pay-it-forward", "/pay-it-forward/round-up", "/demo", "/login", "/p/FGT-ZZZZZZZZ"];

for (const path of PAGES) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(path);
    await settle(page);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`)).toEqual([]);
  });
}
