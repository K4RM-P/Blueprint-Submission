"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { withdrawBatch } from "@/server/actions/partner";

/** Edit / withdraw while a batch is still `submitted`. */
export function BatchActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const withdraw = async () => {
    setBusy(true);
    const res = await withdrawBatch({ id });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setOpen(false);
    toast.success(res.message ?? "Batch withdrawn.");
    router.push("/partner/batches");
    router.refresh();
  };
  return (
    <div className="flex flex-wrap gap-3">
      <ClayButton href={`/partner/batches/${id}/edit`} variant="secondary" size="sm" icon={<Pencil />}>
        Edit batch
      </ClayButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <ClayButton variant="ghost" size="sm" icon={<Undo2 />}>
            Withdraw
          </ClayButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw this batch?</DialogTitle>
            <DialogDescription>It hasn&apos;t been reviewed yet, so nothing is lost. You can submit a new batch any time.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <ClayButton variant="secondary" onClick={() => setOpen(false)}>
              Keep it
            </ClayButton>
            <ClayButton variant="danger" loading={busy} onClick={withdraw}>
              Withdraw batch
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
