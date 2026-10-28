"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Cpu, HardDrive, Package, ShieldCheck, Sprout, Truck } from "lucide-react";
import {
  BadgeCoin,
  Checkbox,
  ClayButton,
  ClayCard,
  ClayToggle,
  EmptyState,
  Field,
  FlatCard,
  IconTile,
  Input,
  Segmented,
  Select,
  Skeleton,
  Stamp,
  StatPebble,
  StatusChip,
  Textarea,
} from "@/components/clay";
import { CapacityGlasses, FlowLine, HoldToConfirm, LiquidBlob, LiquidFill, LiquidMeter } from "@/components/liquid";
import { ClayLaptop } from "@/components/illustrations/clay-laptop";
import { ClayBaton } from "@/components/illustrations/clay-baton";
import { LiquidDigits } from "@/components/liquid/liquid-digits";
import { Seal } from "@/components/clay/seal";
import { PeoplePebbles } from "@/components/partner/people-pebbles";
import { PipelineTrack } from "@/components/staff/pipeline-track";
import { ClayVessel } from "@/components/illustrations/clay-vessel";
import { BatonSprite } from "@/components/passport/baton-sprite";
import { OdometerDigits } from "@/components/passport/odometer-digits";
import { StampSequence } from "@/components/passport/stamp-sequence";
import { VesselPour } from "@/components/passport/vessel-pour";
import { WrappedCard } from "@/components/passport/wrapped-card";
import { LiquidTransition } from "@/components/passport/liquid-transition";
import { buildPassportStory, type PassportStoryData } from "@/lib/passport-story";
import "@/components/passport/story.css";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const colors = [
  ["--canvas", "#F3EFE8"],
  ["--surface", "#FBF9F5"],
  ["--surface-flat", "#FFFFFF"],
  ["--ink", "#17201C"],
  ["--ink-2", "#4A544F"],
  ["--ink-3", "#5A635E"],
  ["--line", "#E4DED4"],
  ["--loop", "#138A61"],
  ["--loop-deep", "#0B5E42"],
  ["--ember", "#F26A2E"],
  ["--ember-deep", "#C9501C"],
  ["--success", "#1E9E6A"],
  ["--warning", "#D99A1E"],
  ["--danger", "#D64545"],
] as const;

const tints = ["porcelain", "mint", "apricot", "sky", "butter"] as const;

