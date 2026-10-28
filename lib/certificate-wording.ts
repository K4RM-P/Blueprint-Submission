/**
 * Certificate wording (CI-01, CI-02). The certificate DOCUMENTS that each device went
 * through Free Geek Toronto's data sanitization process. It never names a standard
 * or makes a guarantee FGT hasn't confirmed: the standard line appears only when
 * staff fill it in (Settings → Certificate wording).
 */

export interface CertificateWording {
  /** e.g. "NIST SP 800-88 Clear". Empty = no standard is shown anywhere. */
  standard: string | null;
  process: string;
  disclaimer: string;
}

export const DEFAULT_SANITIZATION_PROCESS =
  "Each storage device listed was received with its drive intact. A Free Geek Toronto volunteer ran the drive through Free Geek Toronto's data sanitization software and recorded the report/reference ID that software produced. A Free Geek Toronto staff member then checked that report before the device could be refurbished, sold or recycled. Devices that could not be reused were recycled. [Process description to be confirmed by Free Geek Toronto.]";

export const DEFAULT_CERTIFICATE_DISCLAIMER =
  "This certificate documents the process recorded in Relay for the devices listed. Free Geek Toronto's sanitization software remains the system of record for each report. It is not a warranty or a statement of compliance with any legal or industry standard unless one is named above.";

/** The neutral method label recorded when a volunteer logs a wipe (no standard implied). */
export const DEFAULT_WIPE_METHOD = "Software overwrite (FGT sanitization software)";

const clean = (v: string | null | undefined) => {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : null;
};

/** Settings row (columns may not exist yet) → the wording every certificate surface uses. */
export function certificateWording(row: { sanitization_standard?: string | null; sanitization_process?: string | null; certificate_disclaimer?: string | null } | null | undefined): CertificateWording {
  return {
    standard: clean(row?.sanitization_standard),
    process: clean(row?.sanitization_process) ?? DEFAULT_SANITIZATION_PROCESS,
    disclaimer: clean(row?.certificate_disclaimer) ?? DEFAULT_CERTIFICATE_DISCLAIMER,
  };
}

/** "Sanitization standard: …" only when one is set; otherwise null so the line is omitted. */
export function standardLine(w: CertificateWording): string | null {
  return w.standard ? `Sanitization standard: ${w.standard}` : null;
}

/** Store links must be plain http(s) URLs. Anything else is treated as "not set". */
export function safeStoreUrl(v: string | null | undefined): string | null {
  const t = clean(v);
  if (!t) return null;
  try {
    const u = new URL(t);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
