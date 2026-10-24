/** Public env, safe for the browser. Server-only secrets live in lib/supabase/admin.ts. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
};
