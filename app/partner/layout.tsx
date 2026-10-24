import { AppShell } from "@/components/shell/app-shell";
import { requireRole } from "@/lib/auth";

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireRole("partner");
  const { data: org } = profile.organization_id ? await supabase.from("organizations").select("name").eq("id", profile.organization_id).maybeSingle() : { data: null };
  return (
    <AppShell role="partner" userName={profile.full_name ?? "Account"} orgName={org?.name}>
      {children}
    </AppShell>
  );
}
