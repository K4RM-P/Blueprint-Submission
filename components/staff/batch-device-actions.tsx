"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Store } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, FlatCard } from "@/components/clay";
import type { DeviceStatus } from "@/lib/domain";
import { changeStatus } from "@/server/actions/staff";
import { VerifyDialog } from "./verify-dialog";

/** OPS-05/OPS-07 for a whole batch in one action: verify every pending wipe, list every ready device. */
export function BatchDeviceActions({ devices }: { devices: { id: string; status: DeviceStatus }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = devices.filter((d) => d.status === "wipe_pending_verification").map((d) => d.id);
  const ready = devices.filter((d) => d.status === "ready").map((d) => d.id);
  if (pending.length === 0 && ready.length === 0) return null;
  const list = async () => {
    setBusy(true);
    const res = await changeStatus({ ids: ready, to: "listed" });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Listed.");
    router.refresh();
  };
  return (
    <FlatCard className="flex flex-col gap-3">
      <h2 className="font-semibold">Whole batch</h2>
      <p className="text-small text-ink-2">One action for every device in this batch. Each device keeps its own sanitization reference ID and chain-of-custody record.</p>
      <div className="flex flex-wrap gap-2">
        {pending.length > 0 ? (
          <ClayButton variant="secondary" size="sm" icon={<ShieldCheck />} onClick={() => setOpen(true)}>
            Verify {pending.length} wipe{pending.length === 1 ? "" : "s"}
          </ClayButton>
        ) : null}
        {ready.length > 0 ? (
          <ClayButton variant="ghost" size="sm" icon={<Store />} loading={busy} onClick={list}>
            List {ready.length} ready in the store
          </ClayButton>
        ) : null}
      </div>
      <VerifyDialog ids={pending} open={open} onOpenChange={setOpen} onDone={() => router.refresh()} />
    </FlatCard>
  );
}
