import { PageHeader } from "@/components/shell/page-header";
import { requireRole } from "@/lib/auth";

export default async function PartnerDashboard() {
  const { profile } = await requireRole("partner");
  return <PageHeader eyebrow="Partner Portal" title={`Welcome back, ${profile.display_first_name ?? "partner"}.`} description="Your batches, certificates and impact live here." />;
}
