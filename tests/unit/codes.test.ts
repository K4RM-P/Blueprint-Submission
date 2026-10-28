import { describe, expect, it } from "vitest";
import { PASSPORT_ALPHABET, generatePassportCode, generateUniqueCodes, isValidPassportCode, normalizePassportCode } from "@/lib/passport-code";
import { batchReference, formatCertificateNumber, isValidCertificateNumber, nextCertificateNumber, parseCertificateNumber } from "@/lib/certificate-number";

describe("passport codes", () => {
  it("uses the FGT- prefix and 8 unambiguous characters", () => {
    for (let i = 0; i < 500; i++) {
      const c = generatePassportCode();
      expect(c).toMatch(/^FGT-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/);
      expect(isValidPassportCode(c)).toBe(true);
    }
  });
  it("never uses ambiguous characters", () => {
    for (const ch of "01OIL") expect(PASSPORT_ALPHABET.includes(ch)).toBe(false);
  });
  it("generates unique batches and avoids existing codes", () => {
    const existing = new Set(["FGT-22222222"]);
    const codes = generateUniqueCodes(2000, existing);
    expect(new Set(codes).size).toBe(2000);
    expect(codes).not.toContain("FGT-22222222");
  });
  it("is deterministic with an injected random source and skips biased bytes", () => {
    const code = generatePassportCode((b) => b.fill(255).map((_, i) => (i < 8 ? 255 : 0)));
    expect(code).toBe("FGT-22222222");
  });
  it("normalizes typed codes", () => {
    expect(normalizePassportCode(" fgt-7k3m9q2x ")).toBe("FGT-7K3M9Q2X");
    expect(normalizePassportCode("7k3m9q2x")).toBe("FGT-7K3M9Q2X");
    expect(isValidPassportCode("FGT-7K3M9Q2")).toBe(false);
    expect(isValidPassportCode("FGT-0K3M9Q2X")).toBe(false);
  });
});

describe("certificate numbers", () => {
  it("formats GL-YYYY-NNNN", () => {
    expect(formatCertificateNumber(2026, 7)).toBe("GL-2026-0007");
    expect(formatCertificateNumber(2026, 12345)).toBe("GL-2026-12345");
    expect(() => formatCertificateNumber(2026, 0)).toThrow();
  });
  it("parses and validates", () => {
    expect(parseCertificateNumber("gl-2026-0042")).toEqual({ year: 2026, sequence: 42 });
    expect(isValidCertificateNumber("GL-26-0042")).toBe(false);
  });
  it("increments per year", () => {
    expect(nextCertificateNumber(2026, ["GL-2026-0001", "GL-2026-0004", "GL-2025-0009"])).toBe("GL-2026-0005");
    expect(nextCertificateNumber(2027, ["GL-2026-0001"])).toBe("GL-2027-0001");
  });
});

describe("batch reference on certificates (CI-01)", () => {
  it("is short, readable and stable for a batch id", () => {
    expect(batchReference("e4c78be7-1a2b-4c3d-8e9f-001122334455")).toBe("B-E4C78BE7");
    expect(batchReference("e4c78be7-1a2b-4c3d-8e9f-001122334455")).toBe(batchReference("e4c78be7-1a2b-4c3d-8e9f-001122334455"));
  });
});

describe("sanitization report IDs (OPS-07, VW-02)", () => {
  it("accept what wipe software prints, reject markup", async () => {
    const { REPORT_ID } = await import("@/lib/domain");
    for (const ok of ["RPT-482913", "BL 2026/10/28 #44", "a1b2:c3_d4.e5"]) expect(REPORT_ID.test(ok)).toBe(true);
    for (const bad of ["<script>alert(1)</script>", "-starts-with-dash", "", "x".repeat(121)]) expect(REPORT_ID.test(bad)).toBe(false);
  });
});
