import type { Metadata } from "next";
import { CalendarCheck, ClipboardList, FileCheck2, HardDrive, HeartHandshake, ShieldCheck } from "lucide-react";
import { ClayButton, ClayCard, IconTile } from "@/components/clay";
import { Faq } from "@/components/public/faq";
import { TierCompare } from "@/components/public/tier-compare";

export const metadata: Metadata = {
  title: "Become a Reuse Partner",
  description: "Retire your business laptops with Free Geek Toronto. Get a data-wipe certificate for every batch and see exactly who your devices help.",
};

const STEPS = [
  { icon: <ClipboardList />, title: "Tell us what you have", body: "List your laptops in a 4-step form. It takes about five minutes." },
  { icon: <CalendarCheck />, title: "Pick a week", body: "Choose a week our bench has room for, then drop off (or we pick up)." },
  { icon: <HardDrive />, title: "We wipe and refurbish", body: "Every drive is wiped and verified. Volunteers get the devices ready." },
  { icon: <HeartHandshake />, title: "See who it helps", body: "Get your certificate, and watch devices reach students and families." },
];

export default function BecomeAPartnerPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-16 pt-14 sm:px-6 md:grid-cols-12 md:pb-24 md:pt-24">
        <div className="md:col-span-8">
          <p className="eyebrow">Reuse Partner program</p>
          <h1 className="font-display mt-4 text-[2.75rem] leading-[0.98] sm:text-display-l">Retire your laptops. Get proof they&apos;re wiped. See exactly who they help.</h1>
          <p className="measure mt-6 text-body-l text-ink-2">
            Toronto businesses refresh laptops every 3–4 years. Send yours to Free Geek Toronto instead of a drawer or a shredder — they become affordable computers for students, newcomers
            and families here in the city.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ClayButton href="/login?mode=signup" variant="primary" size="lg">
              Become a Reuse Partner
            </ClayButton>
            <ClayButton href="/partners" variant="secondary" size="lg">
              See current partners
            </ClayButton>
          </div>
        </div>
        <p className="self-end text-ink-2 md:col-span-4">
          <span className="font-display block text-[3.5rem] leading-none text-ink">Free</span>
          to start. Community Partners pay nothing — ever. Paid tiers add reporting and recognition.
        </p>
      </section>

      <section aria-labelledby="how" className="border-y border-line bg-surface-flat/60 py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 id="how" className="font-display text-[2rem] leading-tight sm:text-display-m">
            How it works
          </h2>
          <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-6">
            <span aria-hidden className="absolute left-[22px] top-[22px] hidden h-1.5 w-[calc(100%-44px)] rounded-full bg-gradient-to-r from-loop to-loop-light opacity-80 md:block" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 md:flex-col">
                <IconTile tint={i === 2 ? "sky" : "mint"}>{s.icon}</IconTile>
                <div>
                  <p className="text-small font-semibold text-loop-deep">Step {i + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1 text-ink-2">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="tiers" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 md:py-32">
        <div className="max-w-2xl">
          <h2 id="tiers" className="font-display text-[2rem] leading-tight sm:text-display-m">
            Three ways to partner
          </h2>
          <p className="mt-3 text-body-l text-ink-2">We never charge for the act of reuse. Memberships pay for reporting and recognition your business can use.</p>
        </div>
        <div className="mt-14">
          <TierCompare />
        </div>
      </section>

      <section aria-labelledby="security" className="mx-auto max-w-[1200px] px-4 pb-24 sm:px-6">
        <ClayCard tint="sky" size="xl" className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <IconTile tint="sky" size={56}>
              <ShieldCheck />
            </IconTile>
            <h2 id="security" className="font-display mt-5 text-[2rem] leading-tight">
              Your data is wiped. We can prove it.
            </h2>
          </div>
          <ul className="flex flex-col gap-4 md:col-span-7">
            {[
              "Leave the drives in. Free Geek Toronto wipes every drive with its own sanitization software, which produces a report for each device.",
              "A staff member — never a volunteer — verifies every wipe before a device can be refurbished or sold.",
              "Every step is logged in an append-only chain of custody that no one can edit afterwards.",
              "You get a numbered certificate listing each device, its serial number, wipe method and verification date, with a public verification link.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <FileCheck2 className="mt-1 size-5 shrink-0 text-loop-deep" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </ClayCard>
      </section>

      <section aria-labelledby="faq" className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-28 sm:px-6 md:grid-cols-12">
        <h2 id="faq" className="font-display text-[2rem] leading-tight md:col-span-4">
          Questions businesses ask
        </h2>
        <div className="md:col-span-8">
          <Faq
            items={[
              { q: "Is my membership a donation?", a: "No. Memberships are a business service — reporting and recognition — so they don't come with a tax receipt. Free Geek Toronto is a non-profit, not a registered charity." },
              { q: "Do I need to remove or destroy the drives?", a: "Please don't. Intact drives make a laptop reusable. Free Geek Toronto wipes and verifies every drive and lists each one on your certificate." },
              { q: "What do you accept?", a: "Laptops, desktops, flat-screen monitors, tablets and accessories. Batches of 5+ identical laptops under 5 years old help the most, but every batch is welcome." },
              { q: "Does paying get my devices processed first?", a: "No. Every partner's batch is scheduled by bench capacity. Tiers buy reporting and recognition, never priority or influence over prices." },
              { q: "Who buys the devices?", a: "Students, newcomers, seniors and families who need an affordable computer. Prices are set by Free Geek Toronto and tied to ability to pay." },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
