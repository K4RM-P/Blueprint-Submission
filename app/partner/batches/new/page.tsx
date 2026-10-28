import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { BatchWizard } from "@/components/partner/batch-wizard";
import { getCalendar, getSettings } from "@/lib/queries/common";
import { getPartnerContext } from "@/lib/queries/partner";
import type { PartnerTier } from "@/lib/domain";
import Link from "next/link";

export const metadata: Metadata = { title: "Donate a batch" };

export default async function NewBatchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const welcome = (await searchParams).welcome === "1";
  const { supabase, org } = await getPartnerContext();
  const settings = await getSettings(supabase);
  const calendar = await getCalendar(supabase, settings.weeklyCapacity);
  return (
    <>
      <PageHeader
        title={welcome ? `Welcome, ${org.name}. Your first batch:` : "Donate a batch"}
        description="Tell us what you’re sending and when. It takes about a minute."
      />
      {welcome ? (
        <p className="-mt-4 mb-6 text-small text-ink-2">
          Logo, website and Partner Wall recognition are optional. Add them any time in{" "}
          <Link href="/partner/settings" className="font-medium text-loop-deep underline underline-offset-4">
            Settings
          </Link>
          .
        </p>
      ) : null}
      <BatchWizard tier={org.tier as PartnerTier} calendar={calendar} weights={settings.weights} maxAgeYears={settings.maxAgeYears} />
    </>
  );
}
