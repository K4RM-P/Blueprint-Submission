import type { NextConfig } from "next";

const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();

// Next's bootstrap scripts are inline, so scripts allow 'unsafe-inline'; everything else is locked to
// this site and the Supabase project. Production only: the dev server needs eval for fast refresh.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`,
  "font-src 'self'",
  `connect-src 'self' ${supabaseOrigin} ${supabaseOrigin.replace(/^https/, "wss")}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
].join("; ");

const securityHeaders = [
  ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: csp }] : []),
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

// Let a phone on the same Wi-Fi load the dev server when NEXT_PUBLIC_SITE_URL is a LAN address (passport QR demos).
const siteHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  allowedDevOrigins: siteHost && siteHost !== "localhost" ? [siteHost] : [],
  // Cache Components is off: almost every page is per-user and reads auth cookies.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["@react-pdf/renderer"],
  // Bundled TTFs for the passport share images (lib/og/passport-card.tsx).
  outputFileTracingIncludes: { "/p/**": ["./lib/og/fonts/*.ttf"] },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "bykwwvzgvxtrzxfdjsoi.supabase.co" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
