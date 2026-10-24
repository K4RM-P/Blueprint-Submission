import { expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { renderReportPdf } from "@/lib/pdf/report";

/** PP-10: the annual report renders to a real PDF. Set REPORT_PDF_OUT=path to look at it. */
it("renders the annual impact report PDF", async () => {
  const pdf = await renderReportPdf({
    orgName: "Maple Ledger Accounting", tierLabel: "Impact Partner", logoDataUrl: null, periodLabel: "Nov 2025 – Oct 2026", generatedAt: "Oct 24, 2026",
    totals: { devicesReceived: 34, devicesReused: 21, devicesRecycled: 3, devicesInProgress: 10, kgDiverted: 52, co2eAvoidedKg: 5880, volunteerHours: 31, recipients: { student: 9, newcomer: 5, senior: 3, low_income_household: 2, nonprofit: 1, undisclosed: 1 } },
    monthly: ["Nov 2025","Dec 2025","Jan 2026","Feb 2026","Mar 2026","Apr 2026","May 2026","Jun 2026","Jul 2026","Aug 2026","Sep 2026","Oct 2026"].map((label, i) => ({ label, received: i > 5 ? (i * 3) % 11 : 0, reused: i > 6 ? (i * 2) % 7 : 0 })),
    recipients: [{ label: "Student", count: 9 }, { label: "Newcomer", count: 5 }, { label: "Senior", count: 3 }, { label: "Low-income household", count: 2 }],
    batches: [{ date: "May 2, 2026", title: "14 × Dell Latitude 5410", devices: 14, status: "Completed", certificate: "GL-2026-0001" }, { date: "Sep 12, 2026", title: "20 × Lenovo ThinkPad T14", devices: 20, status: "In refurbishment", certificate: null }],
    factors: [{ label: "Laptop", avgWeightKg: 2.2, co2eKg: 280, source: "TO VERIFY" }, { label: "Desktop", avgWeightKg: 8, co2eKg: 400, source: "TO VERIFY" }],
    refurbMinutes: { uniform: 60, mixed: 120 }, siteUrl: "http://localhost:3000",
  });
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  if (process.env.REPORT_PDF_OUT) writeFileSync(process.env.REPORT_PDF_OUT, pdf);
});
