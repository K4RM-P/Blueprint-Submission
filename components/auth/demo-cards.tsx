"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { ArrowRight, Building2, Loader2, ShieldCheck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { IconTile } from "@/components/clay";
import { useMotionPrefs } from "@/lib/motion";
import { demoSignIn } from "@/server/actions/auth";
import type { Role } from "@/lib/roles";

const CARDS: { role: Role; tint: "apricot" | "sky" | "butter"; title: string; app: string; who: string; does: string; icon: React.ReactNode }[] = [
  {
    role: "partner",
    tint: "apricot",
    title: "Partner",
    app: "Partner Portal",
    who: "Priya · Maple Ledger Accounting",
    does: "Start here. Donate a batch of laptops, follow every device to its Device Passport and get a certificate for its certified data wipe.",
    icon: <Building2 />,
  },
  {
    role: "staff",
    tint: "sky",
    title: "Staff",
    app: "Staff Console",
    who: "Marcus · Free Geek Toronto",
    does: "Approve incoming partner batches, receive devices, verify every data wipe and issue the certificate.",
    icon: <ShieldCheck />,
  },
  {
    role: "volunteer",
    tint: "butter",
    title: "Volunteer",
    app: "Volunteer Bench",
    who: "Aisha · volunteer technician",
    does: "Claim a laptop from a partner batch, test, wipe and rebuild it. Your work lands on its Device Passport.",
    icon: <Wrench />,
  },
];

/** Clay role cards; pressing one presses it in, signs in and morphs to that dashboard (§9.7). `roles` picks which, in order. */
export function DemoCards({ roles = ["partner", "staff", "volunteer"], className }: { roles?: Role[]; className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<Role | null>(null);
  const [, startTransition] = useTransition();
  const { reduced, t } = useMotionPrefs();

  const go = async (role: Role) => {
    setPending(role);
    const res = await demoSignIn(role);
    if (!res.ok) {
      toast.error(res.error);
      setPending(null);
      return;
    }
    startTransition(() => {
      router.push(res.data.redirectTo);
      router.refresh();
    });
  };

  return (
    <ul className={className ?? "grid gap-5 md:grid-cols-3"}>
      {CARDS.filter((c) => roles.includes(c.role))
        .sort((a, b) => roles.indexOf(a.role) - roles.indexOf(b.role))
        .map((c, i) => (
        <motion.li key={c.role} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...t("soft"), delay: reduced ? 0 : i * 0.06 }}>
          <motion.button
            type="button"
            onClick={() => go(c.role)}
            disabled={pending !== null}
            data-pressed={pending === c.role || undefined}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={t("press")}
            className="clay clay-press lift flex h-full min-h-[280px] w-full flex-col items-start gap-4 p-7 text-left disabled:cursor-progress"
            aria-describedby={`demo-${c.role}`}
          >
            <IconTile tint={c.tint} size={48}>
              {c.icon}
            </IconTile>
            <div>
              <span className="font-display block text-[2rem] leading-none">{c.title}</span>
              <span className="mt-2 block text-small text-ink-3">{c.who}</span>
            </div>
            <p id={`demo-${c.role}`} className="text-ink-2">
              {c.does}
            </p>
            <span className="mt-auto inline-flex h-11 items-center gap-2 font-semibold text-loop-deep">
              {pending === c.role ? <Loader2 className="size-[18px] animate-spin" aria-hidden /> : null}
              {pending === c.role ? "Signing in…" : `Open ${c.app}`}
              {pending === c.role ? null : <ArrowRight className="size-[18px]" aria-hidden />}
            </span>
          </motion.button>
        </motion.li>
      ))}
    </ul>
  );
}