function Section({ title, children, note }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-14">
      <h2 className="font-display text-display-m">{title}</h2>
      {note ? <p className="measure mt-2 text-ink-2">{note}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export function StyleguideClient() {
  const [reduced, setReduced] = useState(false);
  const [toggle, setToggle] = useState(true);
  const [seg, setSeg] = useState<"dropoff" | "pickup" | "either">("dropoff");
  const [level, setLevel] = useState(0.62);
  const [week, setWeek] = useState<string | null>("2026-11-09");
  const [held, setHeld] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reduced ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.reducedMotion;
    };
  }, [reduced]);

  return (
    <main id="main" data-expression="3" className="mx-auto w-full max-w-[1200px] px-4 pb-32 sm:px-6">
      <header className="flex flex-col gap-6 py-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Relay design system</p>
          <h1 className="font-display mt-3 text-[3rem] leading-none sm:text-display-l">Tactile. Flowing. Precise.</h1>
          <p className="measure mt-4 text-body-l text-ink-2">Every token and component, in every state. Later screens reuse only what lives here.</p>
        </div>
        <ClayCard className="w-full sm:w-80" size="md">
          <ClayToggle checked={reduced} onCheckedChange={setReduced} label="Preview reduced motion" description="Mirrors prefers-reduced-motion: no waves, blobs or springs." />
        </ClayCard>
      </header>

      <Section title="Colour" note="Warm, light and few. Ember is the one CTA colour; liquid is always green.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {colors.map(([name, hex]) => (
            <div key={name} className="flat overflow-hidden !p-0">
              <div className="h-16" style={{ background: hex }} />
              <div className="p-3">
                <p className="font-mono text-[0.8125rem] text-ink">{name}</p>
                <p className="font-mono text-[0.75rem] text-ink-2">{hex}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-5">
          {tints.map((t) => (
            <ClayCard key={t} tint={t} className="grid h-32 place-items-center">
              <span className="font-medium">{t}</span>
            </ClayCard>
          ))}
        </div>
      </Section>

      <Section title="Type" note="Bricolage Grotesque for display, Geist for UI, Geist Mono for codes.">
        <div className="space-y-5">
          <p className="font-display text-[3rem] leading-none sm:text-display-xl">Pass it on.</p>
          <p className="font-display text-[2.5rem] leading-none sm:text-display-l">Dell Latitude 5420</p>
          <p className="font-display text-display-m">Page title</p>
          <p className="text-title font-semibold">Card title</p>
          <p className="measure text-body-l text-ink-2">Lead paragraph — we turn your business&apos;s retired laptops into affordable computers for Toronto students.</p>
          <p className="measure">Body text at 17px. Plain, warm and specific.</p>
          <p className="text-small text-ink-2">Small meta and captions.</p>
          <p className="eyebrow">Micro eyebrow label</p>
          <p className="font-mono text-lg">FGT-7K3M9Q2X · GL-2026-0001</p>
        </div>
      </Section>

      <Section title="Surfaces" note="Clay for things you touch. Wells for inputs. Flat for tables and text.">
        <div className="grid gap-6 sm:grid-cols-3">
          <ClayCard>
            <p className="font-semibold">.clay</p>
            <p className="text-small text-ink-2">Static card — no lift.</p>
          </ClayCard>
          <ClayCard href="#" aria-label="Interactive card example">
            <p className="font-semibold">.clay + href</p>
            <p className="text-small text-ink-2">Openable — lifts on hover.</p>
          </ClayCard>
          <div className="flat p-6">
            <p className="font-semibold">.flat</p>
            <p className="text-small text-ink-2">Tables, long forms, PDFs.</p>
          </div>
          <div className="well grid h-24 place-items-center text-ink-2">.well</div>
          <div className="clay-sm grid h-24 place-items-center rounded-[20px]">.clay-sm</div>
          <div className="clay-sm clay-sunk grid h-24 place-items-center rounded-[20px]">pressed</div>
        </div>
      </Section>

      <Section title="Buttons" note="Pill, 48px. One primary per view.">
        <div className="flex flex-wrap items-center gap-4">
          <ClayButton variant="primary">Become a Reuse Partner</ClayButton>
          <ClayButton variant="secondary">Scan a Passport</ClayButton>
          <ClayButton variant="ghost">Read the methodology</ClayButton>
          <ClayButton variant="danger">Decline batch</ClayButton>
          <ClayButton variant="secondary" loading>
            Saving
          </ClayButton>
          <ClayButton variant="secondary" disabled>
            Disabled
          </ClayButton>
          <ClayButton variant="secondary" size="sm" icon={<Package />}>
            Small with icon
          </ClayButton>
        </div>
      </Section>

      <Section title="Pebbles, chips & tiles">
        <div className="grid gap-5 sm:grid-cols-4">
          <StatPebble className="sm:col-span-2 sm:row-span-2" size="lg" label="kg e-waste diverted" value={2184.6} decimals={1} suffix="kg" tint="mint" caption="Reused or responsibly recycled since May." />
          <StatPebble label="Devices back in use" value={47} delta="+6 this month" />
          <StatPebble label="Volunteer hours" value={186} tint="butter" />
          <StatPebble label="CO₂e avoided" value={9.4} decimals={1} suffix="t" />
          <StatPebble label="Partners" value={8} tint="porcelain" size="sm" />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <StatusChip tone="mint">Reused</StatusChip>
          <StatusChip tone="sky">Wipe verified</StatusChip>
          <StatusChip tone="butter">Refurbishing</StatusChip>
          <StatusChip tone="apricot">Impact Partner</StatusChip>
          <StatusChip tone="neutral">Received</StatusChip>
          <StatusChip tone="danger">Declined</StatusChip>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          {tints.map((t) => (
            <IconTile key={t} tint={t}>
              <ShieldCheck />
            </IconTile>
          ))}
        </div>
      </Section>

      <Section title="Form controls" note="Wells, 48px tall, label always above. Errors shake twice — never flash red.">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Organization name" hint="As it should appear on certificates." required>
            {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} placeholder="Maple Ledger Accounting" />}
          </Field>
          <Field label="Quantity" error={err}>
            {({ id, describedBy, invalid }) => <Input id={id} type="number" aria-describedby={describedBy} aria-invalid={invalid} defaultValue={0} />}
          </Field>
          <Field label="Category">
            {({ id }) => (
              <Select id={id} defaultValue="laptop">
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
              </Select>
            )}
          </Field>
          <Field label="Notes">{({ id }) => <Textarea id={id} placeholder="Anything we should know?" />}</Field>
          <Checkbox label="Drives stay in the devices" description="Free Geek Toronto wipes every drive with its own software." defaultChecked />
          <div className="flex items-end gap-3">
            <ClayButton variant="secondary" size="sm" onClick={() => setErr(err ? undefined : "Enter at least 1 device.")}>
              Toggle error
            </ClayButton>
          </div>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <ClayCard>
            <ClayToggle checked={toggle} onCheckedChange={setToggle} label="Show my first name on Passports" description="Off by default. You can change this any time." />
          </ClayCard>
          <div className="flex flex-col gap-3">
            <Segmented
              label="Logistics"
              value={seg}
              onChange={setSeg}
              options={[
                { value: "dropoff", label: "Drop-off" },
                { value: "pickup", label: "Pickup" },
                { value: "either", label: "Either" },
              ]}
            />
            <p className="text-small text-ink-2">Arrow keys move between options.</p>
          </div>
        </div>
      </Section>

      <Section title="Liquid" note="Liquid only means fill or flow.">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex min-w-0 flex-col gap-5">
            <LiquidMeter title="Batch Value Score" value={Math.round(level * 100)} verdict={level >= 0.75 ? "Excellent" : level >= 0.5 ? "Good" : level >= 0.25 ? "Fair" : "Low"}>
              <p className="mt-2 text-small text-ink-2">Batches of 5+ identical laptops under 5 years old are refurbished fastest.</p>
            </LiquidMeter>
            <LiquidMeter compact title="Score" value={Math.round(level * 100)} verdict="Good" />
            <label className="flex items-center gap-3 text-small text-ink-2">
              Level
              <input type="range" min={0} max={1} step={0.01} value={level} onChange={(e) => setLevel(Number(e.target.value))} className="w-48 accent-[var(--loop)]" />
            </label>
            <div className="flex flex-wrap gap-4">
              <LiquidFill value={level} shape="jar" color="ember" className="h-28 w-24" />
              <LiquidFill value={level} shape="glass" className="h-24 w-16" />
              <LiquidFill value={level} shape="pill" className="h-14 w-40" />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <CapacityGlasses
              label="Choose a drop-off week"
              value={week}
              onSelect={setWeek}
              weeks={[
                { week: "2026-11-02", label: "Nov 2", load: 4, capacity: 20, status: "open" },
                { week: "2026-11-09", label: "Nov 9", load: 9, capacity: 20, status: "open" },
                { week: "2026-11-16", label: "Nov 16", load: 16, capacity: 20, status: "limited" },
                { week: "2026-11-23", label: "Nov 23", load: 22, capacity: 20, status: "full" },
                { week: "2026-11-30", label: "Nov 30", load: 0, capacity: 20, status: "open" },
                { week: "2026-12-07", label: "Dec 7", load: 20, capacity: 20, status: "limited" },
                { week: "2026-12-14", label: "Dec 14", load: 6, capacity: 20, status: "open" },
                { week: "2026-12-21", label: "Dec 21", load: 30, capacity: 20, status: "full" },
              ]}
            />
            <HoldToConfirm label="Data wipe performed" hint="Press and hold for 1 second" icon={<HardDrive />} done={held} onConfirm={() => setHeld(true)} />
            {held ? (
              <ClayButton variant="ghost" onClick={() => setHeld(false)}>
                Reset hold demo
              </ClayButton>
            ) : null}
          </div>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <FlatCard>
            <p className="eyebrow mb-5">Journey timeline · FlowLine + Stamps</p>
            <FlowLine progress={0.75}>
              <ol className="flex flex-col gap-7">
                <li><Stamp icon={<Package />} label="Donated by Maple Ledger Accounting" date="May 12, 2026" tint="apricot" /></li>
                <li><Stamp icon={<ShieldCheck />} label="Data wiped & verified" date="May 20, 2026" tint="sky" /></li>
                <li><Stamp icon={<Cpu />} label="Refurbished by Aisha" date="May 23, 2026" tint="butter" /></li>
                <li><Stamp icon={<CheckCircle2 />} label="Ready for its next owner" done={false} /></li>
              </ol>
            </FlowLine>
          </FlatCard>
          <div className="relative overflow-hidden rounded-[var(--r-xl)]">
            <LiquidBlob className="-left-10 -top-10 size-80" tone="mint" />
            <LiquidBlob className="-bottom-16 -right-10 size-72" tone="apricot" duration={24} />
            <ClayLaptop className="relative mx-auto max-w-sm" />
          </div>
        </div>
      </Section>

      <Section title="Relay moments" note="The baton is the story: a device handed business → volunteer → new owner. Each piece below is one signature moment.">
        <div className="grid gap-5 md:grid-cols-12">
          <ClayCard className="flex flex-col items-start gap-4 md:col-span-5">
            <p className="eyebrow">Clay baton · liquid core</p>
            <div className="flex items-center gap-6">
              <ClayBaton className="w-28" core={0.3} />
              <ClayBaton className="w-28" core={1} />
            </div>
            <p className="text-small text-ink-2">Landing Baton Run, submit baton pass, bench handoff, empty states.</p>
          </ClayCard>
          <ClayCard className="flex flex-col items-start gap-4 md:col-span-7">
            <p className="eyebrow">Liquid digits</p>
            <LiquidDigits value={1284} label="1,284 devices back in use" className="text-[2.75rem]" />
            <p className="text-small text-ink-2">Odometer for the hero counter. Rolls once on view; reduced motion shows the final number.</p>
          </ClayCard>
          <ClayCard className="flex items-center gap-6 md:col-span-5">
            <Seal rim="DATA WIPED · RELAY · DATA WIPED · " icon={<ShieldCheck />} size={104} inView />
            <p className="text-small text-ink-2">Ink seal: wipes, certificates, verification. Presses in once with a slight hand-stamped tilt.</p>
          </ClayCard>
          <ClayCard tint="mint" className="flex flex-col gap-4 md:col-span-7">
            <p className="eyebrow !text-loop-deep">People pebbles</p>
            <PeoplePebbles count={16} />
            <p className="text-small text-ink-2">One pebble per person a partner&apos;s laptops now help.</p>
          </ClayCard>
          <div className="flat p-6 md:col-span-12">
            <p className="eyebrow mb-4">Pipeline flow bar</p>
            <PipelineTrack
              label="Example pipeline"
              stages={[
                { label: "Received", value: 14 },
                { label: "Testing", value: 4 },
                { label: "Wipe pending", value: 4 },
                { label: "Verified", value: 3 },
                { label: "Refurb", value: 5 },
                { label: "Ready", value: 6 },
                { label: "Listed", value: 8 },
                { label: "Sold", value: 58 },
                { label: "Recycled", value: 7, muted: true },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title="Relay Wrapped" note="The passport story kit (/p/[code]): one liquid-rise transition, one hero and one tint per slide. Live at /p/FGT-WRAPPED2.">
        <WrappedKit />
      </Section>

      <Section title="Badges & celebration">
        <div className="flex flex-wrap items-end gap-8">
          <BadgeCoin key={celebrate} slug="first-boot" name="First Boot" unlocked celebrate={celebrate > 0} />
          <BadgeCoin slug="data-guardian" name="Data Guardian" unlocked={false} progress={7} threshold={10} />
          <BadgeCoin slug="diagnostician" name="Diagnostician" unlocked />
          <BadgeCoin slug="century" name="Century Club" unlocked={false} progress={23} threshold={100} />
          <ClayButton variant="secondary" size="sm" onClick={() => setCelebrate((c) => c + 1)}>
            Replay unlock
          </ClayButton>
        </div>
      </Section>

      <Section title="Feedback">
        <div className="flex flex-wrap gap-4">
          <ClayButton variant="secondary" onClick={() => toast.success("Batch sent. Free Geek Toronto staff will confirm your drop-off week.")}>
            Show success toast
          </ClayButton>
          <ClayButton variant="secondary" onClick={() => toast.error("That week is full — the next open week is Nov 30.")}>
            Show error toast
          </ClayButton>
          <Dialog>
            <DialogTrigger asChild>
              <ClayButton variant="secondary">Open dialog</ClayButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Decline this batch?</DialogTitle>
                <DialogDescription>The partner sees your reason, so keep it kind and specific.</DialogDescription>
              </DialogHeader>
              <Field label="Reason">{({ id }) => <Textarea id={id} />}</Field>
              <DialogFooter>
                <ClayButton variant="danger">Decline batch</ClayButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <FlatCard>
            <EmptyState title="No batches yet." action={<ClayButton variant="secondary" size="sm" icon={<Truck />}>Start a batch</ClayButton>}>
              Your first 5 laptops could reach a classroom next month.
            </EmptyState>
          </FlatCard>
          <FlatCard className="flex flex-col gap-4">
            <Skeleton className="h-10 w-1/2 rounded-full" />
            <Skeleton className="h-24" />
            <div className="flex gap-3">
              <Skeleton className="size-14 rounded-full" />
              <Skeleton className="h-14 flex-1" />
            </div>
          </FlatCard>
        </div>
        <div className="mt-8 flex flex-wrap gap-6">
          <ClayVessel className="size-20" tone="mint" />
          <ClayVessel className="size-20" tone="butter" />
          <ClayVessel className="size-20" tone="apricot" />
          <ClayVessel className="size-20" tone="sky" />
          <Sprout className="sr-only" aria-hidden />
        </div>
      </Section>

      <Section title="Table" note="Flat white, hairline rows, 52px, tabular numbers.">
        <div className="flat overflow-x-auto !p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Passport</th>
                <th scope="col">Model</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">FGT-7K3M9Q2X</td>
                <td>Dell Latitude 5420</td>
                <td><StatusChip tone="mint">Sold</StatusChip></td>
                <td className="text-right">$190.00</td>
              </tr>
              <tr>
                <td className="font-mono">FGT-H4WQ8N2C</td>
                <td>Lenovo ThinkPad T480</td>
                <td><StatusChip tone="sky">Wipe pending</StatusChip></td>
                <td className="text-right">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </main>
  );
}

