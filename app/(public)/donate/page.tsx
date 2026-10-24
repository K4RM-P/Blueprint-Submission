import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { DonationChecker } from "@/components/public/donation-checker";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_ACCEPTED_ITEMS, type AcceptedItem } from "@/lib/checker";

export const metadata: Metadata = {
  title: "Can I donate this?",
  description: "Check in under a minute whether Free Geek Toronto can take your old computer, monitor, tablet or accessories — and what to bring.",
};

/** HC-01: the household checker. Rules come from staff settings (HC-02). */
export default async function DonatePage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_settings");
  const stored = (data as { accepted_items?: AcceptedItem[] } | null)?.accepted_items ?? [];
  const rules = stored.length ? stored : DEFAULT_ACCEPTED_ITEMS;
  const categories = rules.map((r) => ({ category: r.category, label: r.label }));

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:py-24">
      <div className="grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          <p className="eyebrow">Can I donate this?</p>
          <h1 className="font-display mt-4 text-[2.75rem] leading-[0.98] sm:text-display-l">Find out in four taps.</h1>
          <p className="measure mt-6 text-body-l text-ink-2">
            Tell us what you have. We&apos;ll say whether Free Geek Toronto can refurbish it, recycle it responsibly, or where else it should go.
          </p>
          <div className="mt-10 flex gap-3 border-t border-line pt-6">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-loop-deep" aria-hidden />
            <p className="text-small text-ink-2">
              You don&apos;t need to remove or destroy the hard drive. Every drive is wiped, and a staff member checks the wipe.{" "}
              <Link href="/about#security" className="font-semibold text-loop-deep underline-offset-4 hover:underline">
                Our process
              </Link>
            </p>
          </div>
          <p className="mt-4 text-small text-ink-3">We only count answers by type to plan our bench — nothing that identifies you.</p>
        </div>
        <div id="checker" className="min-w-0 scroll-mt-28 lg:col-span-7">
          <DonationChecker categories={categories} />
        </div>
      </div>
    </main>
  );
}
