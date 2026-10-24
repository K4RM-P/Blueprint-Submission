import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { BatchWizard } from "@/components/partner/batch-wizard";
import { getCalendar, getSettings } from "@/lib/queries/common";
import { getPartnerContext } from "@/lib/queries/partner";
import type { PartnerTier } from "@/lib/domain";

export const metadata: Metadata = { title: "New batch" };

export default async function NewBatchPage() {
  const { supabase, org } = await getPartnerContext();
  const settings = await getSettings(supabase);
  const calendar = await getCalendar(supabase, settings.weeklyCapacity);
  return (
    <>
      <PageHeader eyebrow="New batch" title="Send us your retired devices." description="Four short steps. Your score updates as you go — it helps our team schedule your batch." />
      <BatchWizard tier={org.tier as PartnerTier} calendar={calendar} weights={settings.weights} maxAgeYears={settings.maxAgeYears} />
    </>
  );
}
