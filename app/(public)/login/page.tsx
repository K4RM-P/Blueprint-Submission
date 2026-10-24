import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; check?: string }> }) {
  const { next, check } = await searchParams;
  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back to the loop."
      lead={<p>Partners see their batches and impact. Staff run intake. Volunteers pick up where they left off at the bench.</p>}
      aside={
        env.demoMode ? (
          <p className="text-ink-2">
            Judging or just curious?{" "}
            <Link href="/demo" className="font-semibold text-loop-deep underline underline-offset-4">
              Explore with a demo account
            </Link>
            .
          </p>
        ) : null
      }
    >
      {check === "email" ? (
        <p role="status" className="mb-5 rounded-[var(--r-sm)] bg-mint px-4 py-3 text-small text-loop-deep">
          Check your inbox to confirm your email, then sign in.
        </p>
      ) : null}
      <SignInForm next={next} />
      <p className="mt-6 text-small text-ink-2">
        New business partner?{" "}
        <Link href="/signup" className="font-semibold text-loop-deep underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
