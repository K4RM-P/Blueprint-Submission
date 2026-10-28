"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LogOut, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import type { Role } from "@/lib/roles";
import { signOut } from "@/server/actions/auth";
import { Logo } from "./logo";
import { NAV, SHELL_META, isActive } from "./nav-config";
import { Dock } from "@/components/clay/dock";
import { NavBumpChip, useNavBump } from "@/components/liquid/baton-flight";
import type { NavItem } from "./nav-config";

interface AppShellProps {
  role: Role;
  userName: string;
  orgName?: string | null;
  children: ReactNode;
}

function UserMenu({ userName, orgName, compact, more = [] }: { userName: string; orgName?: string | null; compact?: boolean; more?: NavItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("flex min-h-11 items-center gap-3 rounded-full text-left hover:bg-[#ece6dc]", compact ? "p-1" : "w-full p-1.5 pr-3")}
        aria-label={`Account menu for ${userName}`}
      >
        <span data-tint="mint" className="clay-sm grid size-9 shrink-0 place-items-center rounded-full text-loop-deep">
          <UserRound className="size-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
        {!compact ? (
          <span className="min-w-0">
            <span className="block truncate text-small font-semibold text-ink">{userName}</span>
            {orgName ? <span className="block truncate text-[0.8125rem] text-ink-2">{orgName}</span> : null}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={compact ? "bottom" : "top"} className="w-60">
        <DropdownMenuLabel className="text-small font-normal text-ink-2">
          Signed in as <span className="font-semibold text-ink">{userName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* On phones, the pages that don't fit in the dock live here */}
        {more.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>
              <item.icon className="size-4" aria-hidden /> {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        {more.length ? <DropdownMenuSeparator /> : null}
        <DropdownMenuItem asChild>
          <Link href="/">Public site</Link>
        </DropdownMenuItem>
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SideItem({ item, active }: { item: NavItem; active: boolean }) {
  const { t } = useMotionPrefs();
  const { controls, label } = useNavBump(item.href);
  const Icon = item.icon;
  return (
    <motion.li className="relative" animate={controls}>
      {active ? <motion.span layoutId="nav-pill" transition={t("liquid")} data-tint="porcelain" className="clay-sm absolute inset-0 rounded-full" aria-hidden /> : null}
      <Link
        href={item.href}
        data-nav-href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn("relative flex h-11 items-center gap-3 rounded-full px-4 text-[0.9375rem] font-medium transition-colors", active ? "text-ink" : "text-ink-2 hover:bg-white/45 hover:text-ink")}
      >
        <Icon className={cn("size-[19px]", active ? "text-loop-deep" : "")} strokeWidth={1.75} aria-hidden />
        {item.label}
      </Link>
      <NavBumpChip label={label} />
    </motion.li>
  );
}

/** Role app shell: slim flat sidebar with a sliding clay pill on desktop; floating clay dock on mobile (§8). */
export function AppShell({ role, userName, orgName, children }: AppShellProps) {
  const pathname = usePathname();
  const items = NAV[role];
  const meta = SHELL_META[role];

  return (
    <div data-expression={meta.expression} className="flex min-h-full flex-1">
      <aside className="no-print sticky top-3 m-3 mr-0 hidden h-[calc(100dvh-var(--banner-h)-24px)] w-64 shrink-0 flex-col rounded-[var(--r-xl)] px-4 py-5 glass lg:flex">
        <Logo href={items[0].href} sub={meta.title} className="px-2" />
        <nav aria-label={meta.title} className="mt-8 flex-1">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <SideItem key={item.href} item={item} active={isActive(pathname, item, items)} />
            ))}
          </ul>
        </nav>
        <UserMenu userName={userName} orgName={orgName} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print glass sticky top-2 z-30 mx-2 mt-2 flex h-16 items-center justify-between rounded-[22px] px-3 lg:hidden">
          <Logo href={items[0].href} sub={meta.title} />
          <UserMenu userName={userName} orgName={orgName} compact more={items.filter((i) => !i.dock)} />
        </header>
        <main id="main" className={cn("mx-auto w-full flex-1 px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10", role === "staff" ? "max-w-[1320px]" : "max-w-[1200px]")}>
          {children}
        </main>
      </div>

      <Dock items={items.filter((i) => i.dock).slice(0, 5)} label={meta.title} />
    </div>
  );
}
