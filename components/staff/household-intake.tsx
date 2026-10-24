"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HousePlus } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, Input, Select } from "@/components/clay";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DEVICE_CATEGORIES, labels, type DeviceCategory } from "@/lib/domain";
import { addHouseholdDevices } from "@/server/actions/staff";

/** OPS-13: devices from community members, not linked to a partner batch. */
export function HouseholdIntake() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ category: "laptop" as DeviceCategory, make: "", model: "", year: "", serial: "", quantity: "1" });
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const res = await addHouseholdDevices({ category: v.category, make: v.make, model: v.model, approxYear: v.year ? Number(v.year) : null, serial: v.serial, quantity: Number(v.quantity) || 1 });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Added.");
    setOpen(false);
    setV({ ...v, make: "", model: "", serial: "", quantity: "1" });
    router.refresh();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ClayButton variant="secondary" icon={<HousePlus />}>
          Household intake
        </ClayButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Household intake</DialogTitle>
          <DialogDescription>Devices dropped off by community members. Each gets its own passport code.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            {({ id }) => (
              <Select id={id} value={v.category} onChange={(e) => setV({ ...v, category: e.target.value as DeviceCategory })}>
                {DEVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {labels.category[c]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Quantity">{({ id }) => <Input id={id} inputMode="numeric" value={v.quantity} onChange={(e) => setV({ ...v, quantity: e.target.value })} />}</Field>
          <Field label="Make">{({ id }) => <Input id={id} value={v.make} onChange={(e) => setV({ ...v, make: e.target.value })} />}</Field>
          <Field label="Model">{({ id }) => <Input id={id} value={v.model} onChange={(e) => setV({ ...v, model: e.target.value })} />}</Field>
          <Field label="Approx. year">{({ id }) => <Input id={id} inputMode="numeric" value={v.year} onChange={(e) => setV({ ...v, year: e.target.value })} />}</Field>
          <Field label="Serial (if one device)">{({ id }) => <Input id={id} className="font-mono" value={v.serial} onChange={(e) => setV({ ...v, serial: e.target.value })} />}</Field>
        </div>
        <DialogFooter>
          <ClayButton variant="primary" loading={busy} onClick={submit} disabled={!v.make || !v.model}>
            Add to intake
          </ClayButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