const SAMPLE_STORY: PassportStoryData = {
  code: "FGT-WRAPPED2",
  category: "laptop",
  make: "Lenovo",
  model: "ThinkPad T480",
  cpu: "Intel Core i5-8350U",
  ram_gb: 8,
  storage_gb: 256,
  approx_year: 2019,
  status: "sold",
  os_installed: "Linux Mint 22",
  is_open_source_os: true,
  weight_kg: null,
  uniform: true,
  pif_subsidized: true,
  donor: { type: "partner", name: "Maple Ledger Accounting", logo_path: null },
  volunteer_first_name: "Aisha",
  timeline: { donated_at: "2026-05-18T14:00:00Z", wipe_verified_at: "2026-05-22T13:00:00Z", refurbished_at: "2026-05-25T12:00:00Z", ready_at: "2026-05-25T12:00:00Z", in_new_home: true },
  factor: { category: "laptop", avg_weight_kg: 2.1, co2e_avoided_kg_per_reuse: 230, source_title: "TO VERIFY", source_url: null },
  price_breakdown: [
    { label: "Refurbishing & testing", percent: 35, description: "" },
    { label: "Fair wages & training", percent: 30, description: "" },
    { label: "Operations & space", percent: 15, description: "" },
    { label: "Data security", percent: 10, description: "" },
    { label: "Digital-inclusion programs", percent: 10, description: "" },
  ],
  price_breakdown_confirmed: false,
  offered_at: "2026-05-06T14:00:00Z",
  milestones: [
    { kind: "received", at: "2026-05-18T14:00:00Z" },
    { kind: "hardware_test", at: "2026-05-20T12:00:00Z" },
    { kind: "wipe_performed", at: "2026-05-21T18:00:00Z" },
    { kind: "wipe_verified", at: "2026-05-22T13:00:00Z" },
    { kind: "os_installed", at: "2026-05-24T09:00:00Z" },
    { kind: "final_qa", at: "2026-05-25T12:00:00Z" },
  ],
  steps_completed: ["hardware_test", "wipe_performed", "os_installed", "final_qa"],
  bench_days: 5,
  recycled: false,
};

