"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, Input } from "@/components/clay";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { verifyWipes } from "@/server/actions/staff";
import { DEFAULT_WIPE_METHOD } from "@/lib/domain";

/** OPS-07: staff enter the sanitization method and the report/reference ID from FGT's software. */
export function VerifyDialog({
  ids,
  open,
  onOpenChange,
  onDone,
  defaultReference,
  keepRecorded,
  devices,
}: {
  ids: string[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onDone: () => void;
  defaultReference?: string | null;
  /** From the device table: every device keeps the report ID its volunteer recorded. */
  keepRecorded?: boolean;
  /** Shown read-only so staff can cross-check each one against the sanitization report. */
  devices?: { code: string; reportRef: string | null }[];
}) {
  const [method, setMethod] = useState(DEFAULT_WIPE_METHOD);
  const [reference, setReference] = useState(defaultReference ?? "");
  const [busy, setBusy] = useState(false);
  const bulk = ids.length > 1 || Boolean(keepRecorded);
  // Each time it opens, start from clean defaults (nothing typed earlier sticks around).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMethod(DEFAULT_WIPE_METHOD);
      setReference(defaultReference ?? "");
    }
  }
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
          <DialogTitle>Verify {ids.length > 1 ? `${ids.length} data wipes` : "this data wipe"}</DialogTitle>
          <DialogDescription>
            Check {ids.length > 1 ? "each report" : "the report"} in Free Geek Toronto&apos;s sanitization software first. Relay records the result; it doesn&apos;t perform the wipe.
          </DialogDescription>
        </DialogHeader>
        <Field label="Sanitization method" hint="As named in Free Geek Toronto’s sanitization report." required>
          {({ id }) => <Input id={id} value={method} onChange={(e) => setMethod(e.target.value)} />}
        </Field>
        {bulk ? (
          <>
            <p className="text-small text-ink-2">
              {ids.length > 1 ? "Each device keeps the report ID its volunteer recorded." : "The device keeps the report ID its volunteer recorded."} Check each against your sanitization
              report. Devices without one are skipped.
            </p>
            {devices?.length ? (
              <ul className="max-h-48 overflow-auto rounded-[var(--r-sm)] border border-line font-mono text-[0.8125rem]" aria-label="Devices and their recorded report IDs">
                {devices.map((d) => (
                  <li key={d.code} className="flex justify-between gap-4 border-b border-line px-3 py-1.5 last:border-b-0">
                    <span>{d.code}</span>
                    <span className={d.reportRef ? "text-ink" : "text-danger-ink"}>{d.reportRef ?? "no report ID"}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <Field label="Report / reference ID" hint="From the sanitization software." required>
            {({ id }) => <Input id={id} className="font-mono" value={reference} onChange={(e) => setReference(e.target.value)} />}
          </Field>
        )}
        <DialogFooter>
          <ClayButton variant="primary" icon={<ShieldCheck />} loading={busy} onClick={submit} disabled={method.trim().length < 3 || (!bulk && reference.trim().length < 2)}>
            Verify {ids.length > 1 ? ids.length : ""}
          </ClayButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
