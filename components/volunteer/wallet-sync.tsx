"use client";

import { useEffect, useState } from "react";
import { syncBadges, type AwardedBadge } from "@/server/actions/volunteer";
import { BadgeCelebration } from "./badge-celebration";

/** Awards badges earned while away (e.g. Data Guardian after staff verify) and celebrates once. */
export function WalletSync() {
  const [badges, setBadges] = useState<AwardedBadge[]>([]);
  useEffect(() => {
    let live = true;
    syncBadges().then((r) => {
      if (live && r.ok && r.data.badges.length) setBadges(r.data.badges);
    });
    return () => {
      live = false;
    };
  }, []);
  return <BadgeCelebration badges={badges} onClose={() => setBadges([])} />;
}
