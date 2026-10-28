"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardPaste, Save } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { DeviceStatusChip } from "@/components/journey/status";
import type { DeviceStatus } from "@/lib/domain";
import { saveDeviceSpecs } from "@/server/actions/staff";
import { matchInOrder, parseList } from "@/lib/bulk-entry";

interface Row {
  id: string;
  passport_code: string;
  make: string;
  model: string;
  status: DeviceStatus;
  serial_number: string | null;
  cpu: string | null;
  ram_gb: number | null;
  storage_gb: number | null;
}

const cell = "h-10 w-full rounded-[10px] border border-transparent bg-[#f7f4ee] px-2.5 text-[0.875rem] shadow-[inset_2px_2px_5px_rgba(90,75,55,.1)] focus-visible:border-loop";

/** OPS-04: edit serials/specs for many devices at once after bulk-add, or paste/scan every serial in one go. */
export function SerialGrid({ devices }: { devices: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(devices);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const set = (id: string, patch: Partial<Row>) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setDirty((d) => new Set(d).add(id));
  };
  const [paste, setPaste] = useState("");
  const pasted = parseList(paste);
  // Pasted serials fill the devices that don't have one yet, top to bottom.
  const open = rows.filter((r) => !r.serial_number);
  const plan = matchInOrder(open, pasted);
  const applyPaste = async () => {
    if (plan.assigned.length === 0) return;
    setBusy(true);
    const byId = new Map(plan.assigned.map((a) => [a.item.id, a.value]));
    const next = rows.map((r) => (byId.has(r.id) ? { ...r, serial_number: byId.get(r.id)! } : r));
    const res = await saveDeviceSpecs({
      rows: next.filter((r) => byId.has(r.id) || dirty.has(r.id)).map((r) => ({ id: r.id, serial: r.serial_number ?? "", cpu: r.cpu ?? "", ramGb: r.ram_gb, storageGb: r.storage_gb })),
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setRows(next);
    setDirty(new Set());
    setPaste("");
    toast.success(`${plan.assigned.length} serial${plan.assigned.length === 1 ? "" : "s"} saved${plan.extra.length ? ` · ${plan.extra.length} extra ignored` : ""}.`);
    router.refresh();
  };
  const num = (v: string) => (v === "" ? null : Math.max(0, Math.round(Number(v)) || 0));
  const save = async () => {
    setBusy(true);
    const res = await saveDeviceSpecs({
      rows: rows.filter((r) => dirty.has(r.id)).map((r) => ({ id: r.id, serial: r.serial_number ?? "", cpu: r.cpu ?? "", ramGb: r.ram_gb, storageGb: r.storage_gb })),
    });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Saved.");
    setDirty(new Set());
    router.refresh();
  };
  return (
    <div className="flat overflow-hidden !p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="font-semibold">Devices ({rows.length})</h2>
          <p className="text-small text-ink-2">Serials are optional at intake. They appear on the certificate, never on public passports.</p>
        </div>
        <ClayButton variant="secondary" size="sm" icon={<Save />} disabled={dirty.size === 0} loading={busy} onClick={save}>
          Save {dirty.size || ""} change{dirty.size === 1 ? "" : "s"}
        </ClayButton>
      </div>
      {open.length > 0 ? (
        <div className="border-t border-line px-5 py-4">
          <label htmlFor="serial-paste" className="text-[0.9375rem] font-medium">
            Paste or scan serials
          </label>
          <p id="serial-paste-hint" className="text-small text-ink-2">
            One per line, in the order of the list below. A barcode scanner works too: each scan ends with Enter. They fill the {open.length} device{open.length === 1 ? "" : "s"} without a serial, top to bottom.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
            <textarea id="serial-paste" aria-describedby="serial-paste-hint" rows={3} className="field-input min-h-24 flex-1 font-mono text-[0.875rem]" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={"5CD1234ABC\n5CD1234ABD\n…"} />
            <ClayButton variant="secondary" size="sm" icon={<ClipboardPaste />} disabled={plan.assigned.length === 0} loading={busy} onClick={applyPaste}>
              {plan.assigned.length > 0 ? `Save ${plan.assigned.length} serial${plan.assigned.length === 1 ? "" : "s"}` : "Save serials"}
            </ClayButton>
          </div>
          {pasted.length > 0 ? (
            <p className="mt-2 text-small text-ink-2" aria-live="polite">
              {plan.assigned.length} matched
              {plan.missing.length ? ` · ${plan.missing.length} device${plan.missing.length === 1 ? "" : "s"} still without a serial` : ""}
              {plan.extra.length ? ` · ${plan.extra.length} extra will be ignored` : ""}
              {plan.duplicates.length ? ` · scanned twice: ${plan.duplicates.join(", ")}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="max-h-[560px] overflow-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Passport</th>
              <th scope="col">Status</th>
              <th scope="col">Serial</th>
              <th scope="col">CPU</th>
              <th scope="col">RAM GB</th>
              <th scope="col">Storage GB</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/staff/devices/${r.id}`} className="font-mono text-[0.8125rem] text-loop-deep underline-offset-4 hover:underline">
                    {r.passport_code}
                  </Link>
                </td>
                <td>
                  <DeviceStatusChip status={r.status} />
                </td>
                <td className="min-w-40">
                  <input aria-label={`Serial for ${r.passport_code}`} className={`${cell} font-mono`} value={r.serial_number ?? ""} onChange={(e) => set(r.id, { serial_number: e.target.value })} />
                </td>
                <td className="min-w-44">
                  <input aria-label={`CPU for ${r.passport_code}`} className={cell} value={r.cpu ?? ""} onChange={(e) => set(r.id, { cpu: e.target.value })} />
                </td>
                <td className="w-24">
                  <input aria-label={`RAM for ${r.passport_code}`} inputMode="numeric" className={cell} value={r.ram_gb ?? ""} onChange={(e) => set(r.id, { ram_gb: num(e.target.value) })} />
                </td>
                <td className="w-28">
                  <input aria-label={`Storage for ${r.passport_code}`} inputMode="numeric" className={cell} value={r.storage_gb ?? ""} onChange={(e) => set(r.id, { storage_gb: num(e.target.value) })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
