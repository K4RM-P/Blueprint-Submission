"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { resetDemoAction } from "@/server/actions/demo";

/** Demo mode only: refills the staff queue and volunteer bench. Safe to press any time. */
export function ResetDemoButton() {
  const [busy, setBusy] = useState(false);
  const reset = async () => {
    setBusy(true);
    const res = await resetDemoAction();
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Demo reset.");
  };
  return (
    <ClayButton variant="ghost" size="sm" icon={<RotateCcw />} loading={busy} onClick={reset}>
      Reset demo
    </ClayButton>
  );
}
