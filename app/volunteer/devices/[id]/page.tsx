import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PassportQrCard } from "@/components/journey/passport-qr";
import { DeviceStatusChip } from "@/components/journey/status";
import { PageHeader } from "@/components/shell/page-header";
import { Checklist } from "@/components/volunteer/checklist";
import { requireRole } from "@/lib/auth";
import { stepsDone } from "@/lib/queries/volunteer";

export const metadata: Metadata = { title: "Checklist" };

export default async function VolunteerDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireRole("volunteer");
  // RLS: volunteers can only read devices assigned to them.
  const { data: d } = await supabase.from("devices").select("id, passport_code, make, model, status, cpu, ram_gb, storage_gb, approx_year").eq("id", id).eq("assigned_volunteer_id", profile.id).maybeSingle();
  if (!d) notFound();
  const done = await stepsDone(supabase, [d.id]);
  const specs = [d.approx_year, d.cpu, d.ram_gb ? `${d.ram_gb} GB RAM` : null, d.storage_gb ? `${d.storage_gb} GB` : null].filter(Boolean).join(" · ");
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-4 text-small">
        <Link href="/volunteer" className="font-medium text-loop-deep underline-offset-4 hover:underline">
          ← My Bench
        </Link>
      </p>
      <PageHeader eyebrow={d.passport_code} title={`${d.make} ${d.model}`} description={specs || "Specs are added at intake."} actions={<DeviceStatusChip status={d.status} />} />
      <Checklist deviceId={d.id} initialDone={[...(done.get(d.id) ?? [])]} status={d.status} />
      <PassportQrCard code={d.passport_code} title="This laptop's passport" className="mt-6" />
    </div>
  );
}
