"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Skeleton } from "@/components/clay/skeleton";

/**
 * Recharts is the heaviest library in the app and every chart sits below the fold, so a chart
 * only loads when it's about to scroll into view. The placeholders keep the exact height (no
 * layout shift) and are hidden from assistive tech until the chart (and its text summary) arrives.
 */
const Area = dynamic(() => import("./area").then((m) => m.DevicesAreaChart), { ssr: false, loading: () => <AreaPlaceholder /> });
const Bars = dynamic(() => import("./bars").then((m) => m.BarsChart), { ssr: false, loading: () => <BarsPlaceholder /> });

const AreaPlaceholder = () => <Skeleton className="h-[272px] w-full rounded-[var(--r-md)]" />;
const BarsPlaceholder = ({ height = 180 }: { height?: number }) => (
  <div style={{ height }}>
    <Skeleton className="size-full rounded-[var(--r-md)]" />
  </div>
);

function WhenNear({ children, placeholder }: { children: ReactNode; placeholder: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && setNear(true), { rootMargin: "300px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{near ? children : placeholder}</div>;
}

export function DevicesAreaChart(props: ComponentProps<typeof Area>) {
  return (
    <WhenNear placeholder={<AreaPlaceholder />}>
      <Area {...props} />
    </WhenNear>
  );
}

export function BarsChart(props: ComponentProps<typeof Bars>) {
  return (
    <WhenNear placeholder={<BarsPlaceholder height={props.height} />}>
      <Bars {...props} />
    </WhenNear>
  );
}
