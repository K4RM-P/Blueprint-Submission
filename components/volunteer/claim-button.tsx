"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wrench } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { claimNextDevice } from "@/server/actions/volunteer";
import { cn } from "@/lib/utils";

/** VW-01: "Claim next device" — floats above the dock on phones. */
export function ClaimButton({ waiting, floating }: { waiting: number; floating?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const claim = async () => {
    setBusy(true);
    const res = await claimNextDevice();
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    if (!res.data.id) return toast(res.message ?? "Queue empty.");
    toast.success(res.message ?? "Claimed.");
    router.push(`/volunteer/devices/${res.data.id}`);
  };
  return (
    <div className={cn(floating && "fixed inset-x-0 bottom-[calc(max(12px,env(safe-area-inset-bottom))+76px)] z-30 flex justify-center px-4 lg:static lg:inset-auto lg:block lg:px-0")}>
      <ClayButton variant="primary" size="lg" icon={<Wrench />} loading={busy} disabled={waiting === 0} onClick={claim} className={cn(floating && "w-full max-w-sm lg:w-auto")}>
        {waiting === 0 ? "Queue is empty" : `Claim next device · ${waiting} waiting`}
      </ClayButton>
    </div>
  );
}
