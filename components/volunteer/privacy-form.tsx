"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ClayButton, ClayCard, ClayToggle, Field, Input } from "@/components/clay";
import { savePrivacy } from "@/server/actions/volunteer";

export function PrivacyForm({ initial }: { initial: { displayFirstName: string; attributionOptIn: boolean; publicProfileOptIn: boolean; handle: string } }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    const res = await savePrivacy(v);
    setBusy(false);
    setErrors(res.ok ? {} : (res.fieldErrors ?? {}));
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Saved.");
    router.refresh();
  };
  return (
    <ClayCard size="lg" className="flex max-w-2xl flex-col gap-7">
      <Field label="First name to show" error={errors.displayFirstName}>
        {({ id, describedBy, invalid }) => <Input id={id} value={v.displayFirstName} onChange={(e) => setV({ ...v, displayFirstName: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
      </Field>
      <ClayToggle
        checked={v.attributionOptIn}
        onCheckedChange={(c) => setV({ ...v, attributionOptIn: c })}
        label="Show my first name on Device Passports"
        description={'Buyers see "Refurbished by ' + (v.displayFirstName || "you") + '" instead of "an FGT volunteer". Off by default.'}
      />
      <ClayToggle
        checked={v.publicProfileOptIn}
        onCheckedChange={(c) => setV({ ...v, publicProfileOptIn: c })}
        label="Public Skills profile"
        description="A page with your first name, badges and devices refurbished — for your résumé. Off by default."
      />
      {v.publicProfileOptIn ? (
        <Field label="Profile link" hint={`Your page will be at /v/${v.handle || "your-name"}`} error={errors.handle}>
          {({ id, describedBy, invalid }) => <Input id={id} value={v.handle} onChange={(e) => setV({ ...v, handle: e.target.value.toLowerCase() })} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
      ) : null}
      <ClayButton variant="primary" loading={busy} onClick={save} className="self-start">
        Save privacy settings
      </ClayButton>
    </ClayCard>
  );
}
