import Link from "next/link";
import { ClayVessel } from "@/components/illustrations/clay-vessel";
import { PassportLookup } from "@/components/public/passport-lookup";

/** DP-10: friendly 404 for unknown passport codes. */
export default function PassportNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-20">
      <ClayVessel tone="apricot" className="size-24" />
      <h1 className="font-display text-[2.5rem] leading-none">We can&apos;t find that passport.</h1>
      <p className="text-body-l text-ink-2">Check the code on the sticker — it starts with FGT- and has 8 letters and numbers. Codes never use 0, 1, O, I or L.</p>
      <PassportLookup />
      <Link href="/about" className="font-semibold text-loop-deep underline underline-offset-4">
        About Free Geek Toronto
      </Link>
    </main>
  );
}
