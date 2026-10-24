"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useFieldArray, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, HardDrive, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Checkbox, ClayButton, ClayCard, Field, IconTile, Input, Segmented, Select, Textarea } from "@/components/clay";
import { CapacityGlasses, LiquidFill, LiquidMeter, Stepper } from "@/components/liquid";
import { computeBatchScore, scoreTip, type ScoreWeights } from "@/lib/batch-score";
import type { CapacityWeek } from "@/lib/capacity";
import { DEVICE_CATEGORIES, DEVICE_CONDITIONS, labels, type PartnerTier } from "@/lib/domain";
import { canRequestPickup } from "@/lib/pricing";
import { useMotionPrefs } from "@/lib/motion";
import { batchSchema, type BatchInput } from "@/lib/validation/batch";
import { submitBatch, updateBatch } from "@/server/actions/partner";
import { cn } from "@/lib/utils";

type FormValues = Omit<BatchInput, "dataHandlingAck"> & { dataHandlingAck: boolean };

const STEPS = ["Devices", "Logistics", "Data handling", "Review"];
const STEP_FIELDS: FieldPath<FormValues>[][] = [["lineItems"], ["logistics", "preferredWeek", "pickupAddress"], ["dataHandlingAck", "notes"], []];

const blankItem = (): FormValues["lineItems"][number] => ({ category: "laptop", make: "", model: "", approxYear: null, quantity: 1, condition: "working" });

interface BatchWizardProps {
  tier: PartnerTier;
  calendar: CapacityWeek[];
  weights: ScoreWeights;
  maxAgeYears: number;
  editing?: { id: string; values: BatchInput };
}

