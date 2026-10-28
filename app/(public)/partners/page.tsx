import type { Metadata } from "next";
import { DemoDataNote } from "@/components/shell/demo-data-note";
import { ClayButton, EmptyState } from "@/components/clay";
import { PartnerTile } from "@/components/public/partner-tile";
import { createClient } from "@/lib/supabase/server";
import { logoUrl } from "@/lib/queries/common";
import { labels, type PartnerTier } from "@/lib/domain";

export const metadata: Metadata = { title: "Partner Wall", description: "Toronto businesses whose retired laptops now help students, newcomers and families." };

/** DP-07: opted-in partners by tier, with logos and devices-reused counts. */
export default async function PartnersPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("partner_wall");
  const partners = data ?? [];
  const tiers: PartnerTier[] = ["champion", "impact", "community"];
  const total = partners.reduce((s, p) => s + Number(p.devices_reused), 0);
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-14 sm:px-6 md:py-24">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="eyebrow">Partner Wall</p>
          <h1 className="font-display mt-3 text-[2.75rem] leading-[0.98] sm:text-display-l">The businesses passing their laptops on.</h1>
          <DemoDataNote className="mt-4" />
        </div>
        <p className="text-ink-2 md:col-span-4">
          <span className="font-display block text-[3.5rem] leading-none text-ink tnum">{total}</span>
          devices from these partners are back in use. Partners choose whether to appear here.
        </p>
      </div>
      {partners.length === 0 ? (
        <EmptyState className="mt-12" title="The wall is waiting for its first partner." tone="apricot" action={<ClayButton href="/become-a-partner" variant="secondary" size="sm">Become a Reuse Partner</ClayButton>} />
      ) : (
        tiers.map((tier) => {
          const list = partners.filter((p) => p.tier === tier);
          if (!list.length) return null;
          return (
            <section key={tier} aria-labelledby={`t-${tier}`} className="mt-16">
              <h2 id={`t-${tier}`} className="eyebrow">
                {labels.tier[tier]}s
              </h2>
              <ul className={tier === "champion" ? "mt-5 grid gap-5 md:grid-cols-2" : "mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
                {list.map((p) => (
                  <li key={p.slug}>
                    <PartnerTile name={p.name} logoUrl={logoUrl(p.logo_path)} tier={p.tier as PartnerTier} reused={Number(p.devices_reused)} featured={tier === "champion"} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
      <div className="mt-20">
        <ClayButton href="/become-a-partner" variant="primary">
          Join the wall
        </ClayButton>
      </div>
    </main>
  );
}
