import type { Metadata } from "next";
import { CalendarCheck, Check, ClipboardList, FileCheck2, HardDrive, HeartHandshake, ShieldCheck } from "lucide-react";
import { ClayButton, ClayCard, IconTile } from "@/components/clay";
import { Faq } from "@/components/public/faq";
import { TierCompare } from "@/components/public/tier-compare";

export const metadata: Metadata = {
  title: "Become a Reuse Partner",
  description: "Retire your business laptops with Free Geek Toronto, free. Every drive gets a certified data wipe, every batch a certificate, and every laptop a Device Passport.",
};

/** The options an office actually has for retired laptops (direct and indirect alternatives). */
const OPTIONS = [
  { option: "Trade-in or buyback", get: "Some credit toward new hardware.", catch: "Proof of the wipe depends on the program, and the laptop's story ends there." },
  { option: "Reseller", get: "A little cash for newer models.", catch: "Older laptops fetch little, and wiping them is usually your job." },
  {
    option: "Another refurbisher or IT disposal firm",
    get: "Data destruction, then reuse or recycling. Terms vary by provider.",
    catch: "You rarely get a public record of each laptop or see who it helps.",
  },
  { option: "Paid IT disposal", get: "Drives destroyed, with paperwork.", catch: "You pay per device, and working laptops are often recycled instead of reused." },
  { option: "Recycling drop-off", get: "Free and responsible.", catch: "Working laptops are broken down for materials, and you get no record of the wipe." },
  { option: "A drawer or storage room", get: "Nothing to do today.", catch: "Your data sits on old drives while the laptops lose value every month." },
];

const STEPS = [
  { icon: <ClipboardList />, title: "Tell us what you have", body: "List your laptops in a 4-step form. It takes about two minutes." },
  { icon: <CalendarCheck />, title: "Pick a week", body: "Choose a week our bench has room for, then drop off at 180 Sudbury Street." },
  { icon: <HardDrive />, title: "Certified data wipe", body: "Staff verify every wipe. Volunteers refurbish each laptop and it gets a Device Passport." },
  { icon: <HeartHandshake />, title: "See who it helps", body: "Get your certificate, follow each laptop on its Device Passport, and see on your dashboard who it helps: students, newcomers, seniors, never names." },
];

