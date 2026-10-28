import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { DeferredToaster } from "@/components/ui/deferred-toaster";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// Mono is only for codes and serials, never the largest text on a page: no preload, so it stays off the first-paint path.
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], preload: false });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Relay · Free Geek Toronto", template: "%s · Relay" },
  description:
    "Relay shows the full journey of every refurbished computer at Free Geek Toronto — from the business that donated it to the person now using it.",
  openGraph: { siteName: "Relay", type: "website", locale: "en_CA" },
};

export const viewport: Viewport = {
  themeColor: "#F3EFE8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-CA"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
      style={{ ["--banner-h" as string]: "0px" }}
    >
      <head>
        <noscript>
          <style>{".reveal{opacity:1;transform:none}"}</style>
        </noscript>
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-white">
          Skip to content
        </a>
        {children}
        <DeferredToaster />
      </body>
    </html>
  );
}
