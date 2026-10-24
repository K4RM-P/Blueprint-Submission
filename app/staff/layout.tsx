import { AppShell } from "@/components/shell/app-shell";
import { requireRole } from "@/lib/auth";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireRole("staff");
  void supabase;
  return (
    <AppShell role="staff" userName={profile.full_name ?? "Account"} orgName={null}>
      {children}
    </AppShell>
  );
}
