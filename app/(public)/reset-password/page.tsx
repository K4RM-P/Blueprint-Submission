import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/password-forms";
import { hasSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  if (!(await hasSession())) redirect("/forgot-password?expired=1");
  return (
    <AuthLayout eyebrow="Password reset" title="Choose a new password." lead={<p>Pick something long and memorable — a short sentence works well.</p>}>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
