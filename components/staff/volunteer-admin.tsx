"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Award, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, Input, Select } from "@/components/clay";
import { awardMentor, inviteVolunteer } from "@/server/actions/volunteer";

/** OPS-11 / AUTH-04: staff invite volunteers (or staff); they sign up with that email. */
export function InviteForm() {
  const router = useRouter();
  const [v, setV] = useState({ fullName: "", email: "", role: "volunteer" });
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const submit = async () => {
    setBusy(true);
    const res = await inviteVolunteer(v);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Invited.");
    setLink(`${window.location.origin}${res.data.link}`);
    setV({ fullName: "", email: "", role: v.role });
    router.refresh();
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
        <Field label="Name">{({ id }) => <Input id={id} value={v.fullName} onChange={(e) => setV({ ...v, fullName: e.target.value })} />}</Field>
        <Field label="Email">{({ id }) => <Input id={id} type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />}</Field>
        <Field label="Role">
          {({ id }) => (
            <Select id={id} value={v.role} onChange={(e) => setV({ ...v, role: e.target.value })}>
              <option value="volunteer">Volunteer</option>
              <option value="staff">Staff</option>
            </Select>
          )}
        </Field>
        <ClayButton variant="secondary" icon={<UserPlus />} loading={busy} onClick={submit} disabled={!v.fullName || !v.email}>
          Create account invite
        </ClayButton>
      </div>
      {link ? (
        <p role="status" className="rounded-[var(--r-sm)] bg-mint p-3 text-small text-loop-deep">
          Send this sign-up link: <span className="break-all font-mono">{link}</span>
        </p>
      ) : null}
    </div>
  );
}

export function MentorButton({ volunteerId, has }: { volunteerId: string; has: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (has) return <span className="chip bg-butter text-[#6b4e00]">Mentor</span>;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await awardMentor({ volunteerId });
        setBusy(false);
        if (!res.ok) return toast.error(res.error);
        toast.success(res.message ?? "Awarded.");
        router.refresh();
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3 text-small font-medium hover:bg-butter"
    >
      <Award className="size-4" aria-hidden /> Award Mentor
    </button>
  );
}
