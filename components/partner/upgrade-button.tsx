"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { startMembershipCheckout } from "@/server/actions/payments";
import type { PaidTier } from "@/lib/membership";

/** PP-12 / PIF-04: start a membership checkout. The action redirects to checkout on success. */
export function UpgradeButton({ tier, label, variant = "primary" }: { tier: PaidTier; label: string; variant?: "primary" | "secondary" }) {
  const [busy, setBusy] = useState(false);
  return (
    <ClayButton
      variant={variant}
      loading={busy}
      iconRight={<ArrowRight />}
      onClick={async () => {
        setBusy(true);
        const res = await startMembershipCheckout({ tier });
        if (!res.ok) {
          toast.error(res.error);
          setBusy(false);
        }
      }}
    >
      {label}
    </ClayButton>
  );
}
