"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, Check, PackageCheck, X } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, Input, Textarea } from "@/components/clay";
import { CapacityGlasses } from "@/components/liquid";
import { calendarForBatch } from "@/lib/capacity";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CapacityWeek } from "@/lib/capacity";
import { plural, type BatchStatus } from "@/lib/domain";
import { shortDate } from "@/lib/dates";
import { approveBatch, declineBatch, receiveBatch, scheduleBatch } from "@/server/actions/staff";

/** OPS-03 / OPS-04 actions for one batch. */
export function BatchOps({
  id,
  status,
  preferredWeek,
  scheduledWeek,
  quantity,
  lines = [],
  calendar: booked,
}: {
  id: string;
  status: BatchStatus;
  preferredWeek: string;
  scheduledWeek?: string | null;
  quantity: number;
  /** Declared line items, for recording what actually arrived. */
  lines?: { id: string; label: string; quantity: number }[];
  calendar: CapacityWeek[];
}) {
  // Weeks as this batch sees them, the same rule partners see (lib/capacity calendarForBatch): its own
  // devices come out of the week it already holds, then each week shows whether the batch fits.
  const ownWeek = status === "approved" || status === "scheduled" ? (scheduledWeek ?? preferredWeek) : null;
  const calendar = calendarForBatch(
    booked.map((w) => (w.week === ownWeek ? { ...w, load: Math.max(0, w.load - quantity) } : w)),
    quantity,
  );
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"decline" | "schedule" | "receive" | null>(null);
  const [arrived, setArrived] = useState<Record<string, string>>({});
  const arrivedCount = (l: { id: string; quantity: number }) => {
    const n = Number(arrived[l.id] ?? l.quantity);
    return Number.isInteger(n) && n >= 0 && n <= l.quantity ? n : null;
  };
  const arrivedValid = lines.every((l) => arrivedCount(l) !== null);
  const arrivedTotal = lines.reduce((n, l) => n + (arrivedCount(l) ?? 0), 0);
  const [reason, setReason] = useState("");
  const [week, setWeek] = useState<string>(calendar.some((w) => w.week === preferredWeek) ? preferredWeek : (calendar[0]?.week ?? ""));
  const [warning, setWarning] = useState<{ text: string; suggestion: string | null } | null>(null);
  const [override, setOverride] = useState("");

  const run = async (key: string, fn: () => Promise<{ ok: boolean; error?: string; message?: string }>) => {
    setBusy(key);
    const res = await fn();
    setBusy(null);
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong.");
      return false;
    }
    if (res.message) toast.success(res.message);
    router.refresh();
    return true;
  };

  const schedule = async () => {
    setBusy("schedule");
    const res = await scheduleBatch({ id, week, overrideNote: warning ? override || undefined : undefined });
    setBusy(null);
    if (!res.ok) return toast.error(res.error);
    if (res.data.warning && !override) {
      setWarning({ text: res.data.warning, suggestion: res.data.suggestion ?? null });
      return;
    }
    toast.success(res.message ?? "Scheduled.");
    setDialog(null);
    setWarning(null);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-3">
      {status === "submitted" ? (
        <>
          <ClayButton variant="primary" icon={<Check />} loading={busy === "approve"} onClick={() => run("approve", () => approveBatch({ id }))}>
            Approve
          </ClayButton>
          <ClayButton variant="secondary" icon={<CalendarClock />} onClick={() => setDialog("schedule")}>
            Approve &amp; schedule
          </ClayButton>
          <ClayButton variant="danger" icon={<X />} className="sm:ml-auto" onClick={() => setDialog("decline")}>
            Decline
          </ClayButton>
        </>
      ) : null}
      {status === "approved" ? (
        <ClayButton variant="primary" icon={<CalendarClock />} onClick={() => setDialog("schedule")}>
          Schedule
        </ClayButton>
      ) : null}
      {status === "approved" || status === "scheduled" ? (
        <ClayButton variant={status === "scheduled" ? "primary" : "secondary"} icon={<PackageCheck />} loading={busy === "receive"} onClick={() => run("receive", () => receiveBatch({ id }))}>
          Receive &amp; add {plural(quantity, "device")}
        </ClayButton>
      ) : null}
      {(status === "approved" || status === "scheduled") && lines.length > 0 ? (
        <ClayButton variant="ghost" onClick={() => setDialog("receive")}>
          Fewer arrived?
        </ClayButton>
      ) : null}
      {status === "scheduled" ? (
        <ClayButton variant="ghost" onClick={() => setDialog("schedule")}>
          Reschedule
        </ClayButton>
      ) : null}

      <Dialog open={dialog === "decline"} onOpenChange={(o) => setDialog(o ? "decline" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline this batch?</DialogTitle>
            <DialogDescription>The partner sees your reason, so keep it kind and specific — and point them somewhere useful.</DialogDescription>
          </DialogHeader>
          <Field label="Reason" required>
            {({ id: fid }) => <Textarea id={fid} value={reason} onChange={(e) => setReason(e.target.value)} />}
          </Field>
          <DialogFooter>
            <ClayButton
              variant="danger"
              loading={busy === "decline"}
              onClick={async () => {
                if (await run("decline", () => declineBatch({ id, reason }))) setDialog(null);
              }}
            >
              Decline batch
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "receive"} onOpenChange={(o) => setDialog(o ? "receive" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record what arrived</DialogTitle>
            <DialogDescription>Only the devices that arrived get passports. The declared numbers stay in the batch notes, and the partner sees both.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {lines.map((l) => (
              <Field key={l.id} label={l.label} hint={`${l.quantity} declared`} error={arrivedCount(l) === null ? `A whole number from 0 to ${l.quantity}.` : undefined}>
                {({ id: fid, describedBy }) => (
                  <Input
                    id={fid}
                    aria-describedby={describedBy}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={l.quantity}
                    value={arrived[l.id] ?? String(l.quantity)}
                    onChange={(e) => setArrived((a) => ({ ...a, [l.id]: e.target.value }))}
                  />
                )}
              </Field>
            ))}
          </div>
          <DialogFooter>
            <ClayButton
              variant="primary"
              icon={<PackageCheck />}
              loading={busy === "receive"}
              disabled={!arrivedValid || arrivedTotal === 0}
              onClick={async () => {
                const received = lines.map((l) => ({ lineId: l.id, count: arrivedCount(l) ?? l.quantity }));
                if (await run("receive", () => receiveBatch({ id, received }))) setDialog(null);
              }}
            >
              Receive &amp; add {plural(arrivedTotal, "device")}
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog === "schedule"}
        onOpenChange={(o) => {
          setDialog(o ? "schedule" : null);
          setWarning(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule {plural(quantity, "device")}</DialogTitle>
            <DialogDescription>
              Partner preferred the week of {shortDate(preferredWeek)}.
              {booked[0] && quantity > booked[0].capacity
                ? ` This batch is bigger than one week of bench time (about ${Math.ceil(quantity / booked[0].capacity)} weeks): pick the drop-off week and add a note on how the work is spread.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <CapacityGlasses
            label="Choose a week"
            allowFull
            weeks={calendar}
            value={week}
            onSelect={(w) => {
              setWeek(w);
              setWarning(null);
            }}
          />
          {warning ? (
            <div role="alert" className="rounded-[var(--r-sm)] bg-apricot p-4 text-small">
              <p className="font-semibold text-ember-ink">{warning.text}</p>
              {warning.suggestion ? (
                <p className="mt-1">
                  Next open week:{" "}
                  <button type="button" className="font-semibold text-loop-deep underline" onClick={() => (setWeek(warning.suggestion!), setWarning(null))}>
                    {shortDate(warning.suggestion)}
                  </button>
                </p>
              ) : null}
              <Field label="Or override with a note" className="mt-3">
                {({ id: fid }) => <Textarea id={fid} value={override} onChange={(e) => setOverride(e.target.value)} placeholder="Two volunteers adding an extra shift that week." />}
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <ClayButton variant="primary" loading={busy === "schedule"} onClick={schedule} disabled={Boolean(warning) && override.trim().length < 3}>
              {warning ? "Schedule anyway" : `Schedule week of ${week ? shortDate(week) : "—"}`}
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
