import Link from "next/link";
import { LoopMark } from "./logo";

/** Honest footer: FGT is independent; Relay is a tool built for it (DP-03, §9.1.6). */
export function PublicFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line bg-canvas">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-md">
          <div className="flex items-center gap-2.5">
            <LoopMark />
            <span className="font-display text-xl">Relay</span>
          </div>
          <p className="mt-4 text-small text-ink-2">
            Free Geek Toronto is an independent non-profit at 180 Sudbury Street, Unit C3, Toronto. Free Geek locations in other cities run separately,
            so products, prices and services differ. Relay is an open-source tool built for Free Geek Toronto.
          </p>
        </div>
        <nav aria-label="Learn" className="flex flex-col gap-2 text-small">
          <p className="eyebrow mb-1">Learn</p>
          <Link className="text-ink-2 hover:text-ink" href="/about">About and pricing</Link>
          <Link className="text-ink-2 hover:text-ink" href="/impact">Impact and methodology</Link>
          <Link className="text-ink-2 hover:text-ink" href="/partners">Partner Wall</Link>
          <Link className="text-ink-2 hover:text-ink" href="/pay-it-forward">Pay it forward</Link>
        </nav>
        <nav aria-label="Take part" className="flex flex-col gap-2 text-small">
          <p className="eyebrow mb-1">Take part</p>
          <Link className="text-ink-2 hover:text-ink" href="/login?mode=signup">Become a Reuse Partner</Link>
          <Link className="text-ink-2 hover:text-ink" href="/donate">Can I donate this?</Link>
          <Link className="text-ink-2 hover:text-ink" href="/login">Sign in or join</Link>
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? (
            <Link className="text-ink-2 hover:text-ink" href="/demo">Demo accounts</Link>
          ) : null}
        </nav>
      </div>
      <p className="border-t border-line px-4 py-5 text-center text-[0.8125rem] text-ink-3">Relay · GPL-3.0 · Demo data is fictional.</p>
    </footer>
  );
}
