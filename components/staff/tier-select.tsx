"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PARTNER_TIERS, labels, type PartnerTier } from "@/lib/domain";
import { changeTier } from "@/server/actions/staff";

/** OPS-10: manual tier change. */
export function TierSelect({ orgId, tier, name }: { orgId: string; tier: PartnerTier; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <select
      aria-label={`Tier for ${name}`}
      defaultValue={tier}
      disabled={busy}
      onChange={async (e) => {
        setBusy(true);
        const res = await changeTier({ orgId, tier: e.target.value });
        setBusy(false);
        if (!res.ok) return toast.error(res.error);
        toast.success(`${name}: ${labels.tier[e.target.value as PartnerTier]}`);
        router.refresh();
      }}
      className="h-10 rounded-full border border-line bg-surface-flat px-3 text-[0.875rem]"
    >
      {PARTNER_TIERS.map((t) => (
        <option key={t} value={t}>
          {labels.tier[t]}
        </option>
      ))}
    </select>
  );
}