/** Relay Wrapped components, replayable. */
function WrappedKit() {
  const [run, setRun] = useState(0);
  const story = buildPassportStory(SAMPLE_STORY);
  const tints = ["apricot", "sky", "butter", "mint"] as const;
  const tint = tints[run % tints.length];
  return (
    <div className="flex flex-col gap-6">
      <div>
        <ClayButton size="sm" onClick={() => setRun((r) => r + 1)}>
          Replay
        </ClayButton>
      </div>
      <div key={run} className="grid gap-6 lg:grid-cols-3">
        <FlatCard className="flex flex-col gap-4">
          <p className="eyebrow">LiquidTransition</p>
          <div className="relative h-56 overflow-hidden rounded-[20px] [container-type:size]" style={{ background: "#F4F0E9" }}>
            <LiquidTransition dir={run === 0 ? 0 : 1} tint={tint} reduced={false}>
              <div className="story-slide !p-6" data-tint={tint}>
                <p className="font-display text-[1.75rem] leading-none">Its old data, wiped.</p>
              </div>
            </LiquidTransition>
          </div>
        </FlatCard>
        <FlatCard className="flex flex-col gap-4">
          <p className="eyebrow">OdometerDigits</p>
          <OdometerDigits value={2.1} decimals={1} label="2.1 kilograms" className="text-[4.5rem]" />
          <OdometerDigits value={230} label="230 kilograms" className="text-[2.5rem]" />
        </FlatCard>
        <FlatCard className="flex flex-col items-center gap-4">
          <p className="eyebrow self-start">BatonSprite</p>
          <BatonSprite glow className="w-48" />
        </FlatCard>
        <FlatCard className="flex flex-col gap-4">
          <p className="eyebrow">StampSequence</p>
          <StampSequence
            stamps={story.benchSteps.map((b) => ({ key: b.kind, label: b.label, date: b.at ? new Date(b.at).toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "Coming up", icon: <Cpu />, done: Boolean(b.at) }))}
          />
        </FlatCard>
        <FlatCard className="flex flex-col gap-4">
          <p className="eyebrow">VesselPour</p>
          <VesselPour slices={story.priceBreakdown} />
        </FlatCard>
        <div className="[container-type:inline-size]">
          <p className="eyebrow mb-4">WrappedCard</p>
          <WrappedCard story={story} />
        </div>
      </div>
    </div>
  );
}
