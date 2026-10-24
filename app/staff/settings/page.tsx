import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { SettingsForm } from "@/components/staff/settings-form";
import { requireRole } from "@/lib/auth";
import { getFactors, getSettings } from "@/lib/queries/common";

export const metadata: Metadata = { title: "Settings" };

export default async function StaffSettings() {
  const { supabase } = await requireRole("staff");
  const [s, factors] = await Promise.all([getSettings(supabase), getFactors(supabase)]);
  return (
    <>
      <PageHeader eyebrow="Staff Console" title="Settings" description="Capacity, score weights, impact factors, price transparency and household rules." />
      <SettingsForm
        initial={{
          weeklyCapacity: s.weeklyCapacity,
          refurbUniform: s.refurbMinutes.uniform,
          refurbMixed: s.refurbMinutes.mixed,
          maxAgeYears: s.maxAgeYears,
          weights: s.weights,
          breakdown: s.priceBreakdown,
          breakdownConfirmed: s.priceBreakdownConfirmed,
          acceptedItems: s.acceptedItems,
          factors,
        }}
      />
    </>
  );
}
