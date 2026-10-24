"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { DeviceStatusChip } from "@/components/journey/status";
import type { DeviceStatus } from "@/lib/domain";
import { saveDeviceSpecs } from "@/server/actions/staff";

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

/** OPS-04: edit serials/specs for many devices at once after bulk-add. */
export function SerialGrid({ devices }: { devices: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(devices);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const set = (id: string, patch: Partial<Row>) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setDirty((d) => new Set(d).add(id));
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
