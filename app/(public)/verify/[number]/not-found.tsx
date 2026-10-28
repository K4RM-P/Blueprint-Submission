import Link from "next/link";
import { SearchX } from "lucide-react";
import { ClayCard } from "@/components/clay";

/** CI-02: an unknown certificate number is a real 404 with a friendly explanation. */
export default function CertificateNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16 sm:py-24">
      <ClayCard tint="porcelain" size="xl" material="glass" className="flex flex-col items-center gap-6 text-center">
        <span data-tint="porcelain" className="clay grid size-24 place-items-center rounded-full">
          <SearchX className="size-10 text-ink-2" strokeWidth={1.5} aria-hidden />
        </span>
        <h1 className="font-display text-[2rem] leading-tight">We couldn&apos;t find that certificate.</h1>
        <p className="text-ink-2">
          Check the number — it looks like <span className="font-mono">GL-2026-0001</span>. If it still doesn&apos;t match, contact Free Geek Toronto.
        </p>
        <Link href="/about" className="font-semibold text-loop-deep underline underline-offset-4">
          About our data-security process
        </Link>
      </ClayCard>
    </main>
  );
}
