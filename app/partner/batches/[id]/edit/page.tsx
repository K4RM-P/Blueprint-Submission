import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { BatchWizard } from "@/components/partner/batch-wizard";
import { getCalendar, getSettings } from "@/lib/queries/common";
import { getBatch, getPartnerContext } from "@/lib/queries/partner";
import type { PartnerTier } from "@/lib/domain";

export const metadata: Metadata = { title: "Edit batch" };

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, org } = await getPartnerContext();
  const { batch } = await getBatch(supabase, id);
  if (batch.status !== "submitted") redirect(`/partner/batches/${id}`);
  const settings = await getSettings(supabase);
  const calendar = await getCalendar(supabase, settings.weeklyCapacity);
  return (
    <>
      <PageHeader eyebrow="Edit batch" title="Update your batch." description="You can edit until our team reviews it." />
      <BatchWizard
        tier={org.tier as PartnerTier}
        calendar={calendar}
        weights={settings.weights}
        maxAgeYears={settings.maxAgeYears}
        editing={{
          id,
          values: {
            lineItems: batch.batch_line_items.map((l) => ({ category: l.category, make: l.make, model: l.model, approxYear: l.approx_year, quantity: l.quantity, condition: l.condition })),
            logistics: batch.logistics,
            preferredWeek: calendar.some((w) => w.week === batch.preferred_week) ? batch.preferred_week : (calendar.find((w) => w.status !== "full")?.week ?? ""),
            pickupAddress: batch.pickup_address ?? "",
            dataHandlingAck: true,
            notes: batch.notes ?? "",
          },
        }}
      />
    </>
  );
}
