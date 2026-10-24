import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, StatPebble, StatusChip } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { FundEntry } from "@/components/staff/fund-entry";
import { requireRole } from "@/lib/auth";
import { longDate } from "@/lib/dates";
import { formatCents, fundBalance, type FundTxType } from "@/lib/ledger";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pay-It-Forward fund" };

const TYPE_LABEL: Record<FundTxType, string> = { contribution: "Contribution", subsidy: "Subsidy", sponsorship: "Sponsorship" };
const FILTERS = ["all", "contribution", "sponsorship", "subsidy"] as const;
type Filter = (typeof FILTERS)[number];

/** PIF-03: contributions in, subsidies out. The balance is guarded in the database too. */
export default async function StaffFund({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const sp = await searchParams;
  const filter: Filter = (FILTERS as readonly string[]).includes(sp.type ?? "") ? (sp.type as Filter) : "all";
  const { supabase } = await requireRole("staff");
  const [{ data: txs }, { data: orgs }] = await Promise.all([
    supabase.from("fund_transactions").select("id, created_at, type, amount_cents, provider, note, organizations(name), devices(id, passport_code, make, model)").order("created_at", { ascending: false }),
    supabase.from("organizations").select("id, name").order("name"),
  ]);
  const all = txs ?? [];
  const balance = fundBalance(all.map((t) => ({ type: t.type, amountCents: t.amount_cents })));
  const raised = all.filter((t) => t.amount_cents > 0).reduce((s, t) => s + t.amount_cents, 0);
  const subsidies = all.filter((t) => t.type === "subsidy");
  const spent = -subsidies.reduce((s, t) => s + t.amount_cents, 0);
  const rows = filter === "all" ? all : all.filter((t) => t.type === filter);

  return (
    <>
      <PageHeader eyebrow="Staff Console" title="Pay-It-Forward fund" description="Every dollar in and every subsidy out. Subsidies are applied when you record a sale." actions={<FundEntry partners={orgs ?? []} />} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatPebble tint="apricot" label="Balance available" value={Math.round(balance / 100)} prefix="$" caption={formatCents(balance)} />
        <StatPebble label="Raised all time" value={Math.round(raised / 100)} prefix="$" />
        <StatPebble label="Applied as subsidies" value={Math.round(spent / 100)} prefix="$" />
        <StatPebble label="Devices made cheaper" value={subsidies.length} />
      </div>

      <nav aria-label="Filter ledger" className="mt-10 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/staff/fund" : `/staff/fund?type=${f}`}
            aria-current={filter === f ? "page" : undefined}
            className={cn("chip h-9 border border-line px-4", filter === f ? "bg-ink text-white" : "bg-surface-flat text-ink-2 hover:bg-canvas")}
          >
            {f === "all" ? "All" : `${TYPE_LABEL[f]}s`}
          </Link>
        ))}
      </nav>

      <div className="mt-4">
        {rows.length === 0 ? (
          <EmptyState title="Nothing here yet." tone="butter">
            Contributions from /pay-it-forward and store round-ups appear here as they arrive.
          </EmptyState>
        ) : (
          <div className="flat overflow-x-auto !p-0">
            <table className="data-table">
              <caption className="sr-only">Fund ledger</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Type</th>
                  <th scope="col">Details</th>
                  <th scope="col">Via</th>
                  <th scope="col" className="text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap text-small text-ink-2">{longDate(t.created_at)}</td>
                    <td>
                      <StatusChip tone={t.type === "subsidy" ? "sky" : t.type === "sponsorship" ? "apricot" : "mint"}>{TYPE_LABEL[t.type]}</StatusChip>
                    </td>
                    <td>
                      <span>{t.note ?? "—"}</span>
                      {t.organizations?.name ? <span className="block text-[0.8125rem] text-ink-2">{t.organizations.name}</span> : null}
                      {t.devices ? (
                        <Link href={`/staff/devices/${t.devices.id}`} className="block font-mono text-[0.8125rem] text-loop-deep underline-offset-4 hover:underline">
                          {t.devices.passport_code} · {t.devices.make} {t.devices.model}
                        </Link>
                      ) : null}
                    </td>
                    <td className="text-small capitalize text-ink-2">{t.provider}</td>
                    <td className={cn("text-right font-semibold tnum", t.amount_cents < 0 ? "text-ink-2" : "text-loop-deep")}>
                      {t.amount_cents > 0 ? "+" : "−"}
                      {formatCents(Math.abs(t.amount_cents))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
