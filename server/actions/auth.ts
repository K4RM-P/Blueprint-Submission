"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fail, ok, runAction, type ActionResult } from "@/lib/action";
import { rateLimit } from "@/lib/rate-limit";
import { homeForRole, requiredRoleForPath, type Role } from "@/lib/roles";
import { env } from "@/lib/env";
import { demoRoleSchema, inviteSignUpSchema, newPasswordSchema, resetRequestSchema, safeNext, signInSchema, signUpSchema } from "@/lib/validation/auth";

const DEMO_EMAILS: Record<Role, string> = {
  partner: "demo-partner@geekloop.test",
  staff: "demo-staff@geekloop.test",
  volunteer: "demo-volunteer@geekloop.test",
};

async function landingFor(next: string | null): Promise<string> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.user?.id ?? "").maybeSingle();
  const role = (profile?.role ?? "partner") as Role;
  if (next && (requiredRoleForPath(next) === null || requiredRoleForPath(next) === role)) return next;
  return homeForRole(role);
}

export async function signIn(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction(signInSchema, input, async ({ email, password, next }) => {
    if (!(await rateLimit("signin", 10))) return fail("Too many attempts. Wait a minute and try again.");
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return fail("That email and password don't match.");
    return ok({ redirectTo: await landingFor(safeNext(next)) });
  });
}

/** Partner self-signup (AUTH-03): the database trigger creates the organization and links the owner. */
export async function signUpPartner(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction(signUpSchema, input, async ({ fullName, organizationName, email, password }) => {
    if (!(await rateLimit("signup", 5))) return fail("Too many sign-ups from this network. Try again in a minute.");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, organization_name: organizationName }, emailRedirectTo: `${env.siteUrl}/partner/settings?welcome=1` },
    });
    if (error) return fail(/registered|exists/i.test(error.message) ? "An account with that email already exists. Try signing in." : error.message);
    if (!data.session) return ok({ redirectTo: "/login?check=email" }, "Check your email to confirm your account.");
    return ok({ redirectTo: await landingFor("/partner/settings?welcome=1") });
  });
}

/** Invited accounts (AUTH-04): role and organization come from the staff/partner invite. */
export async function signUpInvited(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction(inviteSignUpSchema, input, async ({ fullName, email, password }) => {
    if (!(await rateLimit("signup", 5))) return fail("Too many sign-ups from this network. Try again in a minute.");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) return fail(/registered|exists/i.test(error.message) ? "An account with that email already exists. Try signing in." : error.message);
    if (!data.session) return ok({ redirectTo: "/login?check=email" });
    return ok({ redirectTo: await landingFor(null) });
  });
}

/** One-click demo sign-in (AUTH-06). Only works when NEXT_PUBLIC_DEMO_MODE=true. */
export async function demoSignIn(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction(demoRoleSchema, input, async (role) => {
    if (!env.demoMode) return fail("Demo mode is turned off.");
    const password = process.env.DEMO_PASSWORD;
    if (!password) return fail("Demo accounts aren't configured on this server.");
    const supabase = await createClient();
    // Local scope: demo accounts are shared, so never revoke other people's sessions.
    await supabase.auth.signOut({ scope: "local" });
    const { error } = await supabase.auth.signInWithPassword({ email: DEMO_EMAILS[role], password });
    if (error) return fail("The demo account isn't available. Run `pnpm seed` and try again.");
    return ok({ redirectTo: homeForRole(role) });
  });
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}

/** AUTH-07 (P1): email a reset link. Always answers the same way so emails can't be enumerated. */
export async function requestPasswordReset(input: unknown): Promise<ActionResult<null>> {
  return runAction(resetRequestSchema, input, async ({ email }) => {
    if (!(await rateLimit("reset", 3))) return fail("Too many requests. Try again in a minute.");
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${env.siteUrl}/auth/callback?next=/reset-password` });
    return ok(null, "If that email has an account, a reset link is on its way.");
  });
}

export async function updatePassword(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction(newPasswordSchema, input, async ({ password }) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return fail("Your reset link has expired. Request a new one.");
    return ok({ redirectTo: await landingFor(null) }, "Password updated.");
  });
}