export default function BecomeAPartnerPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-16 pt-14 sm:px-6 md:grid-cols-12 md:pb-24 md:pt-24">
        <div className="md:col-span-8">
          <p className="eyebrow">Reuse Partnership · a new way to work with Free Geek Toronto</p>
          <h1 className="font-display mt-4 text-[2.75rem] leading-[0.98] sm:text-display-l">Retire your laptops. Get proof they&apos;re wiped. See exactly who they help.</h1>
          <p className="measure mt-6 text-body-l text-ink-2">
            For Toronto offices retiring 10–50 laptops. Send them to Free Geek Toronto instead of a trade-in, a drawer or a shredder: every drive gets a certified data wipe, and each
            laptop becomes an affordable computer for a student, newcomer or family here in the city.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <ClayButton href="/login?mode=signup" variant="primary" size="lg">
              Become a Reuse Partner
            </ClayButton>
            <ClayButton href="/#passport" variant="secondary" size="lg">
              See a Device Passport
            </ClayButton>
          </div>
        </div>
        <div className="self-end md:col-span-4">
          <p className="text-ink-2">
            <span className="font-display block text-[3.5rem] leading-none text-ink">Free</span>
            The Community tier is free. It includes everything below:
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-ink">
            {["Certified data wipe for every drive", "A numbered certificate for every batch", "Your impact dashboard", "Your name on the Partner Wall, if you opt in"].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check className="mt-0.5 size-5 shrink-0 text-loop-deep" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="options" className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6 md:pb-28">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="options" className="font-display text-[2rem] leading-tight sm:text-display-m md:col-span-7">
            Your options for old laptops
          </h2>
          <p className="text-ink-2 md:col-span-5">
            Good business laptops usually go to trade-ins, so they rarely reach Free Geek Toronto. Here is how a Reuse Partnership compares.
          </p>
        </div>
        <div className="flat mt-10 overflow-hidden">
          <table className="w-full text-left">
            <caption className="sr-only">How a Reuse Partnership compares with other ways to retire business laptops</caption>
            <thead className="max-md:sr-only">
              <tr className="border-b border-line text-small text-ink-2">
                <th scope="col" className="px-5 py-3 font-medium">Option</th>
                <th scope="col" className="px-5 py-3 font-medium">What you get</th>
                <th scope="col" className="px-5 py-3 font-medium">The catch</th>
              </tr>
            </thead>
            <tbody>
              {OPTIONS.map((o) => (
                <tr key={o.option} className="border-b border-line max-md:flex max-md:flex-col max-md:gap-1 max-md:px-5 max-md:py-4">
                  <th scope="row" className="font-semibold md:px-5 md:py-4">{o.option}</th>
                  <td className="text-ink-2 md:px-5 md:py-4">{o.get}</td>
                  <td className="text-ink-2 md:px-5 md:py-4">{o.catch}</td>
                </tr>
              ))}
              <tr className="bg-mint/50 max-md:flex max-md:flex-col max-md:gap-1 max-md:px-5 max-md:py-4">
                <th scope="row" className="font-semibold text-loop-deep md:px-5 md:py-4">Reuse Partnership</th>
                <td className="md:px-5 md:py-4">Free. A certified data wipe for every drive and a numbered certificate for every batch.</td>
                <td className="md:px-5 md:py-4">You give up any trade-in credit and drop off at 180 Sudbury Street in a week with room. In return, your dashboard shows who each laptop helps in Toronto.</td>
              </tr>
            </tbody>
          </table>
        </div>
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

      <section aria-labelledby="security" className="mx-auto max-w-[1200px] px-4 pt-24 sm:px-6 md:pt-32">
        <ClayCard tint="sky" size="xl" className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <IconTile tint="sky" size={56}>
              <ShieldCheck />
            </IconTile>
            <h2 id="security" className="font-display mt-5 text-[2rem] leading-tight">
              Certified data wipe. We can prove it.
            </h2>
          </div>
          <ul className="flex flex-col gap-4 md:col-span-7">
            {[
              "Leave the drives in. Free Geek Toronto wipes every drive with the data-sanitization software it already uses, and the result is recorded for each device.",
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

      <section aria-labelledby="tiers" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-6 md:py-32">
        <div className="max-w-2xl">
          <h2 id="tiers" className="font-display text-[2rem] leading-tight sm:text-display-m">
            Start free. Upgrade only if you want more.
          </h2>
          <p className="mt-3 text-body-l text-ink-2">
            Free Geek Toronto never charges for reuse. Paid memberships are optional, for businesses that want more reporting and recognition. What matters most is your laptops.
          </p>
        </div>
        <div className="mt-14">
          <TierCompare />
        </div>
      </section>

      <section aria-labelledby="faq" className="mx-auto grid max-w-[1200px] gap-10 px-4 pb-28 sm:px-6 md:grid-cols-12">
        <h2 id="faq" className="font-display text-[2rem] leading-tight md:col-span-4">
          Questions businesses ask
        </h2>
        <div className="md:col-span-8">
          <Faq
            items={[
              {
                q: "Why donate instead of trading in?",
                a: "A trade-in or reseller gives you a little credit and the story ends. With Relay it's free, every drive gets a certified data wipe, and your dashboard shows who each laptop helps, by category: a student, a newcomer, a senior.",
              },
              {
                q: "How do we know our data is destroyed?",
                a: "Free Geek Toronto wipes every drive with its data-sanitization software and records the result for each device. A staff member verifies each one, and your numbered certificate lists every device with a public verification link.",
              },
              { q: "What does it cost?", a: "Nothing. The Community tier is free. Paid memberships are optional extras for more reporting and recognition." },
              { q: "Is the membership a donation?", a: "No. Memberships are a business service, reporting and recognition, so they don't come with a tax receipt." },
              { q: "Do I need to remove or destroy the drives?", a: "Please don't. Intact drives make a laptop reusable. Free Geek Toronto wipes and verifies every drive and lists each one on your certificate." },
              { q: "What do you accept?", a: "Laptops, desktops, flat-screen monitors, tablets and accessories. Batches of 5+ identical laptops under 5 years old help the most, but every batch is welcome." },
              { q: "Does paying get my devices processed first?", a: "No. Every partner's batch is scheduled by bench capacity and Batch Value Score. Paid tiers add reporting, recognition and pickup requests, never priority or influence over prices." },
              { q: "Who buys the devices?", a: "Mostly students, newcomers, seniors and families who need an affordable computer, plus non-profits, small businesses and other buyers at the same prices. Free Geek Toronto sets every price; its vision is that access to technology reflects ability to pay." },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
