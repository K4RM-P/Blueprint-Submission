"use client";

import { useState } from "react";
import { HandCoins } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { formatCents, roundUpCents } from "@/lib/ledger";
import { startContribution } from "@/server/actions/payments";

/**
 * PIF-02: "Round up for digital inclusion". Designed to sit on any store's order
 * confirmation; here it posts to our checkout. FGT's store can use the plain link instead.
 */
export function RoundUpWidget({ orderTotalCents }: { orderTotalCents: number }) {
  const extra = roundUpCents(orderTotalCents);
  const [busy, setBusy] = useState(false);
  return (
    <div data-tint="apricot" className="clay-sm flex flex-col gap-4 rounded-[var(--r-lg)] p-5 sm:flex-row sm:items-center">
      <span data-tint="apricot" className="clay-sm grid size-11 shrink-0 place-items-center rounded-[14px] text-ember-deep" aria-hidden>
        <HandCoins className="size-[22px]" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Round up for digital inclusion</p>
        <p className="text-small text-ink-2">
          Add {formatCents(extra)} to make your total {formatCents(orderTotalCents + extra)}. It lowers the price of a computer for a student or newcomer.
        </p>
      </div>
      <ClayButton
        variant="primary"
        loading={busy}
        onClick={async () => {
          setBusy(true);
          const res = await startContribution({ amountCents: extra, source: "round_up" });
          if (!res.ok) {
            toast.error(res.error);
            setBusy(false);
          }
        }}
      >
        Add {formatCents(extra)}
      </ClayButton>
    </div>
  );
}
