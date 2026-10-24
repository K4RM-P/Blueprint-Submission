"use client";

import { motion } from "motion/react";
import { BadgeCoin, ClayButton } from "@/components/clay";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useMotionPrefs } from "@/lib/motion";
import type { AwardedBadge } from "@/server/actions/volunteer";

/** Badge unlocked (§7.4): coin drops with a bouncy spring, one ring ripples, name types in. No confetti. */
export function BadgeCelebration({ badges, onClose }: { badges: AwardedBadge[]; onClose: () => void }) {
  const { reduced } = useMotionPrefs();
  const first = badges[0];
  return (
    <Dialog open={badges.length > 0} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="items-center text-center sm:max-w-md">
        {first ? (
          <div className="flex flex-col items-center gap-5 pt-2">
            <BadgeCoin key={first.slug} slug={first.slug} name="" unlocked celebrate size={120} />
            <div>
              <p className="eyebrow">Badge unlocked</p>
              <DialogTitle className="!pr-0 text-center">
                {reduced
                  ? first.name
                  : first.name.split("").map((ch, i) => (
                      <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.035 }}>
                        {ch}
                      </motion.span>
                    ))}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {badges.length > 1 ? `Plus ${badges.length - 1} more. ` : ""}It&apos;s in your Skills Wallet — and on your public profile if you turn it on.
              </DialogDescription>
            </div>
            <div className="flex gap-3">
              <ClayButton href="/volunteer/wallet" variant="secondary" size="sm">
                Open wallet
              </ClayButton>
              <ClayButton variant="ghost" size="sm" onClick={onClose}>
                Keep going
              </ClayButton>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
