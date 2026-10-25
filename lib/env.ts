/**
 * The public base URL that QR codes, certificates and emails point at. A LAN or
 * localhost NEXT_PUBLIC_SITE_URL (handy for scanning QRs against `pnpm dev`) is
 * useless once deployed, because a phone can't reach it. So on Vercel we fall
 * back to the project's production domain, which Vercel sets automatically.
 */
function resolveSiteUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (configured && !(vercelHost && isPrivateUrl(configured))) return configured;
  if (vercelHost) return `https://${vercelHost.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return configured || "http://localhost:3000";
}

/** localhost, 127.x, 10.x, 172.16–31.x, 192.168.x, *.local, or anything unparseable. */
export function isPrivateUrl(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return true;
  }
  return (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

/** Public env, safe for the browser. Server-only secrets live in lib/supabase/admin.ts. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: resolveSiteUrl(),
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
};
