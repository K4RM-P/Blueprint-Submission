import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderCertificatePdf, type CertificateData } from "@/lib/pdf/certificate";
import { DEFAULT_CERTIFICATE_DISCLAIMER, DEFAULT_SANITIZATION_PROCESS, certificateWording, safeStoreUrl, standardLine } from "@/lib/certificate-wording";

/** CI-01: the certificate documents FGT's process; it names a standard only when staff set one. */
describe("certificate wording", () => {
  it("defaults: no standard, a neutral process marked to be confirmed, a disclaimer", () => {
    const w = certificateWording(null);
    expect(w.standard).toBeNull();
    expect(standardLine(w)).toBeNull();
    expect(w.process).toBe(DEFAULT_SANITIZATION_PROCESS);
    expect(w.process).toMatch(/to be confirmed by Free Geek Toronto/);
    expect(w.disclaimer).toBe(DEFAULT_CERTIFICATE_DISCLAIMER);
    expect(`${w.process} ${w.disclaimer}`).not.toMatch(/NIST|800-88|guarantee|DoD|ISO/i);
  });

  it("blank values fall back; a set standard is shown verbatim", () => {
    const w = certificateWording({ sanitization_standard: "  NIST SP 800-88 Clear ", sanitization_process: "   ", certificate_disclaimer: "" });
    expect(w.standard).toBe("NIST SP 800-88 Clear");
    expect(standardLine(w)).toBe("Sanitization standard: NIST SP 800-88 Clear");
    expect(w.process).toBe(DEFAULT_SANITIZATION_PROCESS);
    expect(w.disclaimer).toBe(DEFAULT_CERTIFICATE_DISCLAIMER);
  });

  it("store links must be http(s)", () => {
    expect(safeStoreUrl("https://example.org/shop")).toBe("https://example.org/shop");
    expect(safeStoreUrl("javascript:alert(1)")).toBeNull();
    expect(safeStoreUrl("not a url")).toBeNull();
    expect(safeStoreUrl("")).toBeNull();
  });
});

const base: CertificateData = {
  number: "GL-2026-0042",
  partnerName: "Maple Ledger Accounting",
  batchId: "00000000-0000-4000-8000-000000000000",
  receivedAt: "2026-05-18T14:00:00Z",
  issuedAt: "2026-06-13T14:00:00Z",
  issuedBy: "Marcus Bennett, Free Geek Toronto",
  verifyUrl: "http://localhost:3000/verify/GL-2026-0042",
  qrDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  devices: [
    { category: "Laptop", makeModel: "Lenovo ThinkPad T480", serial: "LE1483832", method: "Software overwrite (FGT sanitization software)", reference: "BL-482913", verifiedAt: "2026-05-22T15:00:00Z", verifiedBy: "Marcus Bennett", outcome: "Reused" },
    { category: "Laptop", makeModel: "Lenovo ThinkPad T480", serial: null, method: null, reference: null, verifiedAt: null, verifiedBy: null, outcome: "Recycled" },
  ],
};

function hasPdftotext() {
  try {
    execFileSync("pdftotext", ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function text(data: CertificateData) {
  const pdf = await renderCertificatePdf(data);
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  const dir = mkdtempSync(join(tmpdir(), "cert-"));
  writeFileSync(join(dir, "c.pdf"), pdf);
  return execFileSync("pdftotext", ["-layout", join(dir, "c.pdf"), "-"]).toString().replace(/\s+/g, " ");
}

describe.runIf(hasPdftotext())("certificate PDF contents", () => {
  it("documents method, reference ID, verification date and staff, with no standard by default", async () => {
    const t = await text({ ...base, wording: certificateWording(null) });
    expect(t).toContain("Data Sanitization Certificate");
    expect(t).toContain("documents that the devices listed below went through Free Geek Toronto");
    expect(t).toContain("BL-482913");
    expect(t).toContain("May 22, 2026, Marcus B.");
    expect(t).toContain("to be confirmed by Free Geek Toronto");
    expect(t).toContain("not a warranty");
    expect(t).not.toMatch(/Sanitization standard:|NIST|800-88/);
  });

  it("shows the standard line only when one is set", async () => {
    const t = await text({ ...base, wording: certificateWording({ sanitization_standard: "NIST SP 800-88 Clear" }) });
    expect(t).toContain("Sanitization standard: NIST SP 800-88 Clear");
  });
});
