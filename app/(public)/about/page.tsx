import type { Metadata } from "next";
import { HardDrive, Scale, ShieldCheck, Wrench } from "lucide-react";
import { ClayButton, ClayCard, IconTile } from "@/components/clay";

export const metadata: Metadata = { title: "About", description: "Free Geek Toronto's mission, its independence from other Free Geek locations, how pricing works, and how data is kept safe." };

/** DP-08: mission, network independence, pricing philosophy, data-security process. Text-heavy → flat (§6.2). */
export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:py-24">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow">About</p>
          <h1 className="font-display mt-3 text-[2.75rem] leading-[0.98] sm:text-display-l">Technology that keeps moving.</h1>
        </div>
        <p className="self-end text-body-l text-ink-2 md:col-span-5">
          Free Geek Toronto is a non-profit that refurbishes donated computers, teaches tech skills, and gets affordable devices to people who need them — keeping electronics out of landfill.
        </p>
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-12">
        <ClayCard tint="sky" className="flex flex-col gap-4 lg:col-span-5" id="network">
          <IconTile tint="sky">
            <Scale />
          </IconTile>
          <h2 className="text-title font-semibold">One name, independent organizations</h2>
          <p className="text-ink-2">
            Free Geek Toronto is independent. Free Geek locations in other cities — like Vancouver or Portland — are separate organizations, so their products, prices and services differ
            from ours.
          </p>
        </ClayCard>

        <section id="pricing" aria-labelledby="pricing-t" className="flat scroll-mt-28 p-7 lg:col-span-7">
          <h2 id="pricing-t" className="text-title font-semibold">
            How pricing works — and why it isn&apos;t free
          </h2>
          <div className="measure mt-3 flex flex-col gap-3 text-ink-2">
            <p>Every computer is tested, securely wiped, repaired and reinstalled. That takes parts, tools, space and paid staff who train people facing barriers to employment.</p>
            <p>Sales are how Free Geek Toronto pays for that work — most of its revenue comes from selling refurbished devices. Prices are kept as low as possible and tied to ability to pay.</p>
            <p>Each Device Passport shows where your money goes. Businesses that partner with us pay for reporting and recognition — never for priority access or influence over prices.</p>
          </div>
        </section>

        <section id="security" aria-labelledby="sec-t" className="flat scroll-mt-28 p-7 lg:col-span-7">
          <h2 id="sec-t" className="text-title font-semibold">
            How data is kept safe
          </h2>
          <ol className="mt-4 flex flex-col gap-4">
            {[
              [HardDrive, "Drives arrive intact. Donors don't need to remove or destroy them."],
              [Wrench, "A volunteer wipes each drive with Free Geek Toronto's sanitization software, which produces a report."],
              [ShieldCheck, "A staff member — never a volunteer — checks the report and verifies the wipe before the device can move on."],
              [ShieldCheck, "Every step is logged in an append-only record. Business donors receive a numbered certificate anyone can verify."],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof HardDrive;
              return (
                <li key={i} className="flex gap-3">
                  <I className="mt-0.5 size-5 shrink-0 text-loop-deep" aria-hidden />
                  <span className="text-ink-2">{text as string}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-small text-ink-3">GeekLoop records sanitization; Free Geek Toronto&apos;s own software remains the system of record.</p>
        </section>

        <ClayCard tint="butter" className="flex flex-col gap-4 lg:col-span-5" id="volunteer">
          <IconTile tint="butter">
            <Wrench />
          </IconTile>
          <h2 className="text-title font-semibold">Volunteering</h2>
          <p className="text-ink-2">
            Volunteers test, wipe and rebuild computers at the bench. Every device they finish is logged to their Skills Wallet, with badges they can share with employers.
          </p>
          <p className="text-small text-ink-2">Shifts are scheduled through Free Geek Toronto directly.</p>
        </ClayCard>
      </div>

      <div className="mt-16 flex flex-wrap gap-4">
        <ClayButton href="/donate" variant="primary">
          Can I donate my device?
        </ClayButton>
        <ClayButton href="/become-a-partner" variant="secondary">
          Partner as a business
        </ClayButton>
      </div>
    </main>
  );
}
