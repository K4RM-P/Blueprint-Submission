import {
  Award,
  BarChart3,
  ClipboardList,
  CreditCard,
  FileText,
  HandCoins,
  Laptop,
  LayoutDashboard,
  type LucideIcon,
  Package,
  QrCode,
  Settings,
  Users,
  UsersRound,
  Wrench,
} from "lucide-react";
import type { Role } from "@/lib/roles";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile dock (max 5). */
  dock?: boolean;
  exact?: boolean;
}

export const NAV: Record<Role, NavItem[]> = {
  partner: [
    { href: "/partner", label: "Dashboard", icon: LayoutDashboard, dock: true, exact: true },
    { href: "/partner/batches", label: "Batches", icon: Package, dock: true },
    { href: "/partner/report", label: "Impact report", icon: FileText, dock: true },
    { href: "/partner/membership", label: "Membership", icon: CreditCard, dock: true },
    { href: "/partner/settings", label: "Settings", icon: Settings, dock: true },
  ],
  staff: [
    { href: "/staff", label: "Overview", icon: BarChart3, dock: true, exact: true },
    { href: "/staff/batches", label: "Batches", icon: ClipboardList, dock: true },
    { href: "/staff/devices", label: "Devices", icon: Laptop, dock: true },
    { href: "/staff/labels", label: "QR labels", icon: QrCode },
    { href: "/staff/partners", label: "Partners", icon: UsersRound, dock: true },
    { href: "/staff/volunteers", label: "Volunteers", icon: Users },
    { href: "/staff/fund", label: "Pay-It-Forward", icon: HandCoins },
    { href: "/staff/settings", label: "Settings", icon: Settings, dock: true },
  ],
  volunteer: [
    { href: "/volunteer", label: "My Bench", icon: Wrench, dock: true, exact: true },
    { href: "/volunteer/wallet", label: "Skills Wallet", icon: Award, dock: true },
    { href: "/volunteer/settings", label: "Privacy", icon: Settings, dock: true },
  ],
};

export const SHELL_META: Record<Role, { title: string; expression: 1 | 2 | 3 }> = {
  partner: { title: "Partner Portal", expression: 2 },
  staff: { title: "Staff Console", expression: 1 },
  volunteer: { title: "Volunteer Bench", expression: 3 },
};

export function isActive(pathname: string, item: NavItem, all: NavItem[]): boolean {
  if (item.exact) return pathname === item.href;
  if (!(pathname === item.href || pathname.startsWith(item.href + "/"))) return false;
  // Prefer the most specific matching item (e.g. "New batch" over "Batches").
  return !all.some((o) => o !== item && o.href.length > item.href.length && (pathname === o.href || pathname.startsWith(o.href + "/")));
}
