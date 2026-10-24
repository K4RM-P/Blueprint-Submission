import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoCards } from "@/components/auth/demo-cards";
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
        <h1 className="font-display mt-3 text-[2.5rem] leading-[1.02] sm:text-[3.5rem]">Step into the loop.</h1>
        <p className="mt-4 text-body-l text-ink-2">Pick a role. Everything here is fictional seed data, so click anything — you can&apos;t break it.</p>
      </div>
      <div className="mt-10">
        <DemoCards />
      </div>
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
