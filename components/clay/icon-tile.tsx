import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tint } from "./clay-card";

/** 44px clay squircle that gives an icon presence (§6.3). */
export function IconTile({ tint = "porcelain", size = 44, className, children }: { tint?: Tint; size?: number; className?: string; children: ReactNode }) {
  return (
    <span
      aria-hidden
      data-tint={tint}
      className={cn("clay-sm squircle inline-grid shrink-0 place-items-center rounded-[14px] text-loop-deep [&_svg]:size-[22px] [&_svg]:stroke-[1.75]", className)}
      style={{ width: size, height: size }}
    >
      {children}
    </span>
  );
}
