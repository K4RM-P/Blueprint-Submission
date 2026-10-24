import type { Metadata } from "next";
import { Download } from "lucide-react";
import { ClayButton } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { TierSelect } from "@/components/staff/tier-select";
import { requireRole } from "@/lib/auth";
import { longDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Partners" };

export default async function StaffPartners() {
  const { supabase } = await requireRole("staff");
  const { data } = await supabase
    .from("organizations")
    .select("id, name, industry, tier, membership_started_at, membership_expires_at, wall_opt_in, created_at, donation_batches(id, status, devices(id, status))")
    .order("name");
  const orgs = (data ?? []).map((o) => {
    const devices = o.donation_batches.flatMap((b) => b.devices);
    return { ...o, batches: o.donation_batches.length, devices: devices.length, reused: devices.filter((d) => d.status === "sold").length };
  });
  return (
    <>
      <PageHeader
        eyebrow="Staff Console"
        title="Partners"
        description={`${orgs.length} organizations · ${orgs.filter((o) => o.tier !== "community").length} paying members.`}
        actions={
          <ClayButton href="/api/export/batches" variant="ghost" icon={<Download />} prefetch={false}>
            Batches CSV
          </ClayButton>
        }
      />
      <div className="flat overflow-x-auto !p-0">
        <table className="data-table">
          <caption className="sr-only">Partner organizations</caption>
          <thead>
            <tr>
              <th scope="col">Organization</th>
              <th scope="col">Tier</th>
              <th scope="col">Membership</th>
              <th scope="col" className="text-right">Batches</th>
              <th scope="col" className="text-right">Devices</th>
              <th scope="col" className="text-right">Reused</th>
              <th scope="col">Wall</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id}>
                <td>
                  <span className="font-semibold">{o.name}</span>
                  <span className="block text-[0.8125rem] text-ink-2">
                    {o.industry ?? "—"} · since {longDate(o.created_at)}
                  </span>
                </td>
                <td>
                  <TierSelect orgId={o.id} tier={o.tier} name={o.name} />
                </td>
                <td className="text-small text-ink-2">{o.membership_expires_at ? `${longDate(o.membership_started_at)} → ${longDate(o.membership_expires_at)}` : "Free tier"}</td>
                <td className="text-right">{o.batches}</td>
                <td className="text-right">{o.devices}</td>
                <td className="text-right font-semibold">{o.reused}</td>
                <td>{o.wall_opt_in ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
