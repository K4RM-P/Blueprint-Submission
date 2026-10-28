import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthPanel } from "@/components/auth/auth-panel";
import { IconTile } from "@/components/clay";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in or join" };

/** The single sign-in / sign-up page. `/signup` redirects here with `mode=signup`. */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; check?: string; mode?: string; invite?: string; email?: string }> }) {
  const { next, check, mode, invite, email } = await searchParams;
  const invited = invite === "1";
  return (
    <AuthLayout
      eyebrow={invited ? "You're invited" : "Sign in or join"}
      title={invited ? "Join the Relay team." : "Sign in to Relay."}
      lead={
        invited ? (
          <p>Someone at Free Geek Toronto or your organization invited you. Sign up with the email they used.</p>
        ) : (
          <p>
            Partners see their batches and impact. Staff run intake. Volunteers pick up where they left off at the bench. New businesses join free as Community Partners, and every batch is free.
          </p>
        )
      }
      aside={
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <IconTile tint="sky">
              <ShieldCheck />
            </IconTile>
            <p className="max-w-sm text-small text-ink-2">Leave the drives in. Free Geek Toronto wipes every drive and you get a numbered certificate listing each device.</p>
          </div>
          {env.demoMode ? (
            <p className="text-small text-ink-2">
              Want the full tour?{" "}
              <Link href="/demo" className="font-semibold text-loop-deep underline underline-offset-4">
                See all demo roles
              </Link>
              .
            </p>
          ) : null}
        </div>
      }
    >
      {check === "email" ? (
        <p role="status" className="mb-5 rounded-[var(--r-sm)] bg-mint px-4 py-3 text-small text-loop-deep">
          Check your inbox to confirm your email, then sign in.
        </p>
      ) : null}
      <AuthPanel mode={mode === "signup" ? "signup" : "signin"} next={next} invited={invited} email={email} demo={env.demoMode} />
    </AuthLayout>
  );
}
