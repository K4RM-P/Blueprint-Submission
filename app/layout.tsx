import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
// Mono is only for codes and labels, never the first thing painted: no preload, so it doesn't compete with the page.
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], preload: false });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["opsz"] });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Relay · Free Geek Toronto", template: "%s · Relay" },
  description:
    "Relay turns Toronto small businesses into a recurring source of uniform laptops for Free Geek Toronto: free, certified data wipes documented on a certificate, and a Device Passport that shows who each laptop helps.",
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
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-white">
          Skip to content
        </a>
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
