"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, Input, Select, Textarea } from "@/components/clay";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addManualFundEntry } from "@/server/actions/payments";

/** PIF-03: record money received outside checkout (cheque, cash, an event). */
export function FundEntry({ partners }: { partners: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [v, setV] = useState({ type: "contribution" as "contribution" | "sponsorship", amount: "", organizationId: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const cents = Math.round(Number(v.amount.replace(/[$,\s]/g, "")) * 100);
    if (!Number.isFinite(cents) || cents < 100) return setErrors({ amountCents: "Enter at least $1." });
    setBusy(true);
    const res = await addManualFundEntry({ type: v.type, amountCents: cents, organizationId: v.organizationId || null, note: v.note });
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      return toast.error(res.error);
    }
    toast.success(res.message ?? "Added to the fund.");
    setOpen(false);
    setV({ type: "contribution", amount: "", organizationId: "", note: "" });
    setErrors({});
    router.refresh();
  };

  return (
    <>
      <ClayButton variant="primary" icon={<Plus />} onClick={() => setOpen(true)}>
        Record money received
      </ClayButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record money received</DialogTitle>
            <DialogDescription>For cheques, cash or event donations. Online contributions are recorded automatically.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              {({ id }) => (
                <Select id={id} value={v.type} onChange={(e) => setV({ ...v, type: e.target.value as typeof v.type })}>
                  <option value="contribution">Contribution</option>
                  <option value="sponsorship">Partner sponsorship</option>
                </Select>
              )}
            </Field>
            <Field label="Amount (CAD)" error={errors.amountCents} required>
              {({ id, describedBy, invalid }) => <Input id={id} inputMode="decimal" aria-describedby={describedBy} aria-invalid={invalid} value={v.amount} onChange={(e) => setV({ ...v, amount: e.target.value })} />}
            </Field>
            <Field label={v.type === "sponsorship" ? "Partner" : "Partner (optional)"} error={errors.organizationId} className="sm:col-span-2">
              {({ id, describedBy }) => (
                <Select id={id} aria-describedby={describedBy} value={v.organizationId} onChange={(e) => setV({ ...v, organizationId: e.target.value })}>
                  <option value="">None</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Where it came from" error={errors.note} required className="sm:col-span-2">
              {({ id, describedBy, invalid }) => (
                <Textarea id={id} rows={2} aria-describedby={describedBy} aria-invalid={invalid} placeholder="e.g. Cheque from the Danforth community fair" value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} />
              )}
            </Field>
          </div>
          <DialogFooter>
            <ClayButton variant="primary" loading={busy} onClick={submit}>
              Add to fund
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
