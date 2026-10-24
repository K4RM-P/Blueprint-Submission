import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/password-forms";

export const metadata: Metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <AuthLayout eyebrow="Password reset" title="Locked out? It happens." lead={<p>Enter your email and we&apos;ll send a link to choose a new password.</p>}>
      {expired ? <p role="status" className="mb-5 rounded-[var(--r-sm)] bg-apricot px-4 py-3 text-small text-ember-ink">That link expired. Request a new one below.</p> : null}
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
