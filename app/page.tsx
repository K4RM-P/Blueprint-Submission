import { ClayButton } from "@/components/clay";

export default function Home() {
  return (
    <main id="main" data-expression="3" className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-4 py-24 sm:px-6">
      <p className="eyebrow">Free Geek Toronto × GeekLoop</p>
      <h1 className="font-display mt-4 text-[3rem] leading-[0.95] sm:text-display-xl">Old laptops. New loops.</h1>
      <p className="measure mt-6 text-body-l text-ink-2">
        We turn your business&apos;s retired laptops into affordable computers for Toronto students, newcomers and families — and show you every step.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <ClayButton variant="primary" href="/styleguide">
          See the design system
        </ClayButton>
      </div>
    </main>
  );
}
