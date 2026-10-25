import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DemoCards } from "@/components/auth/demo-cards";
import { PassportQrImage } from "@/components/journey/passport-qr";
import { SHOWCASE_PASSPORTS } from "@/lib/showcase-passports";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Demo", description: "Explore Relay as a partner, staff member or volunteer — no sign-up needed." };

/** One-click demo role switcher (AUTH-06). Only exists in demo mode. */
export default function DemoPage() {
  if (!env.demoMode) notFound();
  const password = process.env.DEMO_PASSWORD;
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-20">
      <div className="max-w-2xl">
        <h1 className="font-display text-[2.5rem] leading-[1.02] sm:text-[3.5rem]">Try Relay.</h1>
        <p className="mt-4 text-body-l text-ink-2">Choose a role to sign in. No account needed — all data here is fictional, so click anything.</p>
      </div>
      <div className="mt-10">
        <DemoCards />
      </div>
      <section aria-labelledby="scan" className="mt-16">
        <h2 id="scan" className="font-display text-[2rem] leading-tight">
          Or open a device passport.
        </h2>
        <p className="mt-2 max-w-2xl text-ink-2">Every refurbished laptop carries a QR code. Scan one with your phone, or click to see its story.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHOWCASE_PASSPORTS.map((p) => (
            <li key={p.code}>
              <Link href={`/p/${p.code}`} className="flat lift flex h-full items-start gap-4 p-4">
                <PassportQrImage code={p.code} size={88} className="shrink-0 border border-line" />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold text-ink">{p.label}</span>
                  <span className="text-small text-ink-2">{p.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <details className="mt-10 max-w-2xl text-small text-ink-2">
        <summary className="cursor-pointer font-medium text-ink">Sign in with email instead</summary>
        <div className="flat mt-3 p-5">
          <p>All demo accounts share one password:</p>
          <p className="mt-2 font-mono text-ink">{password ?? "(not configured)"}</p>
          <ul className="mt-3 space-y-1 font-mono text-[0.8125rem]">
            <li>demo-partner@geekloop.test</li>
            <li>demo-staff@geekloop.test</li>
            <li>demo-volunteer@geekloop.test</li>
          </ul>
        </div>
      </details>
    </main>
  );
}
