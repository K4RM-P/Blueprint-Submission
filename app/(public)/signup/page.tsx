import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { IconTile } from "@/components/clay";

export const metadata: Metadata = { title: "Become a Reuse Partner" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ invite?: string; email?: string }> }) {
  const { invite, email } = await searchParams;
  const invited = invite === "1";
  return (
    <AuthLayout
      eyebrow={invited ? "You're invited" : "Reuse Partner sign-up"}
      title={invited ? "Join the GeekLoop team." : "Your first batch is free."}
      lead={
        invited ? (
          <p>Someone at Free Geek Toronto or your organization invited you. Sign up with the email they used.</p>
        ) : (
          <p>
            Community Partner is free forever: submit batches, schedule a drop-off and get a data-wipe certificate for every one. Upgrade later if you want an ESG dashboard and reports.
          </p>
        )
      }
      aside={
        !invited ? (
          <div className="flex items-start gap-4">
            <IconTile tint="sky">
              <ShieldCheck />
            </IconTile>
            <p className="max-w-sm text-small text-ink-2">Leave the drives in. Free Geek Toronto wipes every drive and you get a numbered certificate listing each device.</p>
          </div>
        ) : null
      }
    >
      <SignUpForm invited={invited} email={email} />
      <p className="mt-6 text-small text-ink-2">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-loop-deep underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
