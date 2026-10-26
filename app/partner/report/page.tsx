import type { Metadata } from "next";
import { ArrowRight, FileDown } from "lucide-react";
import { ClayButton, ClayCard, StatPebble } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { ShareCard } from "@/components/partner/share-card";
import { getPartnerContext } from "@/lib/queries/partner";
import { getAnnualImpact } from "@/lib/queries/report";
import { hasFullDashboard } from "@/lib/pricing";
import { linkedInShareUrl, suggestedPost } from "@/lib/report";
import { env } from "@/lib/env";
import type { PartnerTier } from "@/lib/domain";

export const metadata: Metadata = { title: "Impact report" };

/** PP-10 annual report PDF + PP-11 LinkedIn impact card (Impact and Champion tiers). */
export default async function PartnerReportPage() {
  const { supabase, org } = await getPartnerContext();
  const tier = org.tier as PartnerTier;

  if (!hasFullDashboard(tier)) {
    return (
      <>
        <PageHeader eyebrow="Impact report" title="Show your impact to your team and clients." description="A branded annual report and a LinkedIn card with your real numbers." />
        <ClayCard tint="apricot" size="lg" className="flex max-w-2xl flex-col gap-5">
          <h2 className="text-title font-semibold">Included with Impact and Champion memberships</h2>
          <p className="text-ink-2">
            Your free Community tier already includes a certified data wipe with a certificate for every batch, a Device Passport for every laptop and an impact summary on your dashboard. Upgrade for a downloadable annual report with
            your logo and a shareable LinkedIn card.
          </p>
          <ClayButton href="/partner/membership" variant="primary" iconRight={<ArrowRight />} className="self-start">
            Compare memberships
          </ClayButton>
        </ClayCard>
      </>
    );
  }

  const { totals: t, period } = await getAnnualImpact(supabase, { ...org, tier });
  const shareTarget = `${env.siteUrl}/partners`;

  return (
    <>
      <PageHeader
        eyebrow="Impact report"
        title={`${org.name}, ${period.label}`}
        description="Numbers from the last 12 months, calculated the same way as your dashboard and our public impact page."
        actions={
          <ClayButton href="/api/reports/annual" variant="primary" icon={<FileDown />} prefetch={false}>
            Download annual report
          </ClayButton>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatPebble tint="mint" label="Devices back in use" value={t.devicesReused} />
        <StatPebble label="Devices donated" value={t.devicesReceived} />
        <StatPebble label="kg kept out of landfill" value={t.kgDiverted} suffix="kg" />
        <StatPebble label="kg CO₂e avoided (est.)" value={t.co2eAvoidedKg} />
      </div>

      <section aria-labelledby="card" className="mt-12">
        <h2 id="card" className="text-title font-semibold">
          LinkedIn impact card
        </h2>
        <p className="mt-1 text-ink-2">Share what your laptops are doing now. Edit the post however you like.</p>
        <div className="mt-6">
          <ShareCard imageUrl={`/api/og/partner/${org.id}`} shareUrl={linkedInShareUrl(shareTarget)} post={suggestedPost(org.name, t, shareTarget)} />
        </div>
      </section>
    </>
  );
}
