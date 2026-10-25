"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";
import { isActive, type NavItem } from "@/components/shell/nav-config";
import { NavBumpChip, useNavBump } from "@/components/liquid/baton-flight";

/** Floating clay dock for mobile app shells: 64px, safe-area aware (§8). */
export function Dock({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={`${label} (mobile)`} className="no-print fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 lg:hidden">
      <ul className="glass mx-auto flex h-16 max-w-md items-center justify-around rounded-full px-2">
        {items.map((item) => (
          <DockItem key={item.href} item={item} active={isActive(pathname, item, items)} />
        ))}
      </ul>
    </nav>
  );
}

function DockItem({ item, active }: { item: NavItem; active: boolean }) {
  const { t } = useMotionPrefs();
  const { controls, label } = useNavBump(item.href);
  const Icon = item.icon;
  return (
    <motion.li className="relative flex-1" animate={controls}>
      {active ? <motion.span layoutId="dock-pill" transition={t("liquid")} data-tint="mint" className="clay-sm absolute inset-x-1 inset-y-0 rounded-full" aria-hidden /> : null}
      <Link
        href={item.href}
        data-nav-href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn("relative flex h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[0.6875rem] font-medium", active ? "text-loop-deep" : "text-ink-2")}
      >
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        <span className="max-w-full truncate px-1">{item.label}</span>
      </Link>
      <NavBumpChip label={label} />
    </motion.li>
  );
}
