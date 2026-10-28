"use client";

import Link from "next/link";
import { forwardRef, useState, type ComponentPropsWithoutRef, type PointerEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotionPrefs } from "@/lib/motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative isolate inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-semibold whitespace-nowrap transition-[filter,translate,scale] duration-200 ease-[var(--ease-spring)] disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55 [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-[1.75]";

const variants: Record<Variant, string> = {
  primary: "clay-sm clay-press text-white",
  secondary: "clay-sm clay-press text-ink",
  danger: "clay-sm clay-press text-danger-ink",
  ghost: "text-loop-deep underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-[0.9375rem]",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-[1.0625rem]",
};

const tints: Record<Variant, string | undefined> = {
  primary: "ember",
  secondary: "porcelain",
  danger: "porcelain",
  ghost: undefined,
};

interface Ripple {
  id: number;
  x: number;
  y: number;
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children?: ReactNode;
};

type ButtonProps = CommonProps & Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & { href?: undefined };
type LinkProps = CommonProps & { href: string; prefetch?: boolean; target?: string; rel?: string; "aria-label"?: string; onClick?: () => void };

/**
 * Pill button with clay depth and a liquid-press ripple (§7.2.5, §8). The press is CSS
 * (scale .97 on the spring curve), so the many buttons on a page cost nothing to hydrate.
 * Max one `primary` per view.
 */
export const ClayButton = forwardRef<HTMLButtonElement, ButtonProps | LinkProps>(function ClayButton(props, ref) {
  const { variant = "secondary", size = "md", loading, icon, iconRight, className, children, ...rest } = props;
  const { reduced } = useMotionPrefs();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (reduced || variant === "ghost") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 380);
  };

  const content = (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute -z-10 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--clay-shade)] motion-safe:animate-[ripple_350ms_ease-out_forwards]"
          style={{ left: r.x, top: r.y }}
        />
      ))}
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </>
  );

  const classes = cn(base, variants[variant], sizes[size], variant !== "ghost" && "hover:-translate-y-0.5", variant !== "ghost" && !reduced && "active:scale-[0.97]", className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} data-tint={tints[variant]} className={classes} onPointerDown={onPointerDown} {...linkRest}>
        {content}
      </Link>
    );
  }

  const buttonRest = rest as Omit<ButtonProps, keyof CommonProps>;
  return (
    <button
      ref={ref}
      data-tint={tints[variant]}
      className={classes}
      onPointerDown={onPointerDown}
      aria-busy={loading || undefined}
      disabled={buttonRest.disabled || loading}
      {...buttonRest}
    >
      {content}
    </button>
  );
});