export function BatchWizard({ tier, calendar, weights, maxAgeYears, editing }: BatchWizardProps) {
  const router = useRouter();
  const { reduced, t } = useMotionPrefs();
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(editing ? 3 : 0);
  const [direction, setDirection] = useState(1);
  const [done, setDone] = useState<{ id: string; score: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(batchSchema) as never,
    mode: "onTouched",
    defaultValues: editing?.values ?? {
      lineItems: [blankItem()],
      logistics: "dropoff",
      preferredWeek: calendar.find((w) => w.status === "open")?.week ?? "",
      pickupAddress: "",
      dataHandlingAck: false,
      notes: "",
    },
  });
  const { register, control, handleSubmit, trigger, setValue, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const lineItems = useWatch({ control, name: "lineItems" });
  const logistics = useWatch({ control, name: "logistics" });
  const week = useWatch({ control, name: "preferredWeek" });
  const values = useWatch({ control }) as FormValues;

  const score = useMemo(
    () =>
      computeBatchScore(
        (lineItems ?? []).map((l) => ({
          category: l.category,
          make: l.make ?? "",
          model: l.model ?? "",
          approxYear: typeof l.approxYear === "number" && Number.isFinite(l.approxYear) ? l.approxYear : null,
          quantity: Number.isFinite(l.quantity) ? l.quantity : 0,
        })),
        { weights, maxAgeYears },
      ),
    [lineItems, weights, maxAgeYears],
  );
  const pickupAllowed = canRequestPickup(tier);
  const totalQty = score.totalQuantity;

  const go = async (next: number) => {
    if (next > step) {
      const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
      if (!valid) return;
    }
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const onSubmit = handleSubmit(async (v) => {
    const payload = { ...v, dataHandlingAck: true as const };
    const res = editing ? await updateBatch({ id: editing.id, batch: payload }) : await submitBatch(payload);
    if (!res.ok) {
      toast.error(res.error);
      if (res.fieldErrors) {
        for (const [k, msg] of Object.entries(res.fieldErrors)) form.setError(k as FieldPath<FormValues>, { message: msg });
      }
      return;
    }
    if (editing) {
      toast.success(res.message ?? "Batch updated.");
      router.push(`/partner/batches/${res.data.id}`);
      router.refresh();
      return;
    }
    setDone(res.data);
    router.refresh();
  });

  if (done) return <SubmittedCelebration id={done.id} score={done.score} label={score.label} />;

  const e = formState.errors;
  const selectedWeek = calendar.find((w) => w.week === week);

  return (
    <form
      onSubmit={(ev) => {
        if (step < STEPS.length - 1) {
          ev.preventDefault();
          void go(step + 1);
          return;
        }
        void onSubmit(ev);
      }}
      noValidate
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      {/* Mobile: the meter collapses into a sticky top pill (§9.4). */}
      <div className="sticky top-[72px] z-20 -mx-1 lg:hidden">
        <LiquidMeter compact title="Batch Value Score" value={score.score} verdict={score.label} />
      </div>

      <ClayCard size="lg" className="min-w-0">
        <Stepper steps={STEPS} current={step} maxReached={maxReached} onStep={(i) => go(i)} />
        <div className="relative mt-8 overflow-hidden">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 * direction }}
              transition={t("soft")}
            >
              {step === 0 ? (
                <fieldset>
                  <legend className="text-title font-semibold">What are you donating?</legend>
                  <p className="mt-1 text-ink-2">Add one row per model. Identical laptops go on one row with a quantity.</p>
                  <ul className="mt-6 flex flex-col gap-4">
                    {fields.map((f, i) => {
                      const le = e.lineItems?.[i];
                      return (
                        <li key={f.id} className="well rounded-[var(--r-md)] p-4 sm:p-5">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="font-semibold">Devices {i + 1}</p>
                            {fields.length > 1 ? (
                              <button type="button" onClick={() => remove(i)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-small font-medium text-danger-ink hover:bg-white/60">
                                <Trash2 className="size-4" aria-hidden /> Remove
                              </button>
                            ) : null}
                          </div>
                          <div className="grid gap-4 sm:grid-cols-6">
                            <Field label="Category" className="sm:col-span-2" error={le?.category?.message}>
                              {({ id }) => (
                                <Select id={id} {...register(`lineItems.${i}.category`)}>
                                  {DEVICE_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>
                                      {labels.category[c]}
                                    </option>
                                  ))}
                                </Select>
                              )}
                            </Field>
                            <Field label="Make" className="sm:col-span-2" error={le?.make?.message}>
                              {({ id, describedBy, invalid }) => <Input id={id} placeholder="Dell" aria-describedby={describedBy} aria-invalid={invalid} {...register(`lineItems.${i}.make`)} />}
                            </Field>
                            <Field label="Model" className="sm:col-span-2" error={le?.model?.message}>
                              {({ id, describedBy, invalid }) => <Input id={id} placeholder="Latitude 5420" aria-describedby={describedBy} aria-invalid={invalid} {...register(`lineItems.${i}.model`)} />}
                            </Field>
                            <Field label="Approx. year" className="sm:col-span-2" error={le?.approxYear?.message}>
                              {({ id, describedBy, invalid }) => (
                                <Input
                                  id={id}
                                  inputMode="numeric"
                                  placeholder="2021"
                                  aria-describedby={describedBy}
                                  aria-invalid={invalid}
                                  {...register(`lineItems.${i}.approxYear`, { setValueAs: (v) => (v === "" || v === null ? null : Number(v)) })}
                                />
                              )}
                            </Field>
                            <Field label="Quantity" className="sm:col-span-2" error={le?.quantity?.message}>
                              {({ id, describedBy, invalid }) => (
                                <Input id={id} type="number" min={1} inputMode="numeric" aria-describedby={describedBy} aria-invalid={invalid} {...register(`lineItems.${i}.quantity`, { valueAsNumber: true })} />
                              )}
                            </Field>
                            <Field label="Condition" className="sm:col-span-2">
                              {({ id }) => (
                                <Select id={id} {...register(`lineItems.${i}.condition`)}>
                                  {DEVICE_CONDITIONS.map((c) => (
                                    <option key={c} value={c}>
                                      {labels.condition[c]}
                                    </option>
                                  ))}
                                </Select>
                              )}
                            </Field>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {e.lineItems?.root?.message || e.lineItems?.message ? (
                    <p role="alert" className="mt-3 text-small font-medium text-danger-ink">
                      {e.lineItems?.root?.message ?? e.lineItems?.message}
                    </p>
                  ) : null}
                  <ClayButton type="button" variant="secondary" size="sm" className="mt-5" icon={<Plus />} onClick={() => append(blankItem())} disabled={fields.length >= 30}>
                    Add another model
                  </ClayButton>
                </fieldset>
              ) : null}

              {step === 1 ? (
                <fieldset className="flex flex-col gap-7">
                  <legend className="text-title font-semibold">How will they reach us?</legend>
                  <div className="flex flex-col gap-3">
                    <Segmented
                      label="Drop-off or pickup"
                      value={logistics}
                      onChange={(v) => setValue("logistics", v, { shouldValidate: true })}
                      options={[
                        { value: "dropoff", label: "Drop-off" },
                        { value: "pickup", label: "Pickup", disabled: !pickupAllowed },
                      ]}
                    />
                    {!pickupAllowed ? (
                      <p className="text-small text-ink-2">
                        Pickup comes with Impact and Champion memberships.{" "}
                        <Link href="/partner/membership" className="font-semibold text-loop-deep underline underline-offset-4">
                          See memberships
                        </Link>
                      </p>
                    ) : (
                      <p className="text-small text-ink-2">Drop-off is at 180 Sudbury Street, Unit C3. Pickup works anywhere in Toronto.</p>
                    )}
                  </div>
                  {logistics === "pickup" ? (
                    <Field label="Pickup address" error={e.pickupAddress?.message}>
                      {({ id, describedBy, invalid }) => <Input id={id} autoComplete="street-address" aria-describedby={describedBy} aria-invalid={invalid} {...register("pickupAddress")} />}
                    </Field>
                  ) : null}
                  <div>
                    <p className="font-medium text-ink" id="week-label">
                      Preferred week
                    </p>
                    <p className="mb-4 text-small text-ink-2">Glasses show how full our refurbishment bench is. Full weeks are closed.</p>
                    <CapacityGlasses label="Preferred week" weeks={calendar} value={week} onSelect={(w) => setValue("preferredWeek", w, { shouldValidate: true })} />
                    {e.preferredWeek ? (
                      <p role="alert" className="mt-3 text-small font-medium text-danger-ink">
                        {e.preferredWeek.message}
                      </p>
                    ) : selectedWeek ? (
                      <p className="mt-3 text-small text-ink-2" aria-live="polite">
                        Week of <span className="font-semibold text-ink">{selectedWeek.label}</span>: {selectedWeek.load} of {selectedWeek.capacity} bench spots booked.
                        {selectedWeek.load + totalQty > selectedWeek.capacity ? " Your batch may be split across two weeks — we'll confirm." : ""}
                      </p>
                    ) : null}
                  </div>
                </fieldset>
              ) : null}

              {step === 2 ? (
                <fieldset className="flex flex-col gap-6">
                  <legend className="text-title font-semibold">Leave the drives in. We&apos;ll wipe them.</legend>
                  <div className="flex items-start gap-4">
                    <IconTile tint="sky">
                      <ShieldCheck />
                    </IconTile>
                    <p className="measure text-ink-2">
                      Free Geek Toronto wipes every drive with its own sanitization software and records a report for each device. Staff verify every wipe before a device can be sold, and
                      you get a numbered certificate listing every device.
                    </p>
                  </div>
                  <div key={e.dataHandlingAck ? "err" : "ok"} className={e.dataHandlingAck ? "shake" : undefined}>
                    <Checkbox
                      label="Our devices will arrive with their drives intact, and Free Geek Toronto will sanitize them."
                      description="Please don't remove or destroy drives yourself — intact drives make devices reusable."
                      aria-invalid={Boolean(e.dataHandlingAck)}
                      {...register("dataHandlingAck")}
                    />
                    {e.dataHandlingAck ? (
                      <p role="alert" className="ml-10 mt-2 text-small font-medium text-danger-ink">
                        {e.dataHandlingAck.message}
                      </p>
                    ) : null}
                  </div>
                  <Field label="Notes for our team (optional)" hint="Chargers included? Anything we should know?" error={e.notes?.message}>
                    {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} {...register("notes")} />}
                  </Field>
                </fieldset>
              ) : null}

              {step === 3 ? (
                <div className="flex flex-col gap-6">
                  <h2 className="text-title font-semibold">Check and send</h2>
                  <div className="flat overflow-x-auto !p-0">
                    <table className="data-table">
                      <caption className="sr-only">Devices in this batch</caption>
                      <thead>
                        <tr>
                          <th scope="col">Device</th>
                          <th scope="col">Year</th>
                          <th scope="col">Condition</th>
                          <th scope="col" className="text-right">
                            Qty
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(values.lineItems ?? []).map((l, i) => (
                          <tr key={i}>
                            <td>
                              <span className="font-medium">
                                {l.make} {l.model}
                              </span>
                              <span className="block text-small text-ink-2">{labels.category[l.category]}</span>
                            </td>
                            <td>{l.approxYear ?? "—"}</td>
                            <td>{labels.condition[l.condition]}</td>
                            <td className="text-right">{l.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <IconTile>
                        <Truck />
                      </IconTile>
                      <div>
                        <dt className="text-small text-ink-2">Logistics</dt>
                        <dd className="font-semibold">
                          {values.logistics === "pickup" ? `Pickup · ${values.pickupAddress}` : "Drop-off at 180 Sudbury St"} · week of {selectedWeek?.label ?? "—"}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IconTile tint="sky">
                        <HardDrive />
                      </IconTile>
                      <div>
                        <dt className="text-small text-ink-2">Data handling</dt>
                        <dd className="font-semibold">Drives intact · FGT sanitizes</dd>
                      </div>
                    </div>
                  </dl>
                  {values.notes ? <p className="measure text-ink-2">&ldquo;{values.notes}&rdquo;</p> : null}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <ClayButton type="button" variant="ghost" icon={<ArrowLeft />} onClick={() => go(step - 1)}>
              Back
            </ClayButton>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <ClayButton key="continue" type="button" variant="secondary" iconRight={<ArrowRight />} onClick={() => go(step + 1)}>
              Continue
            </ClayButton>
          ) : (
            <ClayButton key="submit" type="submit" variant="primary" loading={formState.isSubmitting}>
              {editing ? "Save changes" : `Submit ${totalQty} device${totalQty === 1 ? "" : "s"}`}
            </ClayButton>
          )}
        </div>
      </ClayCard>

      <aside className="sticky top-8 hidden flex-col gap-4 lg:flex" aria-label="Batch Value Score">
        <LiquidMeter title="Batch Value Score" value={score.score} verdict={score.label}>
          <p className="mt-3 text-small text-ink-2" aria-live="polite">
            {scoreTip(score)}
          </p>
        </LiquidMeter>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 px-2 text-small">
          <dt className="text-ink-2">Devices</dt>
          <dd className="text-right font-semibold tnum">{totalQty}</dd>
          <dt className="text-ink-2">Same model</dt>
          <dd className="text-right font-semibold tnum">{Math.round(score.uniformity * 100)}%</dd>
          <dt className="text-ink-2">Avg. age</dt>
          <dd className="text-right font-semibold tnum">{score.avgAgeYears === null ? "—" : `${score.avgAgeYears.toFixed(1)} yrs`}</dd>
          <dt className="text-ink-2">Laptops</dt>
          <dd className="text-right font-semibold tnum">{Math.round(score.laptopShare * 100)}%</dd>
        </dl>
      </aside>
    </form>
  );
}

/** Celebration (§7.4): the vessel fills to the batch's score, then one calm message. */
function SubmittedCelebration({ id, score, label }: { id: string; score: number; label: string }) {
  const { reduced, t } = useMotionPrefs();
  const [level, setLevel] = useState(reduced ? score / 100 : 0);
  return (
    <ClayCard size="xl" tint="mint" className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
      <motion.div
        className="h-40 w-36"
        initial={reduced ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={t("bouncy")}
        onAnimationComplete={() => setLevel(score / 100)}
      >
        <LiquidFill value={level} shape="vessel" className="size-full" />
      </motion.div>
      <div role="status">
        <p className="eyebrow !text-loop-deep">Batch Value Score · {score} · {label}</p>
        <h2 className="font-display mt-2 text-[2.25rem] leading-tight">Batch sent.</h2>
        <p className="mt-2 text-body-l text-ink-2">We&apos;ll confirm your drop-off week within 2 business days.</p>
      </div>
      <div className={cn("flex flex-wrap justify-center gap-3")}>
        <ClayButton href={`/partner/batches/${id}`} variant="secondary">
          View this batch
        </ClayButton>
        <ClayButton href="/partner" variant="ghost">
          Back to dashboard
        </ClayButton>
      </div>
    </ClayCard>
  );
}
