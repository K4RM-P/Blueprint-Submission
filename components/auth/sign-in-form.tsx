"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ClayButton, Field, Input } from "@/components/clay";
import { signInSchema } from "@/lib/validation/auth";
import { signIn } from "@/server/actions/auth";

type Values = z.input<typeof signInSchema>;

export function SignInForm({ next }: { next?: string }) {
  const router = useRouter();
  const { register, handleSubmit, formState, setError } = useForm<Values>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "", next } });

  const onSubmit = handleSubmit(async (values) => {
    const res = await signIn(values);
    if (!res.ok) {
      setError("password", { message: res.error });
      return;
    }
    router.replace(res.data.redirectTo);
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Email" error={formState.errors.email?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
      </Field>
      <Field label="Password" error={formState.errors.password?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="password" autoComplete="current-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("password")} />}
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ClayButton type="submit" variant="primary" loading={formState.isSubmitting}>
          Sign in
        </ClayButton>
        <Link href="/forgot-password" className="text-small font-medium text-loop-deep underline-offset-4 hover:underline">
          Forgot your password?
        </Link>
      </div>
    </form>
  );
}
