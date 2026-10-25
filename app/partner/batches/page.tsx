import type { Metadata } from "next";
import { PackagePlus } from "lucide-react";
import { ClayButton, EmptyState, FlatCard } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { BatchCard } from "@/components/partner/batch-card";
import { getPartnerContext, listBatches } from "@/lib/queries/partner";

export const metadata: Metadata = { title: "Batches" };

export default async function BatchesPage() {
  const { supabase, org } = await getPartnerContext();
  const batches = await listBatches(supabase, org.id);
  return (
    <>
      <PageHeader
        title="Batches"
        description="Every batch you've sent, and how far along it is."
        actions={
          <ClayButton href="/partner/batches/new" variant="primary" icon={<PackagePlus />}>
            Donate a batch
          </ClayButton>
        }
      />
      {batches.length === 0 ? (
        <FlatCard>
          <EmptyState title="No batches yet." tone="apricot" action={<ClayButton href="/partner/batches/new" variant="secondary" size="sm">Start your first batch</ClayButton>}>
            Your first 5 laptops could reach a classroom next month.
          </EmptyState>
        </FlatCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {batches.map((b) => (
            <li key={b.id}>
              <BatchCard batch={b} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
