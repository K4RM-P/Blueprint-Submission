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
        <p className="eyebrow">Demo environment</p>
        <h1 className="font-display mt-3 text-[2.5rem] leading-[1.02] sm:text-[3.5rem]">Pick up the baton.</h1>
        <p className="mt-4 text-body-l text-ink-2">Pick a role and run one leg of the relay. Everything here is fictional seed data, so click anything — you can&apos;t break it.</p>
      </div>
      <div className="mt-10">
        <DemoCards />
      </div>
      <section aria-labelledby="scan" className="mt-16">
        <p className="eyebrow">Relay Wrapped</p>
        <h2 id="scan" className="font-display mt-2 text-[2rem] leading-tight">
          Scan a passport.
        </h2>
        <p className="mt-2 max-w-2xl text-ink-2">Every laptop&apos;s QR opens its story. Point a phone camera at a code, or open one here.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SHOWCASE_PASSPORTS.map((p) => (
            <li key={p.code}>
              <Link href={`/p/${p.code}`} className="flat lift flex h-full flex-col gap-4 p-5">
                <PassportQrImage code={p.code} size={120} className="border border-line" />
                <span className="font-mono text-[0.9375rem] tracking-wide text-ink">{p.code}</span>
                <span className="font-semibold text-ink">{p.label}</span>
                <span className="text-small text-ink-2">{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <details className="mt-10 max-w-2xl text-small text-ink-2">
        <summary className="cursor-pointer font-medium text-ink">Prefer to sign in by hand?</summary>
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
