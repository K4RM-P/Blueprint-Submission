"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BadgeDollarSign, MessageSquarePlus, Recycle, ShieldCheck, Tag } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, Input, Select, Textarea } from "@/components/clay";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PIF_ELIGIBLE_RECIPIENTS, RECIPIENT_CATEGORIES, SALE_CHANNELS, labels, type DeviceStatus, type RecipientCategory, type SaleChannel } from "@/lib/domain";
import { nextDeviceStatuses } from "@/lib/status-machine";
import { formatCents } from "@/lib/ledger";
import { addNote, assignVolunteer, changeStatus, recordSale, setPrice } from "@/server/actions/staff";
import { VerifyDialog } from "./verify-dialog";

interface Props {
  id: string;
  status: DeviceStatus;
  priceCents: number | null;
  reportRef: string | null;
  assignedId: string | null;
  volunteers: { id: string; full_name: string | null }[];
  fundBalanceCents: number;
}

type DialogKind = "verify" | "sale" | "recycle" | "note" | "price" | null;

/** OPS-06 / OPS-07 actions for one device. */
export function DeviceOps({ id, status, priceCents, reportRef, assignedId, volunteers, fundBalanceCents }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<DialogKind>(null);
  const [busy, setBusy] = useState(false);
  const [price, setPriceVal] = useState(priceCents ? String(priceCents / 100) : "");
  const [sale, setSale] = useState({ soldAt: new Date().toISOString().slice(0, 10), channel: "in_store" as SaleChannel, recipient: "student" as RecipientCategory | "", subsidy: "" });
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const nexts = nextDeviceStatuses(status).filter((s) => s !== "wipe_verified" && s !== "sold" && s !== "recycled");

  const done = (res: { ok: boolean; error?: string; message?: string }) => {
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error ?? "Something went wrong.");
      return;
    }
    toast.success(res.message ?? "Saved.");
    setOpen(null);
    router.refresh();
  };

  const subsidyEligible = sale.recipient !== "" && PIF_ELIGIBLE_RECIPIENTS.includes(sale.recipient);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {status === "wipe_pending_verification" ? (
          <ClayButton variant="primary" icon={<ShieldCheck />} onClick={() => setOpen("verify")}>
            Verify wipe
          </ClayButton>
        ) : null}
        {status === "ready" || status === "listed" ? (
          <ClayButton variant="primary" icon={<BadgeDollarSign />} onClick={() => setOpen("sale")}>
            Record sale
          </ClayButton>
        ) : null}
        {nexts.map((s) => (
          <ClayButton
            key={s}
            variant="secondary"
            size="sm"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              done(await changeStatus({ ids: [id], to: s }));
            }}
          >
            Move to {labels.deviceStatus[s].toLowerCase()}
          </ClayButton>
        ))}
        {status !== "sold" && status !== "recycled" ? (
          <>
            <ClayButton variant="secondary" size="sm" icon={<Tag />} onClick={() => setOpen("price")}>
              {priceCents ? `Price ${formatCents(priceCents)}` : "Set price"}
            </ClayButton>
            <ClayButton variant="danger" size="sm" icon={<Recycle />} onClick={() => setOpen("recycle")}>
              Recycle
            </ClayButton>
          </>
        ) : null}
        <ClayButton variant="ghost" size="sm" icon={<MessageSquarePlus />} onClick={() => setOpen("note")}>
          Add note
        </ClayButton>
      </div>
      {status !== "sold" && status !== "recycled" ? (
        <label className="flex max-w-sm flex-col gap-1 text-small font-medium text-ink-2">
          Assigned volunteer
          <Select
            defaultValue={assignedId ?? ""}
            onChange={async (e) => {
              setBusy(true);
              done(await assignVolunteer({ ids: [id], volunteerId: e.target.value || null }));
            }}
          >
            <option value="">Unassigned</option>
            {volunteers.map((v) => (
              <option key={v.id} value={v.id}>
                {v.full_name}
              </option>
            ))}
          </Select>
        </label>
      ) : null}

      <VerifyDialog ids={[id]} open={open === "verify"} onOpenChange={(o) => setOpen(o ? "verify" : null)} onDone={() => router.refresh()} defaultReference={reportRef} />

      <Dialog open={open === "price"} onOpenChange={(o) => setOpen(o ? "price" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set price</DialogTitle>
            <DialogDescription>Free Geek Toronto sets every price. GeekLoop only displays it.</DialogDescription>
          </DialogHeader>
          <Field label="Price (CAD)">{({ id: fid }) => <Input id={fid} inputMode="decimal" value={price} onChange={(e) => setPriceVal(e.target.value)} />}</Field>
          <DialogFooter>
            <ClayButton
              variant="primary"
              loading={busy}
              onClick={async () => {
                setBusy(true);
                done(await setPrice({ id, priceCents: Math.round(Number(price) * 100) }));
              }}
            >
              Save price
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "sale"} onOpenChange={(o) => setOpen(o ? "sale" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record sale</DialogTitle>
            <DialogDescription>Recipient category is optional and never shows a person — only a category like “Student”.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sale date">{({ id: fid }) => <Input id={fid} type="date" value={sale.soldAt} onChange={(e) => setSale({ ...sale, soldAt: e.target.value })} />}</Field>
            <Field label="Channel">
              {({ id: fid }) => (
                <Select id={fid} value={sale.channel} onChange={(e) => setSale({ ...sale, channel: e.target.value as SaleChannel })}>
                  {SALE_CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {labels.channel[c]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Recipient category" className="sm:col-span-2">
              {({ id: fid }) => (
                <Select id={fid} value={sale.recipient} onChange={(e) => setSale({ ...sale, recipient: e.target.value as RecipientCategory | "", subsidy: "" })}>
                  <option value="">Not recorded</option>
                  {RECIPIENT_CATEGORIES.map((r) => (
                    <option key={r} value={r}>
                      {labels.recipient[r]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            {subsidyEligible ? (
              <Field label="Pay-It-Forward subsidy (CAD, optional)" hint={`Fund balance: ${formatCents(fundBalanceCents)}. Lowers the price for this buyer.`} className="sm:col-span-2">
                {({ id: fid, describedBy }) => <Input id={fid} inputMode="decimal" aria-describedby={describedBy} value={sale.subsidy} onChange={(e) => setSale({ ...sale, subsidy: e.target.value })} />}
              </Field>
            ) : null}
          </div>
          <DialogFooter>
            <ClayButton
              variant="primary"
              loading={busy}
              onClick={async () => {
                setBusy(true);
                done(
                  await recordSale({
                    id,
                    soldAt: sale.soldAt,
                    channel: sale.channel,
                    recipient: sale.recipient || null,
                    subsidyCents: subsidyEligible && sale.subsidy ? Math.round(Number(sale.subsidy) * 100) : 0,
                  }),
                );
              }}
            >
              Record sale
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "recycle"} onOpenChange={(o) => setOpen(o ? "recycle" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recycle this device?</DialogTitle>
            <DialogDescription>It leaves the refurbishment pipeline for good. The reason is kept in its chain of custody.</DialogDescription>
          </DialogHeader>
          <Field label="Reason" required>
            {({ id: fid }) => <Textarea id={fid} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Cracked motherboard — recycled for parts" />}
          </Field>
          <DialogFooter>
            <ClayButton
              variant="danger"
              loading={busy}
              disabled={reason.trim().length < 3}
              onClick={async () => {
                setBusy(true);
                done(await changeStatus({ ids: [id], to: "recycled", reason }));
              }}
            >
              Recycle device
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "note"} onOpenChange={(o) => setOpen(o ? "note" : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a note</DialogTitle>
            <DialogDescription>Notes are permanent — they join the append-only timeline.</DialogDescription>
          </DialogHeader>
          <Field label="Note">{({ id: fid }) => <Textarea id={fid} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
          <DialogFooter>
            <ClayButton
              variant="primary"
              loading={busy}
              disabled={note.trim().length < 2}
              onClick={async () => {
                setBusy(true);
                done(await addNote({ id, note }));
              }}
            >
              Add note
            </ClayButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
