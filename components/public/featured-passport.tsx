import Link from "next/link";
import { ArrowRight, CheckCircle2, Package, ShieldCheck, Wrench } from "lucide-react";
import { PassportQrImage } from "@/components/journey/passport-qr";
import { FEATURED_PASSPORT } from "@/lib/showcase-passports";
import { cn } from "@/lib/utils";

/**
 * A real showcase Device Passport, drawn as its cover with the four stamps that tie it
 * back to the Reuse Partner pipeline. The whole card opens the actual passport.
 */
export async function FeaturedPassport({ className }: { className?: string }) {
  const p = FEATURED_PASSPORT;
  const stamps = [
    { icon: <Package />, label: `Donated by ${p.donor}`, sub: "A Reuse Partner" },
    { icon: <ShieldCheck />, label: "Certified data wipe", sub: "Verified by Free Geek Toronto staff" },
    { icon: <Wrench />, label: `Refurbished by ${p.volunteer}`, sub: "A volunteer on the bench" },
    { icon: <CheckCircle2 />, label: "In its new home", sub: `Now helping ${p.recipient}` },
  ];
  return (
    <Link
      href={`/p/${p.code}`}
      aria-label={`Open the Device Passport for this ${p.device}, code ${p.code}`}
      className={cn("lift group block rounded-[var(--r-xl)] bg-surface p-6 text-ink shadow-[inset_0_1px_0_#fff,0_30px_60px_-30px_rgba(0,0,0,0.65)] sm:p-7", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-ink-2">DEVICE PASSPORT</p>
          <p className="mt-1 font-mono text-[0.9375rem] tracking-wider">{p.code}</p>
          <p className="font-display mt-4 text-[1.75rem] leading-[1.02] tracking-[-0.04em] sm:text-[2rem]">{p.device}</p>
          <p className="mt-2 text-small text-ink-2">{p.specs.join(" · ")}</p>
        </div>
        <PassportQrImage code={p.code} size={84} className="hidden border border-line min-[420px]:block" />
      </div>
      <ol className="mt-6 flex flex-col gap-3 border-t border-line pt-5" aria-label="Its relay so far">
        {stamps.map((s) => (
          <li key={s.label} className="flex items-center gap-3">
            <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-mint text-loop-deep [&_svg]:size-[18px] [&_svg]:stroke-[1.75]">
              {s.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold leading-tight">{s.label}</span>
              <span className="block text-[0.8125rem] text-ink-2">{s.sub}</span>
            </span>
          </li>
        ))}
      </ol>
      <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-loop-deep">
        Open this Device Passport <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
