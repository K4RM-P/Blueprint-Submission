"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUp, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { ClayButton, ClayCard, ClayToggle, Field, FlatCard, Input, Select } from "@/components/clay";
import { EMPLOYEE_RANGES } from "@/lib/domain";
import { colleagueSchema, organizationSchema, type OrganizationInput } from "@/lib/validation/organization";
import { inviteColleague, saveOrganization, uploadLogo } from "@/server/actions/partner";

export function OrgSettingsForm({ initial, logoUrl, welcome }: { initial: OrganizationInput; logoUrl: string | null; welcome: boolean }) {
  const router = useRouter();
  const { register, handleSubmit, control, formState, setError } = useForm<z.input<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: initial,
  });
  const onSubmit = handleSubmit(async (v) => {
    const res = await saveOrganization(v);
    if (!res.ok) {
      toast.error(res.error);
      for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof OrganizationInput, { message: m });
      return;
    }
    toast.success(res.message ?? "Saved.");
    router.refresh();
    if (welcome) router.push("/partner/batches/new");
  });
  const e = formState.errors;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <FlatCard className="grid gap-5 sm:grid-cols-2">
        <h2 className="text-title font-semibold sm:col-span-2">Organization profile</h2>
        <Field label="Organization name" required error={e.name?.message} className="sm:col-span-2">
          {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...register("name")} />}
        </Field>
        <Field label="Industry" error={e.industry?.message}>
          {({ id }) => <Input id={id} placeholder="Accounting" {...register("industry")} />}
        </Field>
        <Field label="Number of employees" error={e.employeeRange?.message}>
          {({ id }) => (
            <Select id={id} {...register("employeeRange")}>
              <option value="">Choose a range</option>
              {EMPLOYEE_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Website" error={e.website?.message} className="sm:col-span-2">
          {({ id, describedBy, invalid }) => <Input id={id} type="url" placeholder="https://" aria-describedby={describedBy} aria-invalid={invalid} {...register("website")} />}
        </Field>
        <Field label="Contact email" error={e.contactEmail?.message}>
          {({ id, describedBy, invalid }) => <Input id={id} type="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("contactEmail")} />}
        </Field>
        <Field label="Contact phone" error={e.contactPhone?.message}>
          {({ id, describedBy, invalid }) => <Input id={id} type="tel" autoComplete="tel" aria-describedby={describedBy} aria-invalid={invalid} {...register("contactPhone")} />}
        </Field>
      </FlatCard>

      <ClayCard className="flex flex-col gap-6">
        <div>
          <h2 className="text-title font-semibold">Public recognition</h2>
          <p className="mt-1 text-ink-2">Both start off. You can change them any time.</p>
        </div>
        <Controller
          control={control}
          name="wallOptIn"
          render={({ field }) => (
            <ClayToggle checked={field.value} onCheckedChange={field.onChange} label="Show us on the Partner Wall" description="Your name, logo and devices back in use appear on the public /partners page once Free Geek Toronto has received your first batch." />
          )}
        />
        <Controller
          control={control}
          name="passportAttributionOptIn"
          render={({ field }) => (
            <ClayToggle
              checked={field.value}
              onCheckedChange={field.onChange}
              label="Name us on Device Passports"
              description={'Buyers see "Donated by your organization" instead of "a Toronto business".'}
            />
          )}
        />
      </ClayCard>

      <div>
        <ClayButton type="submit" variant="primary" loading={formState.isSubmitting}>
          {welcome ? "Save and start a batch" : "Save profile"}
        </ClayButton>
      </div>
      <LogoUploader logoUrl={logoUrl} />
    </form>
  );
}

function LogoUploader({ logoUrl }: { logoUrl: string | null }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(logoUrl);
  const onChange = async (file: File | undefined) => {
    if (!file) return;
    const fd = new FormData();
    fd.set("logo", file);
    setBusy(true);
    const res = await uploadLogo(fd);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setPreview(URL.createObjectURL(file));
    toast.success(res.message ?? "Logo updated.");
    router.refresh();
  };
  return (
    <FlatCard className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-[var(--r-md)] border border-line bg-white">
        {preview ? <Image src={preview} alt="Your organization's logo" width={96} height={96} className="size-full object-contain p-2" unoptimized /> : <ImageUp className="size-8 text-ink-3" aria-hidden />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">Logo</h2>
        <p className="text-small text-ink-2">PNG, JPG or WebP, up to 1 MB. Used on your Partner Wall tile, reports and LinkedIn card.</p>
      </div>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label="Upload a logo" onChange={(ev) => onChange(ev.target.files?.[0])} />
      <ClayButton type="button" variant="secondary" size="sm" loading={busy} icon={<ImageUp />} onClick={() => input.current?.click()}>
        {preview ? "Replace logo" : "Upload logo"}
      </ClayButton>
    </FlatCard>
  );
}

export function ColleagueInvite({ invites }: { invites: { email: string; full_name: string | null; used_at: string | null }[] }) {
  const router = useRouter();
  const [link, setLink] = useState<string | null>(null);
  const { register, handleSubmit, formState, reset, setError } = useForm<z.input<typeof colleagueSchema>>({ resolver: zodResolver(colleagueSchema), defaultValues: { fullName: "", email: "" } });
  const onSubmit = handleSubmit(async (v) => {
    const res = await inviteColleague(v);
    if (!res.ok) return setError("email", { message: res.error });
    toast.success(res.message ?? "Invite created.");
    setLink(`${window.location.origin}${res.data.link}`);
    reset();
    router.refresh();
  });
  return (
    <FlatCard className="flex flex-col gap-5">
      <div>
        <h2 className="text-title font-semibold">Colleagues</h2>
        <p className="mt-1 text-ink-2">Invite a colleague to see batches and certificates. Share the sign-up link with them.</p>
      </div>
      <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Name" error={formState.errors.fullName?.message}>
          {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} {...register("fullName")} />}
        </Field>
        <Field label="Email" error={formState.errors.email?.message}>
          {({ id, describedBy, invalid }) => <Input id={id} type="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
        </Field>
        <ClayButton type="submit" variant="secondary" icon={<UserPlus />} loading={formState.isSubmitting}>
          Invite
        </ClayButton>
      </form>
      {link ? (
        <p className="rounded-[var(--r-sm)] bg-mint p-3 text-small text-loop-deep" role="status">
          Send this link: <span className="break-all font-mono">{link}</span>
        </p>
      ) : null}
      {invites.length > 0 ? (
        <ul className="divide-y divide-line text-small">
          {invites.map((i) => (
            <li key={i.email} className="flex justify-between gap-3 py-2.5">
              <span>
                {i.full_name} <span className="text-ink-2">· {i.email}</span>
              </span>
              <span className="text-ink-2">{i.used_at ? "Joined" : "Invited"}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </FlatCard>
  );
}
