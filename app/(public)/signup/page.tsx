import { redirect } from "next/navigation";

/** Sign-up lives on the one auth page; keep `/signup` (and invite links) working. */
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ invite?: string; email?: string }> }) {
  const { invite, email } = await searchParams;
  const q = new URLSearchParams({ mode: "signup" });
  if (invite) q.set("invite", invite);
  if (email) q.set("email", email);
  redirect(`/login?${q.toString()}`);
}
