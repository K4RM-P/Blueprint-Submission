"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { ClayButton, Field, Input } from "@/components/clay";
import { newPasswordSchema, resetRequestSchema } from "@/lib/validation/auth";
import { requestPasswordReset, updatePassword } from "@/server/actions/auth";

export function ForgotPasswordForm() {
  const { register, handleSubmit, formState, setError, reset } = useForm<z.input<typeof resetRequestSchema>>({ resolver: zodResolver(resetRequestSchema), defaultValues: { email: "" } });
  const onSubmit = handleSubmit(async (v) => {
    const res = await requestPasswordReset(v);
    if (!res.ok) return setError("email", { message: res.error });
    toast.success(res.message ?? "Check your email.");
    reset();
  });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Email" error={formState.errors.email?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
      </Field>
      <ClayButton type="submit" variant="primary" loading={formState.isSubmitting} className="self-start">
        Email me a reset link
      </ClayButton>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const { register, handleSubmit, formState, setError } = useForm<z.input<typeof newPasswordSchema>>({ resolver: zodResolver(newPasswordSchema), defaultValues: { password: "" } });
  const onSubmit = handleSubmit(async (v) => {
    const res = await updatePassword(v);
    if (!res.ok) return setError("password", { message: res.error });
    toast.success("Password updated.");
    router.replace(res.data.redirectTo);
  });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="New password" hint="At least 10 characters." error={formState.errors.password?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="password" autoComplete="new-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("password")} />}
      </Field>
      <ClayButton type="submit" variant="primary" loading={formState.isSubmitting} className="self-start">
        Save new password
      </ClayButton>
    </form>
  );
}
