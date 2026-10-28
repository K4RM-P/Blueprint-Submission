"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { ClayButton, Field, Input } from "@/components/clay";
import { inviteSignUpSchema, signUpSchema } from "@/lib/validation/auth";
import { signUpInvited, signUpPartner } from "@/server/actions/auth";

type PartnerValues = z.input<typeof signUpSchema>;

/** Partner self-signup (AUTH-03) or invited signup (AUTH-04) when `invited`. */
export function SignUpForm({ invited, email }: { invited?: boolean; email?: string }) {
  const router = useRouter();
  const schema = invited ? inviteSignUpSchema.extend({ organizationName: signUpSchema.shape.organizationName.optional() }) : signUpSchema;
  const { register, handleSubmit, formState, setError } = useForm<PartnerValues>({
    resolver: zodResolver(schema as typeof signUpSchema),
    defaultValues: { fullName: "", organizationName: "", email: email ?? "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = invited ? await signUpInvited(values) : await signUpPartner(values);
    if (!res.ok) {
      if (res.fieldErrors) for (const [k, v] of Object.entries(res.fieldErrors)) setError(k as keyof PartnerValues, { message: v });
      else setError("email", { message: res.error });
      return;
    }
    toast.success(res.message ?? (invited ? "Welcome to Relay." : "Welcome, Reuse Partner. Let's send your first batch."));
    router.replace(res.data.redirectTo);
    router.refresh();
  });

  const e = formState.errors;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Your name" error={e.fullName?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" aria-describedby={describedBy} aria-invalid={invalid} {...register("fullName")} />}
      </Field>
      {!invited ? (
        <Field label="Organization name" hint="Shown on your certificates." error={e.organizationName?.message}>
          {({ id, describedBy, invalid }) => <Input id={id} autoComplete="organization" aria-describedby={describedBy} aria-invalid={invalid} {...register("organizationName")} />}
        </Field>
      ) : null}
      <Field label="Work email" hint={invited ? "Use the email your invite was sent to." : undefined} error={e.email?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
      </Field>
      <Field label="Password" hint="At least 10 characters." error={e.password?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="password" autoComplete="new-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("password")} />}
      </Field>
      <ClayButton type="submit" variant="primary" loading={formState.isSubmitting} className="self-start">
        {invited ? "Create my account" : "Create partner account"}
      </ClayButton>
    </form>
  );
}
