"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const LINKS = [
  { href: "/partners", label: "Partners" },
  { href: "/impact", label: "Impact" },
  { href: "/about", label: "About" },
  { href: "/become-a-partner", label: "Become a Partner" },
  { href: "/donate", label: "Can I Donate?" },
];

export function PublicHeader({ dashboardHref }: { dashboardHref: string | null }) {
  const pathname = usePathname();
  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/70 bg-canvas/90 backdrop-blur-[2px]">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo sub="Free Geek Toronto" />
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname.startsWith(l.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-[0.9375rem] font-medium text-ink-2 transition-colors hover:text-ink",
                pathname.startsWith(l.href) && "bg-[#ece6dc] text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href={dashboardHref ?? "/login"} className="clay-sm clay-press hidden h-11 items-center rounded-full px-5 text-[0.9375rem] font-semibold text-ink sm:inline-flex" data-tint="porcelain">
            {dashboardHref ? "Dashboard" : "Sign in"}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="clay-sm grid size-11 place-items-center rounded-full lg:hidden" data-tint="porcelain" aria-label="Open menu">
              <Menu className="size-5" strokeWidth={1.75} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {[...LINKS, { href: dashboardHref ?? "/login", label: dashboardHref ? "Dashboard" : "Sign in" }].map((l) => (
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
