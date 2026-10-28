"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, Input } from "@/components/clay";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { verifyWipes } from "@/server/actions/staff";
import { DEFAULT_WIPE_METHOD } from "@/lib/certificate-wording";

/** OPS-07: staff enter the sanitization method and the report/reference ID from FGT's software. */
export function VerifyDialog({ ids, open, onOpenChange, onDone, defaultReference }: { ids: string[]; open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void; defaultReference?: string | null }) {
  const [method, setMethod] = useState(DEFAULT_WIPE_METHOD);
  const [reference, setReference] = useState(defaultReference ?? "");
  const [busy, setBusy] = useState(false);
  const bulk = ids.length > 1;
  const submit = async () => {
    setBusy(true);
    const res = await verifyWipes({ ids, method, reference: bulk ? undefined : reference });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Verified.");
    onOpenChange(false);
    onDone();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify {bulk ? `${ids.length} data wipes` : "this data wipe"}</DialogTitle>
          <DialogDescription>
            Check {bulk ? "each report" : "the report"} in Free Geek Toronto&apos;s sanitization software first. Relay records the result; it doesn&apos;t perform the wipe.
          </DialogDescription>
        </DialogHeader>
        <Field label="Sanitization method" required>
          {({ id }) => <Input id={id} value={method} onChange={(e) => setMethod(e.target.value)} />}
        </Field>
        {bulk ? (
          <p className="text-small text-ink-2">Each device keeps the report ID its volunteer recorded. Devices without one are skipped.</p>
        ) : (
          <Field label="Report / reference ID" hint="From the sanitization software." required>
            {({ id }) => <Input id={id} className="font-mono" value={reference} onChange={(e) => setReference(e.target.value)} />}
          </Field>
        )}
        <DialogFooter>
          <ClayButton variant="primary" icon={<ShieldCheck />} loading={busy} onClick={submit} disabled={method.trim().length < 3 || (!bulk && reference.trim().length < 2)}>
            Verify {bulk ? ids.length : ""}
          </ClayButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
