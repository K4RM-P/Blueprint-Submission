import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/validation/auth";

const query = z.object({ code: z.string().min(1).max(512), next: z.string().max(200).optional() });

/** Exchanges the email-link code for a session (password reset, AUTH-07). */
export async function GET(request: NextRequest) {
  const parsed = query.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  const origin = request.nextUrl.origin;
  if (!parsed.success) return NextResponse.redirect(`${origin}/login`);
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(parsed.data.code);
  if (error) return NextResponse.redirect(`${origin}/forgot-password?expired=1`);
  return NextResponse.redirect(`${origin}${safeNext(parsed.data.next) ?? "/dashboard"}`);
}
