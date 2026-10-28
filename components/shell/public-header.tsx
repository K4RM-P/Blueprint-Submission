"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

/**
 * Core first: the Reuse Partner pipeline ("For Businesses") and the Device Passport.
 * Pay-It-Forward and "Can I donate this?" live in the footer and the landing page's
 * "More ways to help".
 */
const LINKS = [
  { href: "/become-a-partner", label: "For Businesses", match: ["/become-a-partner"] },
  { href: "/#passport", label: "Device Passport", match: ["/p/"] },
  { href: "/impact", label: "Impact", match: ["/impact"] },
  { href: "/partners", label: "Partner Wall", match: ["/partners"] },
  { href: "/about", label: "About", match: ["/about"] },
];

const isCurrent = (pathname: string, match: string[]) => match.some((m) => pathname.startsWith(m));

// The public pages are cached for everyone, so whether you're signed in is read in the browser:
// @supabase/ssr keeps the session in an "sb-<project>-auth-token" cookie.
const subscribe = () => () => {};
const hasAuthCookie = () => /(?:^|;\s*)sb-[^=]+-auth-token(?:\.0)?=/.test(document.cookie);

export function PublicHeader() {
  const pathname = usePathname();
  const signedIn = useSyncExternalStore(subscribe, hasAuthCookie, () => false);
  const dashboardHref = signedIn ? "/dashboard" : null;
  return (
    <header className="no-print sticky top-3 z-40 px-3 sm:px-4">
      <div className="glass mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 rounded-full pl-4 pr-2.5 sm:pl-5">
        <Logo sub="Free Geek Toronto" />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isCurrent(pathname, l.match) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-[0.9375rem] font-medium text-ink-2 transition-colors hover:text-ink",
                isCurrent(pathname, l.match) && "bg-[#ece6dc] text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href={dashboardHref ?? "/login"} className="clay-sm clay-press hidden h-11 items-center rounded-full px-5 text-[0.9375rem] font-semibold text-ink sm:inline-flex" data-tint="porcelain">
            {dashboardHref ? "Dashboard" : "Sign in / Join"}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="clay-sm grid size-11 place-items-center rounded-full lg:hidden" data-tint="porcelain" aria-label="Open menu">
              <Menu className="size-5" strokeWidth={1.75} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {[...LINKS, { href: dashboardHref ?? "/login", label: dashboardHref ? "Dashboard" : "Sign in / Join" }].map((l) => (
                <DropdownMenuItem key={l.href} asChild className="text-base">
                  <Link href={l.href}>{l.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
