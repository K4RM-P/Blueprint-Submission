/** Pay-It-Forward fund ledger (PIF-03). Amounts in integer cents; positive in, negative out. */

export type FundTxType = "contribution" | "subsidy" | "sponsorship";

export interface FundTx {
  type: FundTxType;
  amountCents: number;
}

export function fundBalance(txs: FundTx[]): number {
  return txs.reduce((s, t) => s + t.amountCents, 0);
}

export function validateTx(tx: FundTx): string | null {
  if (!Number.isInteger(tx.amountCents) || tx.amountCents === 0) return "Amount must be a whole number of cents.";
  if (tx.type === "subsidy" && tx.amountCents > 0) return "Subsidies take money out of the fund.";
  if (tx.type !== "subsidy" && tx.amountCents < 0) return "Contributions and sponsorships add money to the fund.";
  return null;
}

/** Can the fund cover a subsidy of `subsidyCents` without going negative? */
export function canApplySubsidy(balanceCents: number, subsidyCents: number, priceCents: number | null): string | null {
  if (!Number.isInteger(subsidyCents) || subsidyCents <= 0) return "Enter a subsidy greater than $0.";
  if (priceCents !== null && subsidyCents > priceCents) return "The subsidy can't be more than the device price.";
  if (subsidyCents > balanceCents) return `The fund only has ${formatCents(balanceCents)} available.`;
  return null;
}

export function applyTx(balanceCents: number, tx: FundTx): number {
  const err = validateTx(tx);
  if (err) throw new Error(err);
  const next = balanceCents + tx.amountCents;
  if (next < 0) throw new Error("The fund balance can't go negative.");
  return next;
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

/** Champion tier credits 10 sponsored laptops (PRD §6.1). Value per laptop is an [ASSUMPTION]. */
export const CHAMPION_SPONSORED_LAPTOPS = 10;
