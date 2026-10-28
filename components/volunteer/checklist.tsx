"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { Check, ClipboardCheck, HardDrive, Lock, MonitorCog, ShieldCheck, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, ClayToggle, Field, Input, Textarea } from "@/components/clay";
import { FlowLine, HoldToConfirm } from "@/components/liquid";
import { Stamp } from "@/components/clay/stamp";
import { Seal } from "@/components/clay/seal";
import { ClayBaton } from "@/components/illustrations/clay-baton";
import { CHECKLIST_STEPS, labels, type ChecklistStep, type DeviceStatus } from "@/lib/domain";
import { useMotionPrefs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { completeStep, flagForStaff, type AwardedBadge } from "@/server/actions/volunteer";
import { BadgeCelebration } from "./badge-celebration";

const ICON: Record<ChecklistStep, React.ReactNode> = {
  hardware_test: <Stethoscope />,
  wipe_performed: <HardDrive />,
  os_installed: <MonitorCog />,
  final_qa: <ClipboardCheck />,
};

const HINT: Record<ChecklistStep, string> = {
  hardware_test: "Power on, check screen, keyboard, battery, ports and drive health.",
  wipe_performed: "Run the wipe in FGT's sanitization software, then enter its report ID.",
  os_installed: "Default is an open-source OS like Linux Mint.",
  final_qa: "Boots cleanly, Wi-Fi works, clean case, charger packed.",
};

/** VW-02: four huge stacked tiles; the wipe step uses hold-to-confirm (§9.6). */
export function Checklist({ deviceId, initialDone, status }: { deviceId: string; initialDone: ChecklistStep[]; status: DeviceStatus }) {
  const router = useRouter();
  const { t, reduced } = useMotionPrefs();
  const [done, setDone] = useState<Set<ChecklistStep>>(new Set(initialDone));
  const [busy, setBusy] = useState<ChecklistStep | null>(null);
  const [reportRef, setReportRef] = useState("");
  const [os, setOs] = useState("Linux Mint 22");
  const [openSource, setOpenSource] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [badges, setBadges] = useState<AwardedBadge[]>([]);
  // Steps finished in this visit get the stamp moments; steps done earlier just show their state.
  const [fresh, setFresh] = useState<Set<ChecklistStep>>(new Set());
  // The hardware test's failure branch: tell staff instead of completing the step.
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagNote, setFlagNote] = useState("");
  const [flagged, setFlagged] = useState(false);
  const sendFlag = async () => {
    setBusy("hardware_test");
    const res = await flagForStaff({ deviceId, note: flagNote });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    toast.success(res.message ?? "Sent to staff.");
    setFlagged(true);
    setFlagOpen(false);
    router.refresh();
  };

  const next = CHECKLIST_STEPS.find((s) => !done.has(s)) ?? null;

  const run = async (step: ChecklistStep) => {
    setBusy(step);
    setErrors({});
    const res = await completeStep({ deviceId, step, reportRef: step === "wipe_performed" ? reportRef : undefined, os: step === "os_installed" ? os : undefined, openSource });
    setBusy(null);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
      return;
    }
    setDone((d) => new Set(d).add(step));
    setFresh((f) => new Set(f).add(step));
    toast.success(step === "wipe_performed" ? "Wipe recorded. Staff will verify it." : `${labels.step[step]} done.`);
    if (res.data.badges.length) setBadges(res.data.badges);
    router.refresh();
  };

  return (
    <>
      <FlowLine progress={done.size / CHECKLIST_STEPS.length} scrollLinked={false}>
        <ol className="flex flex-col gap-4">
          {CHECKLIST_STEPS.map((step, i) => {
            const isDone = done.has(step);
            const locked = !isDone && step !== next;
            return (
              <motion.li key={step} layout={!reduced} transition={t("soft")} className="flex gap-3">
                <div className="pt-4">
                  <Stamp icon={isDone ? <Check /> : ICON[step]} label="" tint={isDone ? "mint" : "porcelain"} done={isDone} />
                </div>
                <div className="min-w-0 flex-1">
                  {step === "wipe_performed" && !isDone && !locked ? (
                    <div className="clay flex flex-col gap-4 p-5" data-tint="sky">
                      <div>
                        <p className="text-lg font-semibold">
                          {i + 1}. {labels.step[step]}
                        </p>
                        <p className="text-small text-ink-2">{HINT[step]}</p>
                      </div>
                      <Field label="Sanitization report ID" error={errors.reportRef} hint="The reference for this drive in the wipe software, e.g. RPT-482913.">
                        {({ id, describedBy, invalid }) => <Input id={id} className="font-mono" value={reportRef} onChange={(e) => setReportRef(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
                      </Field>
                      <HoldToConfirm label="Hold to confirm wipe" hint={reportRef.trim() ? "Press and hold for about a second" : "Enter the report ID first"} disabled={!reportRef.trim() || busy !== null} icon={<HardDrive />} onConfirm={() => run(step)} />
                    </div>
                  ) : step === "os_installed" && !isDone && !locked ? (
                    <div className="clay flex flex-col gap-4 p-5" data-tint="porcelain">
                      <p className="text-lg font-semibold">
                        {i + 1}. {labels.step[step]}
                      </p>
                      <Field label="Operating system" error={errors.os}>
                        {({ id, describedBy, invalid }) => <Input id={id} value={os} onChange={(e) => setOs(e.target.value)} aria-describedby={describedBy} aria-invalid={invalid} />}
                      </Field>
                      <ClayToggle checked={openSource} onCheckedChange={setOpenSource} label="Open-source OS" description="Counts toward the Open Source Installer badge." />
                      <button type="button" disabled={busy !== null} onClick={() => run(step)} data-tint="porcelain" className="clay-sm clay-press min-h-[60px] rounded-[20px] px-5 text-lg font-semibold disabled:opacity-60">
                        {busy === step ? "Saving…" : "Mark OS installed"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isDone || locked || busy !== null}
                      onClick={() => run(step)}
                      data-tint={isDone ? "mint" : "porcelain"}
                      aria-label={`${labels.step[step]}${isDone ? " — done" : locked ? " — finish the previous step first" : " — tap to complete"}`}
                      className={cn(
                        "relative flex min-h-[76px] w-full items-center gap-4 rounded-[var(--r-lg)] px-5 py-4 text-left",
                        isDone ? "clay clay-sunk" : locked ? "border-2 border-dashed border-line bg-surface/60 text-ink-3" : "clay clay-press lift",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-semibold text-ink">
                          {i + 1}. {labels.step[step]}
                        </span>
                        <span className="block text-small text-ink-2">{isDone ? "Done" : locked ? "Finish the step above first" : busy === step ? "Saving…" : HINT[step]}</span>
                      </span>
                      {locked ? (
                        <Lock className="size-5 shrink-0" aria-hidden />
                      ) : isDone && step === "wipe_performed" ? (
                        // Hold-to-confirm wipe (Signature Moment 10): the liquid becomes a sky seal stamped onto the card.
                        <Seal rim="DATA WIPED · FREE GEEK TORONTO · " icon={<ShieldCheck />} size={68} tilt={-9} stamp={fresh.has(step)} className="-my-3" />
                      ) : isDone ? (
                        <Check className="size-6 shrink-0 text-loop-deep" aria-hidden />
                      ) : (
                        <span className="shrink-0 text-small font-semibold text-loop-deep">Tap to complete</span>
                      )}
                    </button>
                  )}
                  {step === "hardware_test" && !isDone && !locked ? (
                    flagged ? (
                      <p role="status" className="mt-2 px-1 text-small text-ink-2">
                        Sent to staff. Leave this laptop on the shelf; they&apos;ll decide whether it&apos;s repaired or recycled.
                      </p>
                    ) : flagOpen ? (
                      <div className="mt-3 flex flex-col gap-3 rounded-[var(--r-md)] border border-line bg-surface-flat p-4">
                        <Field label="What didn't pass?" hint="Staff see this on the device's record.">
                          {({ id }) => <Textarea id={id} value={flagNote} onChange={(e) => setFlagNote(e.target.value)} placeholder="No display; battery swollen" />}
                        </Field>
                        <div className="flex gap-2.5">
                          <ClayButton size="sm" onClick={sendFlag} loading={busy === "hardware_test"} disabled={flagNote.trim().length < 5}>
                            Tell staff
                          </ClayButton>
                          <ClayButton size="sm" variant="ghost" onClick={() => setFlagOpen(false)}>
                            Cancel
                          </ClayButton>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setFlagOpen(true)} className="mt-2 min-h-11 px-1 text-small font-semibold text-loop-deep underline-offset-4 hover:underline">
                        Didn&apos;t pass? Tell staff
                      </button>
                    )
                  ) : null}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </FlowLine>
      {next === null ? (
        <div role="status" className="glass mt-6 flex items-center gap-4 overflow-hidden rounded-[20px] p-4 text-ink">
          {/* Baton handoff to staff (Signature Moment 12): your leg of the relay, handed on. */}
          <motion.span
            aria-hidden
            className="w-16 shrink-0"
            initial={fresh.size > 0 && !reduced ? { x: -90, rotate: -14, opacity: 0 } : false}
            animate={{ x: 0, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 170, damping: 18, delay: 0.2 }}
          >
            <ClayBaton />
          </motion.span>
          <p>
            {status === "wipe_pending_verification" || done.size === 4 ? (
              <>
                <span className="font-semibold">Handed to staff.</span> They&apos;ll verify the data wipe, then this device is ready for its next owner.
              </>
            ) : (
              "All steps complete."
            )}
          </p>
        </div>
      ) : null}
      <BadgeCelebration badges={badges} onClose={() => setBadges([])} />
    </>
  );
}
