import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { homeForRole, requiredRoleForPath, type Role } from "@/lib/roles";

/**
 * Refreshes the auth session cookie and enforces role-based routing (AUTH-05).
 * Wrong role → own dashboard; anonymous → /login?next=…
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const path = request.nextUrl.pathname;
  const needed = requiredRoleForPath(path);

  const redirectTo = (pathname: string, search?: Record<string, string>) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    Object.entries(search ?? {}).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!needed && path !== "/login" && path !== "/signup") return response;

  if (!userId) {
    if (needed) return redirectTo("/login", { next: path + request.nextUrl.search });
    return response;
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  const role = (profile?.role ?? null) as Role | null;

  if (path === "/login" || path === "/signup") {
    return role ? redirectTo(homeForRole(role)) : response;
  }
  if (needed && role !== needed) {
    return redirectTo(role ? homeForRole(role) : "/login");
  }
  return response;
}
