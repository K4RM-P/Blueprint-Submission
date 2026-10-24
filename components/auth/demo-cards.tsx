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

const CARDS: { role: Role; tint: "apricot" | "sky" | "butter"; title: string; who: string; tryThis: string; icon: React.ReactNode }[] = [
  {
    role: "partner",
    tint: "apricot",
    title: "Explore as a Partner",
    who: "Priya, office manager at Maple Ledger Accounting",
    tryThis: "Start a new batch of 20 Dell Latitude 5420 laptops and watch the Batch Value Score fill.",
    icon: <Building2 />,
  },
  {
    role: "staff",
    tint: "sky",
    title: "Explore as Staff",
    who: "Marcus, operations lead at Free Geek Toronto",
    tryThis: "Approve Maple Ledger's submitted batch, schedule it, then receive 20 devices in one click.",
    icon: <ShieldCheck />,
  },
  {
    role: "volunteer",
    tint: "butter",
    title: "Explore as a Volunteer",
    who: "Aisha, volunteer building her IT résumé",
    tryThis: "Claim the next device and work through the checklist — one more hardware test unlocks a badge.",
    icon: <Wrench />,
  },
];

/** Three tall clay cards; pressing one presses it in, signs in and morphs to that dashboard (§9.7). */
export function DemoCards() {
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
    <ul className="grid gap-5 md:grid-cols-3">
      {CARDS.map((c, i) => (
        <motion.li key={c.role} initial={reduced ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...t("soft"), delay: reduced ? 0 : i * 0.06 }}>
          <motion.button
            type="button"
            onClick={() => go(c.role)}
            disabled={pending !== null}
            data-tint={c.tint}
            data-pressed={pending === c.role || undefined}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={t("press")}
            className="clay clay-press lift flex h-full min-h-[340px] w-full flex-col items-start gap-5 p-7 text-left disabled:cursor-progress"
            aria-describedby={`demo-${c.role}`}
          >
            <IconTile tint={c.tint} size={52}>
              {c.icon}
            </IconTile>
            <div>
              <span className="font-display block text-[1.75rem] leading-tight">{c.title}</span>
              <span className="mt-1 block text-small text-ink-2">{c.who}</span>
            </div>
            <p id={`demo-${c.role}`} className="text-ink">
              <span className="font-semibold">Try this: </span>
              {c.tryThis}
            </p>
            <span className="mt-auto inline-flex h-12 items-center gap-2 rounded-full bg-white/75 px-5 font-semibold text-ink">
              {pending === c.role ? <Loader2 className="size-[18px] animate-spin" aria-hidden /> : null}
              {pending === c.role ? "Signing in…" : "Open dashboard"}
              {pending === c.role ? null : <ArrowRight className="size-[18px]" aria-hidden />}
            </span>
          </motion.button>
        </motion.li>
      ))}
    </ul>
  );
}
