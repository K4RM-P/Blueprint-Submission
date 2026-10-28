import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DemoCards } from "@/components/auth/demo-cards";
import { PassportQrImage } from "@/components/journey/passport-qr";
import { SHOWCASE_PASSPORTS } from "@/lib/showcase-passports";
import { env } from "@/lib/env";
import { ResetDemoButton } from "@/components/auth/reset-demo-button";

export const metadata: Metadata = { title: "Demo", description: "Explore Relay as a Reuse Partner, open a Device Passport, or look behind the scenes as staff or a volunteer — no sign-up needed." };

/** One-click demo role switcher (AUTH-06). Only exists in demo mode. */
export default function DemoPage() {
  if (!env.demoMode) notFound();
  const password = process.env.DEMO_PASSWORD;
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6 md:py-20">
      <div className="max-w-2xl">
        <h1 className="font-display text-[2.5rem] leading-[1.02] sm:text-[3.5rem]">Try Relay.</h1>
        <p className="mt-4 text-body-l text-ink-2">
          A Toronto business donates laptops, and each one gets a Device Passport. Start as the partner, then scan a passport. No account needed; all data here is fictional.
        </p>
      </div>

      <section aria-labelledby="core" className="mt-10 grid gap-5 lg:grid-cols-12">
        <h2 id="core" className="sr-only">
          The core: Reuse Partner and Device Passport
        </h2>
        <div className="lg:col-span-5">
          <p className="eyebrow mb-3">1 · The Reuse Partner</p>
          <DemoCards roles={["partner"]} className="grid h-[calc(100%-2rem)] gap-5" />
        </div>
        <div className="flex flex-col lg:col-span-7">
          <p className="eyebrow mb-3">2 · Scan a Device Passport</p>
          <div className="flat flex flex-1 flex-col gap-5 p-5 sm:p-6">
            <p className="text-ink-2">Every refurbished laptop carries a QR label. Scan one with your phone, or click to see its story, from the business that donated it to who it helps now.</p>
            <ul className="grid gap-3 sm:grid-cols-2">
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
          </div>
        </div>
      </section>

      <section aria-labelledby="behind" className="mt-14">
        <h2 id="behind" className="font-display text-[2rem] leading-tight">
          Behind the scenes.
        </h2>
        <p className="mt-2 max-w-2xl text-ink-2">How a small Free Geek Toronto team and its volunteers keep partner batches moving.</p>
        <DemoCards roles={["staff", "volunteer"]} className="mt-6 grid gap-5 md:grid-cols-2" />
      </section>

      <div className="mt-10 flex max-w-2xl flex-wrap items-center gap-3 text-small text-ink-2">
        <ResetDemoButton />
        <span>Shared demo? This puts fresh work in the staff queue and on the volunteer bench. Showcase passports never change.</span>
      </div>

      <details className="mt-6 max-w-2xl text-small text-ink-2">
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
