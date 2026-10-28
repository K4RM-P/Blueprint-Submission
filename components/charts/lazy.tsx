"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/clay/skeleton";

/**
 * Recharts is the heaviest library in the app and every chart sits below the fold, so charts
 * load after the page is interactive. The placeholders keep the exact height (no layout shift).
 */
export const DevicesAreaChart = dynamic(() => import("./area").then((m) => m.DevicesAreaChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[272px] w-full rounded-[var(--r-md)]" />,
});

export const BarsChart = dynamic(() => import("./bars").then((m) => m.BarsChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[180px] w-full rounded-[var(--r-md)]" />,
});
