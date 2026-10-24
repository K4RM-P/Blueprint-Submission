import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homeForRole, type Role } from "@/lib/roles";
import { ActionError } from "@/lib/action";
import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;

/** Signed-in user + profile for this request (deduplicated with React cache). */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;
  return { supabase, user, profile };
});

/** For pages and layouts: redirect when signed out or the wrong role (AUTH-05). */
export async function requireRole(role: Role) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.profile.role !== role) redirect(homeForRole(s.profile.role));
  return s;
}

/** For server actions: throw a friendly error instead of redirecting. */
export async function assertRole(...roles: Role[]) {
  const s = await getSession();
  if (!s) throw new ActionError("Please sign in again.");
  if (!roles.includes(s.profile.role)) throw new ActionError("You don't have permission to do that.");
  return s;
}

/** Cheap "is anyone signed in?" check for public pages (verifies the JWT locally when possible). */
export async function hasSession(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return Boolean(data?.claims?.sub);
}
