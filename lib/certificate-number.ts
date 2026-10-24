/** Certificate numbers look like GL-2026-0007 (PRD CI-01). */
const PATTERN = /^GL-(\d{4})-(\d{4,})$/;

export function formatCertificateNumber(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) throw new Error("Invalid certificate year");
  if (!Number.isInteger(sequence) || sequence < 1) throw new Error("Invalid certificate sequence");
  return `GL-${year}-${String(sequence).padStart(4, "0")}`;
}

export function parseCertificateNumber(value: string): { year: number; sequence: number } | null {
  const m = PATTERN.exec(value.trim().toUpperCase());
  return m ? { year: Number(m[1]), sequence: Number(m[2]) } : null;
}

export function isValidCertificateNumber(value: string): boolean {
  return parseCertificateNumber(value) !== null;
}

/** Next number for `year` given the numbers already issued. */
export function nextCertificateNumber(year: number, existing: string[]): string {
  const max = existing
    .map(parseCertificateNumber)
    .filter((p): p is { year: number; sequence: number } => p !== null && p.year === year)
    .reduce((m, p) => Math.max(m, p.sequence), 0);
  return formatCertificateNumber(year, max + 1);
}
