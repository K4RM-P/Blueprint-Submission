"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import { isActive, type NavItem } from "@/components/shell/nav-config";

/** Floating clay dock for mobile app shells: 64px, safe-area aware (§8). */
export function Dock({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  const { t } = useMotionPrefs();
  return (
    <nav aria-label={`${label} (mobile)`} className="no-print fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 lg:hidden">
      <ul data-tint="porcelain" className="clay mx-auto flex h-16 max-w-md items-center justify-around rounded-full px-2">
        {items.map((item) => {
          const active = isActive(pathname, item, items);
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative flex-1">
              {active ? <motion.span layoutId="dock-pill" transition={t("liquid")} className="absolute inset-x-1 inset-y-0 rounded-full bg-mint" aria-hidden /> : null}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[0.6875rem] font-medium", active ? "text-loop-deep" : "text-ink-2")}
              >
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                <span className="max-w-full truncate px-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
