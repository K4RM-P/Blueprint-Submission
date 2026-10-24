import type { ReactNode } from "react";
import { ClayCard } from "@/components/clay";

/** Asymmetric 7/5 split: a calm promise on the left, the form in a clay card on the right. */
export function AuthLayout({ eyebrow, title, lead, children, aside }: { eyebrow: string; title: string; lead: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <main className="mx-auto grid w-full max-w-[1200px] flex-1 items-start gap-10 px-4 py-12 sm:px-6 md:grid-cols-12 md:py-20">
      <div className="md:col-span-6 md:pt-6 lg:col-span-7">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-3 text-[2.5rem] leading-[1.02] sm:text-[3.5rem]">{title}</h1>
        <div className="measure mt-5 text-body-l text-ink-2">{lead}</div>
        {aside ? <div className="mt-8">{aside}</div> : null}
      </div>
      <ClayCard size="lg" className="md:col-span-6 lg:col-span-5">
        {children}
      </ClayCard>
    </main>
  );
}
