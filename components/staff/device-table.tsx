"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { QrCode, ShieldCheck, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { DeviceStatusChip } from "@/components/journey/status";
import { DEVICE_STATUSES, labels, type DeviceStatus } from "@/lib/domain";
import { nextDeviceStatuses } from "@/lib/status-machine";
import { useMotionPrefs } from "@/lib/motion";
import { assignVolunteer, changeStatus } from "@/server/actions/staff";
import { VerifyDialog } from "./verify-dialog";

export interface DeviceRow {
  id: string;
  passport_code: string;
  make: string;
  model: string;
  category: string;
  status: DeviceStatus;
  source: string;
  partner: string | null;
  volunteer: string | null;
  updated_at: string;
}

/** OPS-05: flat table, multi-select, dark floating bulk-action pill. Shortcuts: "/" search, "v" verify selected. */
export function DeviceTable({ rows, volunteers }: { rows: DeviceRow[]; volunteers: { id: string; full_name: string | null }[] }) {
  const router = useRouter();
  const { t } = useMotionPrefs();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const headerBox = useRef<HTMLInputElement>(null);
  const sel = useMemo(() => rows.filter((r) => selected.has(r.id)), [rows, selected]);
  const pendingSel = sel.filter((r) => r.status === "wipe_pending_verification");

  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = selected.size > 0 && selected.size < rows.length;
  }, [selected, rows.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [role=dialog]")) return;
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("device-search")?.focus();
      }
      if (e.key === "v" && pendingSel.length > 0) setVerifyOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingSel.length]);

  const toggle = (id: string) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  const commonNext = useMemo(() => {
    if (sel.length === 0) return [] as DeviceStatus[];
    return DEVICE_STATUSES.filter((st) => st !== "wipe_verified" && st !== "sold" && st !== "recycled" && sel.every((r) => nextDeviceStatuses(r.status).includes(st)));
  }, [sel]);

  const bulkStatus = async (to: DeviceStatus) => {
    setBusy(true);
    const res = await changeStatus({ ids: [...selected], to });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Updated.");
    setSelected(new Set());
    router.refresh();
  };
  const bulkAssign = async (volunteerId: string) => {
    setBusy(true);
    const res = await assignVolunteer({ ids: [...selected], volunteerId: volunteerId || null });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Assigned.");
    setSelected(new Set());
    router.refresh();
  };

  return (
    <>
      <div className="flat overflow-x-auto !p-0">
        <table className="data-table">
          <caption className="sr-only">Devices</caption>
          <thead>
            <tr>
              <th scope="col" className="w-12">
                <input
                  ref={headerBox}
                  type="checkbox"
                  aria-label="Select all devices on this page"
                  className="size-5 accent-[var(--loop)]"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={(e) => setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set())}
                />
              </th>
              <th scope="col">Passport</th>
              <th scope="col">Device</th>
              <th scope="col">Status</th>
              <th scope="col">Source</th>
              <th scope="col">Volunteer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} aria-selected={selected.has(r.id)} className={selected.has(r.id) ? "[&>td]:!bg-mint/50" : undefined}>
                <td>
                  <input type="checkbox" aria-label={`Select ${r.passport_code}`} className="size-5 accent-[var(--loop)]" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                </td>
                <td>
                  <Link href={`/staff/devices/${r.id}`} className="font-mono text-[0.875rem] text-loop-deep underline-offset-4 hover:underline">
                    {r.passport_code}
                  </Link>
                </td>
                <td className="whitespace-nowrap">
                  {r.make} {r.model}
                </td>
                <td>
                  <DeviceStatusChip status={r.status} />
                </td>
                <td className="text-ink-2">{r.partner ?? "Household"}</td>
                <td className="text-ink-2">{r.volunteer ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected.size > 0 ? (
          <motion.div
            role="toolbar"
            aria-label="Bulk actions"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={t("soft")}
            className="glass-ink fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-[28px] p-2 pl-4 lg:bottom-6"
          >
            <span className="mr-1 text-small font-semibold tnum">{selected.size} selected</span>
            {pendingSel.length > 0 ? (
              <button type="button" disabled={busy} onClick={() => setVerifyOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-loop px-4 text-small font-semibold text-white hover:bg-loop-deep">
                <ShieldCheck className="size-4" aria-hidden /> Verify {pendingSel.length} wipe{pendingSel.length === 1 ? "" : "s"} <kbd className="ml-1 rounded bg-white/20 px-1.5 text-[0.7rem]">v</kbd>
              </button>
            ) : null}
            {commonNext.length > 0 ? (
              <label className="inline-flex items-center gap-1.5 text-small">
                <span className="sr-only">Move to status</span>
                <select disabled={busy} defaultValue="" onChange={(e) => e.target.value && bulkStatus(e.target.value as DeviceStatus)} className="h-10 rounded-full bg-white/10 px-3 text-white [&>option]:text-ink">
                  <option value="">Move to…</option>
                  {commonNext.map((s) => (
                    <option key={s} value={s}>
                      {labels.deviceStatus[s]}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="inline-flex items-center gap-1.5 text-small">
              <UserRound className="size-4" aria-hidden />
              <span className="sr-only">Assign volunteer</span>
              <select disabled={busy} defaultValue="-" onChange={(e) => e.target.value !== "-" && bulkAssign(e.target.value)} className="h-10 rounded-full bg-white/10 px-3 text-white [&>option]:text-ink">
                <option value="-">Assign…</option>
                <option value="">Unassign</option>
                {volunteers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.full_name}
                  </option>
                ))}
              </select>
            </label>
            <Link href={`/staff/labels?ids=${[...selected].join(",")}`} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-4 text-small font-semibold hover:bg-white/20">
              <QrCode className="size-4" aria-hidden /> Labels
            </Link>
            <button type="button" aria-label="Clear selection" onClick={() => setSelected(new Set())} className="ml-auto grid size-10 place-items-center rounded-full hover:bg-white/10">
              <X className="size-4" aria-hidden />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <VerifyDialog
        ids={pendingSel.map((r) => r.id)}
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        onDone={() => {
          setSelected(new Set());
          router.refresh();
        }}
      />
    </>
  );
}
