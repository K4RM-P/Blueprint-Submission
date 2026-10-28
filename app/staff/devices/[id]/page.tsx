import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightLeft, CircleDot, HandCoins, Receipt, StickyNote, UserRound, Wrench } from "lucide-react";
import { ClayCard, FlatCard } from "@/components/clay";
import { DeviceStatusChip } from "@/components/journey/status";
import { PageHeader } from "@/components/shell/page-header";
import { DeviceOps } from "@/components/staff/device-ops";
import { PassportQrCard } from "@/components/journey/passport-qr";
import { requireRole } from "@/lib/auth";
import { listVolunteers, money } from "@/lib/queries/staff";
import { labels } from "@/lib/domain";
import { longDate } from "@/lib/dates";

export const metadata: Metadata = { title: "Device" };

const EVENT_ICON = { status_change: ArrowRightLeft, step_completed: Wrench, assigned: UserRound, note: StickyNote, sale: Receipt, subsidy: HandCoins } as const;

export default async function StaffDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireRole("staff");
  const { data: d } = await supabase.from("devices").select("*, donation_batches(id, organizations(name))").eq("id", id).maybeSingle();
  if (!d) notFound();
  const [{ data: events }, volunteers, { data: fund }] = await Promise.all([
    supabase.from("device_events").select("id, created_at, event_type, from_status, to_status, step, note, actor_id").eq("device_id", id).order("created_at", { ascending: false }),
    listVolunteers(supabase),
    supabase.rpc("public_fund_summary"),
  ]);
  const actorIds = [...new Set((events ?? []).map((e) => e.actor_id).filter(Boolean))] as string[];
  const { data: actors } = actorIds.length ? await supabase.from("profiles").select("id, full_name, role").in("id", actorIds) : { data: [] };
  const actorName = new Map((actors ?? []).map((a) => [a.id, `${a.full_name} (${a.role})`]));
  const name = (uid: string | null) => (uid ? (actorName.get(uid) ?? volunteers.find((v) => v.id === uid)?.full_name ?? "—") : "—");

  const spec = [
    ["Category", labels.category[d.category]],
    ["Year", d.approx_year ?? "—"],
    ["CPU", d.cpu ?? "—"],
    ["RAM", d.ram_gb ? `${d.ram_gb} GB` : "—"],
    ["Storage", d.storage_gb ? `${d.storage_gb} GB` : "—"],
    ["Serial", d.serial_number ?? "—"],
    ["Source", d.donation_batches?.organizations?.name ?? "Household"],
    ["Price", money(d.price_cents)],
  ];
  const security = [
    ["Wipe method", d.wipe_method ?? "—"],
    ["Report ID", d.wipe_report_ref ?? "—"],
    ["Wipe performed by", name(d.wipe_performed_by)],
    ["Verified by", d.wipe_verified_at ? `${name(d.wipe_verified_by)} · ${longDate(d.wipe_verified_at)}` : "Not verified"],
    ["OS installed", d.os_installed ? `${d.os_installed}${d.is_open_source_os ? " (open source)" : ""}` : "—"],
    ["Refurbished by", d.refurbished_at ? `${name(d.refurbished_by)} · ${longDate(d.refurbished_at)}` : "—"],
  ];

  return (
    <>
      <p className="mb-4 text-small">
        <Link href="/staff/devices" className="font-medium text-loop-deep underline-offset-4 hover:underline">
          ← Devices
        </Link>
      </p>
      <PageHeader
        eyebrow={d.passport_code}
        title={`${d.make} ${d.model}`}
        description={
          d.status === "sold"
            ? `Sold ${longDate(d.sold_at)} · ${d.sale_channel ? labels.channel[d.sale_channel] : ""} · ${d.recipient_category ? labels.recipient[d.recipient_category] : "recipient not recorded"}${d.pif_subsidy_cents ? ` · PIF subsidy ${money(d.pif_subsidy_cents)}` : ""}.`
            : d.status === "recycled"
              ? `Recycled: ${d.recycled_reason}`
              : `From ${d.donation_batches?.organizations?.name ?? "a household"} · passport opened ${d.passport_views} time${d.passport_views === 1 ? "" : "s"}`
        }
        actions={<DeviceStatusChip status={d.status} />}
      />
      <ClayCard material="glass" className="mb-6">
        <DeviceOps
          id={d.id}
          status={d.status}
          priceCents={d.price_cents}
          reportRef={d.wipe_report_ref}
          assignedId={d.assigned_volunteer_id}
          volunteers={volunteers}
          fundBalanceCents={Number((fund as { balance_cents?: number } | null)?.balance_cents ?? 0)}
        />
      </ClayCard>
      <PassportQrCard code={d.passport_code} deviceId={d.id} className="mb-6" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <FlatCard>
            <h2 className="font-semibold">Specs</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-small">
              {spec.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-ink-2">{k}</dt>
                  <dd className={k === "Serial" ? "font-mono" : "font-medium"}>
                    {k === "Source" && d.donation_batches ? (
                      <Link href={`/staff/batches/${d.donation_batches.id}`} className="text-loop-deep underline-offset-4 hover:underline">
                        {v}
                      </Link>
                    ) : (
                      v
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </FlatCard>
          <FlatCard>
            <h2 className="font-semibold">Data security &amp; refurbishment</h2>
            <dl className="mt-3 grid gap-y-3 text-small">
              {security.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-ink-2">{k}</dt>
                  <dd className={k === "Report ID" ? "text-right font-mono" : "text-right font-medium"}>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[0.8125rem] text-ink-3">Report IDs and serials are private — never shown on the public passport.</p>
          </FlatCard>
        </div>
        <section aria-labelledby="custody" className="flat min-w-0 p-6">
          <h2 id="custody" className="font-semibold">
            Chain of custody
          </h2>
          <p className="text-small text-ink-2">Append-only. Nobody — including staff — can edit or delete these entries.</p>
          <ol className="mt-5 flex flex-col">
            {(events ?? []).map((e) => {
              const Icon = EVENT_ICON[e.event_type] ?? CircleDot;
              const text =
                e.event_type === "status_change"
                  ? e.from_status
                    ? `${labels.deviceStatus[e.from_status]} → ${labels.deviceStatus[e.to_status!]}`
                    : `Created as ${labels.deviceStatus[e.to_status!]}`
                  : e.event_type === "step_completed" && e.step
                    ? `Step done: ${labels.step[e.step as keyof typeof labels.step] ?? e.step}`
                    : (e.note ?? e.event_type);
              return (
                <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
                  <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-28px)] w-px bg-line" />
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint text-loop-deep">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0 text-small">
                    <p className="font-medium text-ink">{text}</p>
                    {e.note && e.note !== text ? <p className="text-ink-2">{e.note}</p> : null}
                    <p className="text-ink-3 tnum">
                      {new Date(e.created_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" })} · {name(e.actor_id)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </>
  );
}
