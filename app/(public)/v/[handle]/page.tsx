import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCoin, ClayCard } from "@/components/clay";
import { createClient } from "@/lib/supabase/server";
import { longDate } from "@/lib/dates";

type Profile = { first_name: string; member_since: string; devices_refurbished: number; badges: { slug: string; name: string; description: string; awarded_at: string }[] };

async function load(handle: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_volunteer_profile", { p_handle: handle });
  return (data as Profile | null) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = await load((await params).handle);
  return p ? { title: `${p.first_name} · Volunteer`, description: `${p.first_name} has refurbished ${p.devices_refurbished} computers at Free Geek Toronto.` } : { title: "Volunteer profile" };
}

/** VW-06 (P1): opt-in public profile — first name, badges, devices count, member since. */
export default async function VolunteerProfile({ params }: { params: Promise<{ handle: string }> }) {
  const p = await load((await params).handle);
  if (!p) notFound();
  return (
    <main className="mx-auto w-full max-w-[1000px] px-4 py-14 sm:px-6 md:py-24">
      <ClayCard tint="butter" size="xl" className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div>
          <p className="eyebrow !text-[#6b4e00]">Free Geek Toronto volunteer</p>
          <h1 className="font-display mt-3 text-[3rem] leading-none sm:text-display-l">{p.first_name}</h1>
          <p className="mt-4 text-body-l text-ink-2">Volunteering since {longDate(p.member_since)}. Tests, securely wipes, and rebuilds donated computers for people in Toronto.</p>
        </div>
        <div className="md:text-right">
          <p className="font-display text-[5rem] leading-none tnum">{p.devices_refurbished}</p>
          <p className="text-ink-2">computers refurbished and quality-checked</p>
        </div>
      </ClayCard>
      <section className="mt-14" aria-labelledby="b">
        <h2 id="b" className="text-title font-semibold">
          Verified skills
        </h2>
        {p.badges.length === 0 ? (
          <p className="mt-3 text-ink-2">First badge coming soon.</p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-4">
            {p.badges.map((b) => (
              <li key={b.slug}>
                <BadgeCoin slug={b.slug} name={b.name} unlocked />
                <p className="mt-1 text-center text-[0.8125rem] text-ink-2">{b.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-14 text-small text-ink-3">Badges are awarded automatically from Free Geek Toronto&apos;s refurbishment records, or by staff (Mentor).</p>
    </main>
  );
}
