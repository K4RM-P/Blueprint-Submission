import { LiquidFill } from "@/components/liquid";
import { formatCents } from "@/lib/ledger";

/**
 * The Pay-It-Forward jar (UI §6.4, §3.3): the one place ember liquid is allowed.
 * Level = share of everything raised that's still available to subsidize devices.
 */
export function FundJar({ balanceCents, raisedCents, className }: { balanceCents: number; raisedCents: number; className?: string }) {
  const level = raisedCents > 0 ? Math.max(0.06, Math.min(1, balanceCents / raisedCents)) : 0.04;
  return (
    <figure className={className}>
      <LiquidFill value={level} shape="jar" color="ember" className="mx-auto aspect-[4/5] w-full max-w-[220px]" />
      <figcaption className="mt-4 text-center">
        <span className="font-display block text-[2.5rem] leading-none tnum">{formatCents(balanceCents)}</span>
        <span className="text-small text-ink-2">in the fund now, ready to lower prices</span>
      </figcaption>
    </figure>
  );
}
