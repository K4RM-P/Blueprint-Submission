"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { ClipboardCheck, HardDrive, MonitorCog, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Checkbox, ClayButton, ClayToggle, Field, FlatCard, Input } from "@/components/clay";
import { HoldToConfirm } from "@/components/liquid";
import { CHECKLIST_STEPS, labels, type ChecklistStep } from "@/lib/domain";
import { parseList } from "@/lib/bulk-entry";
import { completeStepBulk, type AwardedBadge } from "@/server/actions/volunteer";
import { BadgeCelebration } from "./badge-celebration";

export interface SetDevice {
  id: string;
  passport_code: string;
  done: ChecklistStep[];
}

const ICON: Record<ChecklistStep, React.ReactNode> = {
  hardware_test: <Stethoscope />,
  wipe_performed: <HardDrive />,
  os_installed: <MonitorCog />,
  final_qa: <ClipboardCheck />,
};

const nextOf = (d: SetDevice) => CHECKLIST_STEPS.find((s) => !d.done.includes(s)) ?? null;

/**
 * VW-02 for identical devices: select several and finish steps that need no
 * per-device data (hardware test, OS install, final QA) in one tap. The data
 * wipe still records one sanitization reference per device: paste a list
 * (matched top to bottom) or scan, and each scan's Enter jumps to the next device.
 */
export function BatchChecklist({ devices: initial }: { devices: SetDevice[] }) {
  const router = useRouter();
  const [devices, setDevices] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set(initial.map((d) => d.id)));
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [os, setOs] = useState("Linux Mint 22");
  const [openSource, setOpenSource] = useState(true);
  const [busy, setBusy] = useState<ChecklistStep | null>(null);
  const [badges, setBadges] = useState<AwardedBadge[]>([]);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const at = (step: ChecklistStep) => devices.filter((d) => selected.has(d.id) && nextOf(d) === step);
  const wipeRows = at("wipe_performed");
  const allDone = devices.every((d) => nextOf(d) === null);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const run = async (step: ChecklistStep) => {
    const rows = at(step);
    if (rows.length === 0) return;
    setBusy(step);
    const res = await completeStepBulk({
      step,
      items: rows.map((d) => ({ deviceId: d.id, reportRef: step === "wipe_performed" ? (refs[d.id] ?? "").trim() : undefined })),
      os: step === "os_installed" ? os : undefined,
      openSource,
    });
    setBusy(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const done = new Set(res.data.done);
    setDevices((all) => all.map((d) => (done.has(d.id) ? { ...d, done: [...d.done, step] } : d)));
    toast.success(step === "wipe_performed" ? `${res.message} Staff will verify each wipe.` : res.message);
    if (res.data.badges.length) setBadges(res.data.badges);
    router.refresh();
  };

  // Scanners type the reference and press Enter: move to the next device's field.
  const onKey = (e: KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const next = wipeRows[i + 1];
    if (next) inputs.current[next.id]?.focus();
  };
  // Pasting a list into any field fills that device and the ones below it, in order.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>, i: number) => {
    const list = parseList(e.clipboardData.getData("text"));
    if (list.length < 2) return;
    e.preventDefault();
    setRefs((r) => {
      const n = { ...r };
      wipeRows.slice(i).forEach((d, k) => {
        if (list[k]) n[d.id] = list[k];
      });
      return n;
    });
    toast(`${Math.min(list.length, wipeRows.length - i)} references filled in order.`);
  };
  const filled = wipeRows.filter((d) => (refs[d.id] ?? "").trim()).length;

  const stepButton = (step: ChecklistStep, label: string) => {
    const n = at(step).length;
    if (n === 0) return null;
    return (
      <FlatCard className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-3 font-semibold [&_svg]:size-5 [&_svg]:text-loop-deep">
          {ICON[step]} {labels.step[step]}
        </span>
        <ClayButton variant="secondary" loading={busy === step} disabled={busy !== null} onClick={() => run(step)}>
          {label} · {n} device{n === 1 ? "" : "s"}
        </ClayButton>
      </FlatCard>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <FlatCard>
        <h2 className="font-semibold">Devices in this set</h2>
        <p className="text-small text-ink-2">All selected. Untick any device that needs its own attention, then open it on its own.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {devices.map((d) => {
            const next = nextOf(d);
            return (
              <li key={d.id}>
                <Checkbox
                  checked={selected.has(d.id)}
                  onChange={() => toggle(d.id)}
                  label={<span className="font-mono text-[0.875rem]">{d.passport_code}</span>}
                  description={next ? `Next: ${labels.step[next]}` : "All four steps done"}
                />
              </li>
            );
          })}
        </ul>
      </FlatCard>

      {stepButton("hardware_test", "Hardware test passed")}

      {wipeRows.length > 0 ? (
        <div className="clay flex flex-col gap-4 p-5" data-tint="sky">
          <div>
            <p className="text-lg font-semibold">{labels.step.wipe_performed}</p>
            <p className="text-small text-ink-2">
              Enter the report/reference ID from your sanitization software for each device. Paste a whole list into the first field (matched top to bottom), or scan: each scan moves to the next device.
            </p>
          </div>
          <ol className="flex flex-col gap-2">
            {wipeRows.map((d, i) => (
              <li key={d.id}>
                <Field label={`Reference for ${d.passport_code}`}>
                  {({ id }) => (
                    <Input
                      id={id}
                      ref={(el) => {
                        inputs.current[d.id] = el;
                      }}
                      className="font-mono"
                      autoComplete="off"
                      enterKeyHint="next"
                      value={refs[d.id] ?? ""}
                      onChange={(e) => setRefs((r) => ({ ...r, [d.id]: e.target.value }))}
                      onKeyDown={(e) => onKey(e, i)}
                      onPaste={(e) => onPaste(e, i)}
                    />
                  )}
                </Field>
              </li>
            ))}
          </ol>
          <HoldToConfirm
            label={`Hold to confirm ${wipeRows.length} wipe${wipeRows.length === 1 ? "" : "s"}`}
            hint={filled === wipeRows.length ? "Press and hold for about a second" : `${wipeRows.length - filled} reference${wipeRows.length - filled === 1 ? "" : "s"} to go`}
            disabled={filled !== wipeRows.length || busy !== null}
            icon={<HardDrive />}
            onConfirm={() => run("wipe_performed")}
          />
        </div>
      ) : null}

      {at("os_installed").length > 0 ? (
        <FlatCard className="flex flex-col gap-4">
          <span className="flex items-center gap-3 font-semibold [&_svg]:size-5 [&_svg]:text-loop-deep">
            {ICON.os_installed} {labels.step.os_installed}
          </span>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="Operating system">{({ id }) => <Input id={id} value={os} onChange={(e) => setOs(e.target.value)} />}</Field>
            <ClayButton variant="secondary" loading={busy === "os_installed"} disabled={busy !== null || os.trim().length === 0} onClick={() => run("os_installed")}>
              Mark installed · {at("os_installed").length}
            </ClayButton>
          </div>
          <ClayToggle checked={openSource} onCheckedChange={setOpenSource} label="Open-source OS" description="Counts toward the Open Source Installer badge." />
        </FlatCard>
      ) : null}

      {stepButton("final_qa", "Final QA passed")}

      {allDone ? (
        <p role="status" className="glass rounded-[20px] p-4">
          <span className="font-semibold">Handed to staff.</span> They&apos;ll verify each data wipe, then these laptops are ready for their next owners.
        </p>
      ) : null}
      <BadgeCelebration badges={badges} onClose={() => setBadges([])} />
    </div>
  );
}
