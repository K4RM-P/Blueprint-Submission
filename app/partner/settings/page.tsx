import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { ColleagueInvite, OrgSettingsForm } from "@/components/partner/org-settings-form";
import { getPartnerContext } from "@/lib/queries/partner";
import { logoUrl } from "@/lib/queries/common";
import { EMPLOYEE_RANGES } from "@/lib/domain";

export const metadata: Metadata = { title: "Organization settings" };

export default async function PartnerSettingsPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { supabase, org } = await getPartnerContext();
  const { data: invites } = await supabase.from("account_invites").select("email, full_name, used_at").eq("organization_id", org.id).order("created_at");
  const range = (EMPLOYEE_RANGES as readonly string[]).includes(org.employee_range ?? "") ? (org.employee_range as (typeof EMPLOYEE_RANGES)[number]) : "";
  return (
    <>
      <PageHeader
        eyebrow={welcome ? "Welcome to GeekLoop" : "Settings"}
        title={welcome ? `Let's set up ${org.name}.` : "Organization settings"}
        description={welcome ? "A few details for your certificates, then you're ready to send your first batch." : "Your profile, logo and how you're recognized in public."}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <OrgSettingsForm
          welcome={welcome === "1"}
          logoUrl={logoUrl(org.logo_path)}
          initial={{
            name: org.name,
            industry: org.industry ?? "",
            employeeRange: range,
            website: org.website ?? "",
            contactEmail: org.contact_email ?? "",
            contactPhone: org.contact_phone ?? "",
            wallOptIn: org.wall_opt_in,
            passportAttributionOptIn: org.passport_attribution_opt_in,
          }}
        />
        <div>
          <ColleagueInvite invites={invites ?? []} />
        </div>
      </div>
    </>
  );
}
