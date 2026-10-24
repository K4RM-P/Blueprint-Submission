import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { homeForRole } from "@/lib/roles";

/** Sends a signed-in person to their own home dashboard. */
export default async function DashboardRedirect() {
  const s = await getSession();
  redirect(s ? homeForRole(s.profile.role) : "/login");
}
