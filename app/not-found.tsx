import Link from "next/link";
import { ClayVessel } from "@/components/illustrations/clay-vessel";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-start justify-center gap-5 px-4 py-24 sm:px-6">
      <ClayVessel tone="sky" className="size-24" />
      <h1 className="font-display text-[2.5rem] leading-none sm:text-display-m">This page dropped the baton.</h1>
      <p className="measure text-body-l text-ink-2">The link may be old or mistyped.</p>
      <div className="flex flex-wrap gap-4">
        <Link href="/" className="clay-sm clay-press inline-flex h-12 items-center rounded-full px-6 font-semibold" data-tint="porcelain">
          Go to the home page
        </Link>
        <Link href="/about" className="inline-flex h-12 items-center font-semibold text-loop-deep underline-offset-4 hover:underline">
          About Free Geek Toronto
        </Link>
      </div>
    </main>
  );
}
