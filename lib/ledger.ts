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
  // No price means no cap to check against: a subsidy needs FGT's price first (public promise: never more than the price).
  if (priceCents === null) return "Set the device's price before applying a subsidy.";
  if (subsidyCents > priceCents) return "The subsidy can't be more than the device price.";
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

/** Value credited to the fund per sponsored laptop [ASSUMPTION — validate with FGT]. */
export const SPONSORED_LAPTOP_CENTS = 7_500;

/** Champion memberships credit this much to the fund in the partner's name (PRD §6.1). */
export const CHAMPION_SPONSORSHIP_CENTS = CHAMPION_SPONSORED_LAPTOPS * SPONSORED_LAPTOP_CENTS;

/** One-time contribution presets on /pay-it-forward (PIF-01). */
export const CONTRIBUTION_PRESETS_CENTS = [500, 1_000, 2_500] as const;
export const CONTRIBUTION_MIN_CENTS = 100;
export const CONTRIBUTION_MAX_CENTS = 100_000;

export function validateContribution(cents: number): string | null {
  if (!Number.isInteger(cents)) return "Enter a whole number of cents.";
  if (cents < CONTRIBUTION_MIN_CENTS) return `The smallest contribution is ${formatCents(CONTRIBUTION_MIN_CENTS)}.`;
  if (cents > CONTRIBUTION_MAX_CENTS) return `For gifts over ${formatCents(CONTRIBUTION_MAX_CENTS)}, please contact Free Geek Toronto directly.`;
  return null;
}

/** Round-ups go to the next multiple of this (PIF-02). */
export const ROUND_UP_STEP_CENTS = 500;

/**
 * Round-up amount for a store order (PIF-02): what it takes to reach the next $5,
 * skipping to the following $5 when that would add less than the $1 minimum.
 */
export function roundUpCents(orderTotalCents: number): number {
  if (!Number.isInteger(orderTotalCents) || orderTotalCents < 0) throw new Error("Order total must be a non-negative whole number of cents.");
  let extra = ROUND_UP_STEP_CENTS - (orderTotalCents % ROUND_UP_STEP_CENTS);
  if (extra < CONTRIBUTION_MIN_CENTS) extra += ROUND_UP_STEP_CENTS;
  return extra;
}
