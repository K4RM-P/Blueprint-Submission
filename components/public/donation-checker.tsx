"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Keyboard, Laptop, Monitor, MonitorSmartphone, PcCase, Recycle, RotateCcw, Tablet, Tv, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, ClayCard, Field, IconTile, Input, Segmented } from "@/components/clay";
import { Stepper } from "@/components/liquid";
import { AGE_BUCKETS, BUSINESS_REDIRECT_MIN, guessCategory, type AgeBucket, type CheckerResult, type Working } from "@/lib/checker";
import { useMotionPrefs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { DeviceCategory } from "@/lib/domain";
import { checkDonation } from "@/server/actions/checker";

const STEPS = ["What it is", "Age", "Condition", "Who's giving"];

const CATEGORY_ICON: Record<DeviceCategory, typeof Laptop> = { laptop: Laptop, desktop: PcCase, monitor: Monitor, tablet: Tablet, accessory: Keyboard, other: Tv };

const WORKING: { value: Working; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "partly", label: "Partly" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

const RECYCLER_URL = "https://www.recyclemyelectronics.ca/on/";

/** HC-01…HC-03: a short, friendly step UI. The answer comes from the server (rules live in settings). */
export function DonationChecker({ categories }: { categories: { category: DeviceCategory; label: string }[] }) {
  const { reduced, t } = useMotionPrefs();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [maxReached, setMaxReached] = useState(0);
  const [category, setCategory] = useState<DeviceCategory | null>(null);
  const [typed, setTyped] = useState("");
  const [age, setAge] = useState<AgeBucket | null>(null);
  const [working, setWorking] = useState<Working | null>(null);
  const [isBusiness, setIsBusiness] = useState<boolean | null>(null);
  // Blank until answered, so a business never slips through as "1 device" by default.
  const [quantity, setQuantity] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<(CheckerResult & { category: DeviceCategory }) | null>(null);

  const guessed = typed ? guessCategory(typed) : null;
  const canNext = [category !== null, age !== null, working !== null, isBusiness !== null && (!isBusiness || Number(quantity) >= 1)][step];

  const go = (i: number) => {
    setDirection(i > step ? 1 : -1);
    setStep(i);
    setMaxReached((m) => Math.max(m, i));
  };

  const submit = async () => {
    if (!category || !age || !working || isBusiness === null) return;
    setBusy(true);
    const res = await checkDonation({ category, age, working, isBusiness, quantity: Math.max(1, Math.round(Number(quantity) || 1)) });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setResult({ ...res.data, category });
    // On phones the answer sits below the intro; bring it into view.
    requestAnimationFrame(() => document.getElementById("checker")?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" }));
  };

  const reset = () => {
    setResult(null);
    setStep(0);
    setMaxReached(0);
    setCategory(null);
    setTyped("");
    setAge(null);
    setWorking(null);
    setIsBusiness(null);
    setQuantity("1");
  };

  if (result) return <ResultCard result={result} label={categories.find((c) => c.category === result.category)?.label ?? ""} onReset={reset} />;

  return (
    <ClayCard size="lg" className="min-w-0">
      <Stepper steps={STEPS} current={step} maxReached={maxReached} onStep={go} label="Checker steps" />
      <div className="relative mt-8 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 * direction }}
            transition={t("soft")}
          >
            {step === 0 ? (
              <fieldset>
                <legend className="text-title font-semibold">What would you like to donate?</legend>
                <div role="radiogroup" aria-label="Item type" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {categories.map((c) => {
                    const Icon = CATEGORY_ICON[c.category];
                    const on = category === c.category;
                    return (
                      <button
                        key={c.category}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setCategory(c.category)}
                        className={cn(
                          "clay-sm clay-press flex min-h-[88px] flex-col items-start justify-between gap-3 rounded-[var(--r-md)] p-4 text-left text-[0.9375rem] font-medium",
                          on && "outline-2 outline-offset-2 outline-loop",
                        )}
                        data-tint={on ? "mint" : "porcelain"}
                        data-pressed={on || undefined}
                      >
                        <Icon className="size-6 text-loop-deep" strokeWidth={1.75} aria-hidden />
                        <span className="leading-snug">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <Field label="Or type the model" hint="For example “Dell Latitude 5420” or “iPad 6th generation”.">
                    {({ id, describedBy }) => (
                      <Input
                        id={id}
                        aria-describedby={describedBy}
                        value={typed}
                        onChange={(e) => {
                          setTyped(e.target.value);
                          const g = guessCategory(e.target.value);
                          if (g) setCategory(g);
                        }}
                      />
                    )}
                  </Field>
                  <p aria-live="polite" className="mt-2 min-h-[1.25rem] text-small text-ink-2">
                    {typed && guessed ? `Sounds like: ${categories.find((c) => c.category === guessed)?.label}.` : typed.length > 2 ? "We're not sure what that is — pick the closest type above." : ""}
                  </p>
                </div>
              </fieldset>
            ) : step === 1 ? (
              <fieldset>
                <legend className="text-title font-semibold">About how old is it?</legend>
                <p className="mt-1 text-ink-2">A rough guess is fine. Check the sticker underneath if you&apos;re curious.</p>
                <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label="Age">
                  {AGE_BUCKETS.map((b) => (
                    <Choice key={b.value} on={age === b.value} onClick={() => setAge(b.value)}>
                      {b.label}
                    </Choice>
                  ))}
                </div>
              </fieldset>
            ) : step === 2 ? (
              <fieldset>
                <legend className="text-title font-semibold">Does it turn on and work?</legend>
                <p className="mt-1 text-ink-2">Broken is okay for many items — we can often use the parts.</p>
                <Segmented<Working> className="mt-6" label="Does it work?" value={working ?? ("" as Working)} onChange={setWorking} options={WORKING} />
              </fieldset>
            ) : (
              <fieldset>
                <legend className="text-title font-semibold">Who&apos;s donating?</legend>
                <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Donating as">
                  <Choice on={isBusiness === false} onClick={() => setIsBusiness(false)} icon={<MonitorSmartphone />}>
                    Just me, from home
                  </Choice>
                  <Choice on={isBusiness === true} onClick={() => setIsBusiness(true)} icon={<Building2 />}>
                    A business or organization
                  </Choice>
                </div>
                {isBusiness ? (
                  <div className="mt-6 max-w-xs">
                    <Field label="How many devices?" hint={`${BUSINESS_REDIRECT_MIN} or more? The free Reuse Partnership has extras for you.`}>
                      {({ id, describedBy }) => <Input id={id} type="number" min={1} inputMode="numeric" aria-describedby={describedBy} value={quantity} onChange={(e) => setQuantity(e.target.value)} />}
                    </Field>
                  </div>
                ) : null}
              </fieldset>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        {step > 0 ? (
          <ClayButton variant="ghost" icon={<ArrowLeft />} onClick={() => go(step - 1)}>
            Back
          </ClayButton>
        ) : (
          <span />
        )}
        {step < STEPS.length - 1 ? (
          <ClayButton variant="secondary" iconRight={<ArrowRight />} disabled={!canNext} onClick={() => go(step + 1)}>
            Next
          </ClayButton>
        ) : (
          <ClayButton variant="primary" loading={busy} disabled={!canNext} onClick={submit}>
            Check my donation
          </ClayButton>
        )}
      </div>
    </ClayCard>
  );
}

function Choice({ on, onClick, children, icon }: { on: boolean; onClick: () => void; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      data-tint={on ? "mint" : "porcelain"}
      data-pressed={on || undefined}
      className={cn(
        "clay-sm clay-press flex min-h-14 items-center gap-3 rounded-[var(--r-md)] px-5 text-left font-medium [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.75] [&_svg]:text-loop-deep",
        on && "outline-2 outline-offset-2 outline-loop",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

const OUTCOME = {
  accepted: { tint: "mint", icon: CheckCircle2, title: "Yes — we'd love it." },
  recycling_only: { tint: "butter", icon: Recycle, title: "We'll take it for recycling." },
  not_accepted: { tint: "porcelain", icon: XCircle, title: "We can't take this one." },
  partner_redirect: { tint: "apricot", icon: Building2, title: "You'd make a great Reuse Partner." },
} as const;

function ResultCard({ result, label, onReset }: { result: CheckerResult; label: string; onReset: () => void }) {
  const { t } = useMotionPrefs();
  const o = OUTCOME[result.outcome];
  const Icon = o.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={t("soft")}>
      <ClayCard tint={o.tint} size="lg" className="flex flex-col gap-6" role="status" aria-live="polite">
        <div className="flex items-start gap-4">
          <IconTile tint={o.tint} size={52}>
            <Icon />
          </IconTile>
          <div>
            <p className="eyebrow !text-ink-2">{label}</p>
            <h2 className="font-display mt-1 text-[2rem] leading-tight">{o.title}</h2>
          </div>
        </div>
        <p className="measure text-body-l text-ink-2">{result.note}</p>

        {result.outcome === "accepted" || result.outcome === "recycling_only" ? (
          <div className="flat flex flex-col gap-2 p-5">
            <p className="font-semibold">Drop it off at Free Geek Toronto</p>
            <p className="text-ink-2">180 Sudbury Street, Unit C3, Toronto. Check Free Geek Toronto&apos;s website for current drop-off hours before you come.</p>
            <p className="text-small text-ink-3">
              Leave the drive in — every drive is wiped and checked by staff.{" "}
              <Link href="/about#security" className="font-semibold text-loop-deep underline-offset-4 hover:underline">
                How we keep data safe
              </Link>
            </p>
          </div>
        ) : null}
        {result.outcome === "not_accepted" ? (
          <p className="text-ink-2">
            Ontario has approved electronics recyclers that take these items for free.{" "}
            <a href={RECYCLER_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-loop-deep underline underline-offset-4">
              Find a drop-off near you
            </a>
            .
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          {result.outcome === "partner_redirect" ? (
            <ClayButton href="/become-a-partner" variant="primary" iconRight={<ArrowRight />}>
              See the Reuse Partnership
            </ClayButton>
          ) : null}
          <ClayButton variant={result.outcome === "partner_redirect" ? "ghost" : "secondary"} icon={<RotateCcw />} onClick={onReset}>
            Check another item
          </ClayButton>
        </div>
      </ClayCard>
    </motion.div>
  );
}
