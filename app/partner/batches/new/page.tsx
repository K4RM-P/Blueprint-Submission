import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { BatchWizard } from "@/components/partner/batch-wizard";
import { getCalendar, getSettings } from "@/lib/queries/common";
import { getPartnerContext } from "@/lib/queries/partner";
import type { PartnerTier } from "@/lib/domain";

export const metadata: Metadata = { title: "Donate a batch" };

export default async function NewBatchPage() {
  const { supabase, org } = await getPartnerContext();
  const settings = await getSettings(supabase);
  const calendar = await getCalendar(supabase, settings.weeklyCapacity);
  return (
    <>
      <PageHeader title="Donate a batch" description="Tell us what you’re sending and when. It takes about two minutes." />
      <BatchWizard tier={org.tier as PartnerTier} calendar={calendar} weights={settings.weights} maxAgeYears={settings.maxAgeYears} />
    </>
  );
}
