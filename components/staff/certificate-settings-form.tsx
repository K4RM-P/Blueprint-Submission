"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, FlatCard, Input, Textarea } from "@/components/clay";
import { saveCertificateSettings } from "@/server/actions/staff";

interface Values {
  standard: string;
  process: string;
  disclaimer: string;
  storeUrl: string;
}

/** OPS-12: certificate wording (the certificate documents FGT's process) and FGT's existing store link. */
export function CertificateSettingsForm({ initial, ready }: { initial: Values; ready: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const save = async () => {
    setBusy(true);
    setErrors({});
    const res = await saveCertificateSettings(v);
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      return toast.error(res.error);
    }
    toast.success(res.message ?? "Saved.");
    router.refresh();
  };
  return (
    <FlatCard className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-title font-semibold">Certificate wording &amp; store link</h2>
          <p className="mt-1 max-w-[62ch] text-small text-ink-2">
            Certificates document that each device went through Free Geek Toronto&apos;s data sanitization process. Leave the standard empty unless FGT has confirmed it follows one; an empty standard is never shown.
          </p>
        </div>
        <ClayButton variant="secondary" size="sm" icon={<Save />} loading={busy} onClick={save} disabled={!ready}>
          Save wording
        </ClayButton>
      </div>
      {!ready ? (
        <p role="status" className="rounded-[var(--r-sm)] bg-butter p-3 text-small text-[#6b4e00]">
          These settings need the latest database migration. Ask your developer to run <span className="font-mono">pnpm db:push</span>. Until then certificates use the default wording below.
        </p>
      ) : null}
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Sanitization standard (optional)" hint='Only if FGT confirms it, e.g. "NIST SP 800-88 Clear". Empty = no standard on certificates.' error={errors.standard}>
          {({ id, describedBy, invalid }) => <Input id={id} value={v.standard} onChange={(e) => setV({ ...v, standard: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
        <Field label="Online store link" hint="FGT's existing store. Passports of ready devices link here." error={errors.storeUrl}>
          {({ id, describedBy, invalid }) => <Input id={id} type="url" inputMode="url" placeholder="https://" value={v.storeUrl} onChange={(e) => setV({ ...v, storeUrl: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
        <Field label="Process description" hint="A short, plain description of what FGT does to each drive." className="lg:col-span-2" error={errors.process}>
          {({ id, describedBy, invalid }) => <Textarea id={id} rows={4} value={v.process} onChange={(e) => setV({ ...v, process: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
        <Field label="Disclaimer line" hint="Printed at the bottom of every certificate and on the public verification page." className="lg:col-span-2" error={errors.disclaimer}>
          {({ id, describedBy, invalid }) => <Textarea id={id} rows={2} value={v.disclaimer} onChange={(e) => setV({ ...v, disclaimer: e.target.value })} aria-describedby={describedBy} aria-invalid={invalid} />}
        </Field>
      </div>
    </FlatCard>
  );
}
