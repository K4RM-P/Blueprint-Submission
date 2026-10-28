import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BadgeCoin, ClayCard, EmptyState, StatPebble } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { WalletSync } from "@/components/volunteer/wallet-sync";
import { requireRole } from "@/lib/auth";
import { getSettings } from "@/lib/queries/common";
import { BADGES, badgeProgress, estimateHours, type VolunteerStats } from "@/lib/badges";
import { isUniformQuantity } from "@/lib/batch-score";
import { labels } from "@/lib/domain";
import { longDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Skills Wallet" };

export default async function WalletPage() {
  const { supabase, profile } = await requireRole("volunteer");
  const [{ data: statsRaw }, { data: held }, { data: steps }, settings] = await Promise.all([
    supabase.rpc("my_volunteer_stats"),
    supabase.from("volunteer_badges").select("awarded_at, badges(slug, name)").eq("volunteer_id", profile.id),
    supabase.from("device_events").select("device_id, step").eq("actor_id", profile.id).eq("event_type", "step_completed"),
    getSettings(supabase),
  ]);
  const stats = (statsRaw ?? { finalQa: 0, hardwareTests: 0, verifiedWipes: 0, openSourceInstalls: 0 }) as unknown as VolunteerStats;
  const heldSlugs = new Set((held ?? []).map((h) => h.badges?.slug));
  const byStep = (s: string) => (steps ?? []).filter((e) => e.step === s).length;
  const completedIds = [...new Set((steps ?? []).filter((e) => e.step === "final_qa").map((e) => e.device_id))];

  // "Passports I appear on": devices I refurbished (RLS limits volunteers to assigned devices).
  const { data: passports } = completedIds.length
    ? await supabase.from("devices").select("id, passport_code, make, model, status, refurbished_at, batch_line_items(quantity)").in("id", completedIds).order("refurbished_at", { ascending: false })
    : { data: [] };
  const list = passports ?? [];
  const uniform = list.filter((p) => isUniformQuantity(p.batch_line_items?.quantity)).length;
  const hours = estimateHours(uniform, completedIds.length - uniform, settings.refurbMinutes);
  const publicUrl = profile.public_profile_opt_in && profile.public_handle ? `/v/${profile.public_handle}` : null;

  return (
    <>
      <WalletSync />
      <PageHeader
        eyebrow="Skills Wallet"
        title={`${profile.display_first_name ?? "Your"}'s bench record`}
        description="Real, verifiable hands-on IT experience. Link it from your résumé or LinkedIn."
        actions={
          publicUrl ? (
            <Link href={publicUrl} className="glass inline-flex h-11 items-center gap-2 rounded-full px-5 text-small font-semibold">
              Public profile <ExternalLink className="size-4" aria-hidden />
            </Link>
          ) : (
            <Link href="/volunteer/settings" className="text-small font-semibold text-loop-deep underline underline-offset-4">
              Turn on your public profile
            </Link>
          )
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatPebble label="Devices refurbished" value={stats.finalQa} tint="butter" size="lg" className="sm:row-span-2" caption="Each one passed final QA." />
        <StatPebble label="Hours contributed (est.)" value={hours} decimals={hours % 1 ? 1 : 0} />
        <StatPebble label="Hardware tests" value={byStep("hardware_test")} />
        <StatPebble label="Wipes verified by staff" value={stats.verifiedWipes} />
        <StatPebble label="Open-source installs" value={stats.openSourceInstalls} />
      </div>

      <section aria-labelledby="badges" className="mt-12">
        <h2 id="badges" className="text-title font-semibold">
          Badges
        </h2>
        <ul className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-7">
          {BADGES.map((b) => {
            const p = badgeProgress(stats, b);
            return (
              <li key={b.slug} title={b.description}>
                <BadgeCoin slug={b.slug} name={b.name} unlocked={heldSlugs.has(b.slug)} progress={p.value} threshold={b.criterionType === "manual" ? 1 : p.threshold} />
                <p className="mt-1 text-center text-[0.75rem] text-ink-3">{b.criterionType === "manual" ? "Awarded by staff" : b.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="passports" className="mt-14">
        <h2 id="passports" className="text-title font-semibold">
          Device Passports you&apos;re on
        </h2>
        <p className="text-small text-ink-2">{profile.attribution_opt_in ? "Buyers see your first name on these." : "Your name is hidden on passports — turn it on in Privacy."}</p>
        {list.length === 0 ? (
          <EmptyState title="Your first passport is one device away." tone="butter" />
        ) : (
          <ul className="-mx-4 mt-5 flex snap-x gap-4 overflow-x-auto px-4 pb-4">
            {list.map((p) => (
              <li key={p.id} className="w-56 shrink-0 snap-start">
                <ClayCard tint="apricot" href={`/p/${p.passport_code}`} aria-label={`Open Device Passport ${p.passport_code}`} className="flex h-40 flex-col justify-between !p-5">
                  <p className="font-mono text-[0.8125rem] text-ink-2">{p.passport_code}</p>
                  <div>
                    <p className="font-semibold leading-tight">
                      {p.make} {p.model}
                    </p>
                    <p className="text-[0.8125rem] text-ink-2">
                      {p.status === "sold" ? "In a new home" : labels.deviceStatus[p.status]} · {longDate(p.refurbished_at)}
                    </p>
                  </div>
                </ClayCard>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
