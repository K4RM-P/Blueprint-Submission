import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tint = "porcelain" | "mint" | "apricot" | "sky" | "butter";

interface ClayCardProps extends ComponentPropsWithoutRef<"div"> {
  tint?: Tint;
  /** Openable cards lift on hover; static cards don't (§8). */
  href?: string;
  size?: "md" | "lg" | "xl";
  as?: "div" | "section" | "article";
  children?: ReactNode;
}

const pad = { md: "p-6", lg: "p-6 sm:p-8", xl: "p-7 sm:p-10" } as const;

export function ClayCard({ tint = "porcelain", href, size = "md", as: TagName = "div", className, children, ...rest }: ClayCardProps) {
  const Tag = TagName as "div";
  const classes = cn("clay relative", size === "xl" && "rounded-[var(--r-xl)]", pad[size], className);
  if (href) {
    return (
      <Tag data-tint={tint} className={cn(classes, "lift group")} {...rest}>
        <Link href={href} className="absolute inset-0 z-[1] rounded-[inherit] focus-visible:outline-offset-4" aria-label={typeof rest["aria-label"] === "string" ? rest["aria-label"] : undefined}>
          <span className="sr-only">Open</span>
        </Link>
        {children}
      </Tag>
    );
  }
  return (
    <Tag data-tint={tint} className={classes} {...rest}>
      {children}
    </Tag>
  );
}

/** Flat white surface for tables, long forms and text (§6.2). */
export function FlatCard({ className, children, ...rest }: ComponentPropsWithoutRef<"div">) {
  return (
    <div className={cn("flat p-6", className)} {...rest}>
      {children}
    </div>
  );
}
