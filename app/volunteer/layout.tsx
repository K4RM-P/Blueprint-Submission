import { AppShell } from "@/components/shell/app-shell";
import { requireRole } from "@/lib/auth";

export default async function VolunteerLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireRole("volunteer");
  void supabase;
  return (
    <AppShell role="volunteer" userName={profile.full_name ?? "Account"} orgName={null}>
      {children}
    </AppShell>
  );
}
