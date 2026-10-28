import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { EmptyState } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { BatchChecklist } from "@/components/volunteer/batch-checklist";
import { requireRole } from "@/lib/auth";
import { stepsDone } from "@/lib/queries/volunteer";

export const metadata: Metadata = { title: "Work as a set" };

const Search = z.object({ make: z.string().trim().min(1).max(60).catch(""), model: z.string().trim().min(1).max(80).catch("") });

/** VW-02 for uniform batches: every identical device on your bench, one checklist. */
export default async function VolunteerSetPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = Search.parse(await searchParams);
  const { supabase, profile } = await requireRole("volunteer");
  // RLS: volunteers only ever read devices assigned to them.
  const { data } = q.make && q.model
    ? await supabase
        .from("devices")
        .select("id, passport_code, make, model, source")
        .eq("assigned_volunteer_id", profile.id)
        .eq("make", q.make)
        .eq("model", q.model)
        .not("status", "in", "(sold,recycled,listed,ready)")
        .order("passport_code")
    : { data: [] };
  const list = data ?? [];
  const done = await stepsDone(supabase, list.map((d) => d.id));
  const devices = list.map((d) => ({ id: d.id, passport_code: d.passport_code, done: [...(done.get(d.id) ?? [])] }));
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-4 text-small">
        <Link href="/volunteer" className="font-medium text-loop-deep underline-offset-4 hover:underline">
          ← My Bench
        </Link>
      </p>
      <PageHeader
        eyebrow="Work as a set"
        title={q.make && q.model ? `${devices.length} × ${q.make} ${q.model}` : "Work as a set"}
        description="Identical laptops from the same batch, one checklist. Each laptop still gets its own record and its own Device Passport stamp."
      />
      {devices.length === 0 ? (
        <EmptyState title="No matching devices on your bench." tone="butter" art="baton">
          <Link href="/volunteer" className="font-semibold text-loop-deep underline underline-offset-4">
            Back to My Bench
          </Link>{" "}
          to claim devices.
        </EmptyState>
      ) : (
        <BatchChecklist devices={devices} />
      )}
    </div>
  );
}
