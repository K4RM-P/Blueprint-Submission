"use client";

import { motion } from "motion/react";
import { ArrowRight, BadgeCheck, Cpu, HandCoins, HardDrive, Recycle, ShieldCheck, Terminal, Users, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { Seal } from "@/components/clay/seal";
import { ClayLaptop } from "@/components/illustrations/clay-laptop";
import { PassportBooklet } from "@/components/journey/passport-booklet";
import { PERSONA_ICON } from "./persona-icons";
import { storyDate, type BenchStep, type PassportStory, type SlideKey } from "@/lib/passport-story";
import { cn } from "@/lib/utils";
import { BatonSprite } from "./baton-sprite";
import { OdometerDigits } from "./odometer-digits";
import { Eyebrow, Footnote, Hero, KineticLine, MonoChip, Sub } from "./slide-primitives";
import { StampSequence } from "./stamp-sequence";
import { useStoryMotion } from "./story-context";
import { VesselPour } from "./vessel-pour";

/** Strip our emphasis marker from data before it goes into a key line. */
const clean = (s: string) => s.replace(/\*/g, "");
const springSoft = { type: "spring", stiffness: 170, damping: 24 } as const;

export interface SlideProps {
  story: PassportStory;
  /** Finale actions (share, download…) rendered by the player. */
  finale?: ReactNode;
  onBegin?: () => void;
}

export function SlideContent({ k, ...props }: SlideProps & { k: SlideKey }) {
  switch (k) {
    case "cover":
      return <Cover {...props} />;
    case "origin":
      return <Origin {...props} />;
    case "handoff":
      return <Handoff {...props} />;
    case "erased":
      return <Erased {...props} />;
    case "bench":
      return <Bench {...props} />;
    case "speed":
      return <Speed {...props} />;
    case "software":
      return <Software {...props} />;
    case "numbers":
      return <Numbers {...props} />;
    case "money":
      return <Money {...props} />;
    case "why":
      return <Why />;
    case "your_turn":
      return <YourTurn {...props} />;
    case "next_leg":
      return <NextLeg {...props} />;
    case "recycled":
      return <Recycled {...props} />;
    case "persona":
      return <PersonaSlide {...props} />;
    case "finale":
      return <>{props.finale}</>;
  }
}

/* 1 · Cover: the closed booklet opens; one line; tap to begin. */
function Cover({ story, onBegin }: SlideProps) {
  const { reduced } = useStoryMotion();
  return (
    <div className="flex h-full flex-col items-center text-center">
      <Hero className="w-full">
        <PassportBooklet code={story.code} className="w-[64cqw] max-w-[300px]">
          <div data-tint="porcelain" className="clay flex aspect-[3/4] flex-col justify-between !rounded-[var(--r-xl)] bg-gradient-to-br from-[#FFF7F0] to-[#FBF9F5] p-[5cqw] text-left">
            <div>
              <p className="font-mono text-[0.625rem] tracking-[0.22em] text-ink-2">DEVICE PASSPORT</p>
              <p className="mt-1 whitespace-nowrap font-mono text-[0.8125rem] tracking-[0.1em] text-ink">{story.code}</p>
            </div>
            <ClayLaptop className="mx-auto w-[78%]" tint="porcelain" pointerLight={false} />
            <div>
              <p className="font-display text-[clamp(1.25rem,6.2cqw,1.75rem)] leading-[1.02]">{story.deviceName}</p>
              <p className="mt-1 text-[0.75rem] text-ink-2">
                {story.stage === "recycled" ? "Recycled responsibly by" : story.stage === "in_progress" ? "Being refurbished by" : "Refurbished by"} Free Geek Toronto
              </p>
            </div>
          </div>
        </PassportBooklet>
      </Hero>
      <KineticLine as="h1" text="This laptop has a *story.*" delay={reduced ? 0 : 1.5} className="mt-[3cqh]" />
      <motion.button
        type="button"
        onClick={onBegin}
        data-no-tap
        className="mt-[3cqh] inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[0.9375rem] font-semibold text-white shadow-[0_14px_28px_-14px_rgba(23,32,28,.7)]"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0.15 } : { ...springSoft, delay: 2.1 }}
      >
        Tap to begin <ArrowRight className="size-4" aria-hidden />
      </motion.button>
    </div>
  );
}

/* 2 · Origin: where it started. The baton appears, glowing. */
function Origin({ story }: SlideProps) {
  const d = story.donor;
  const line = d.household ? `It started out with *${clean(d.label)}.*` : `Its first job was at *${clean(d.label)}.*`;
  return (
    <>
      <Eyebrow>{d.household ? "Leg 1 · Where it started" : "Leg 1 · Donated by a Reuse Partner"}</Eyebrow>
      <KineticLine text={line} className="mt-3" />
      <Sub>
        {story.deviceName}
        {story.year ? `, from around ${story.year}.` : "."} When it was time for an upgrade, it didn&apos;t go in a drawer. It went into the relay.
      </Sub>
      <Hero>
        <BatonSprite glow className="w-[62cqw] max-w-[300px]" rotate={-16} delay={0.7} />
      </Hero>
      {!d.named && !d.household ? <Footnote>The business chose not to be named, so we keep it private.</Footnote> : null}
    </>
  );
}

/* 3 · Handoff: two clay stations, the baton crosses between them. */
function Handoff({ story }: SlideProps) {
  const { reduced } = useStoryMotion();
  const { offered, received } = story.dates;
  const line = offered ? `Offered on *${storyDate(offered)}.* Handed to Free Geek Toronto on *${storyDate(received)}.*` : `Handed to Free Geek Toronto on *${storyDate(received)}.*`;
  const from = story.donor.named ? clean(story.donor.label) : story.donor.household ? "Its first owner" : "Its first office";
  return (
    <>
      <Eyebrow>The handoff</Eyebrow>
      <KineticLine text={line} size="sm" className="mt-3" />
      <Hero className="flex-col">
        <div className="relative w-full">
          {/* the lane between the stations fills as the baton crosses */}
          <div className="absolute left-[22%] right-[22%] top-[34px] h-[6px] overflow-hidden rounded-full bg-[rgba(23,32,28,.08)]">
            <motion.span
              className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-loop to-loop-light"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={reduced ? { duration: 0.15 } : { duration: 1.1, delay: 1.0, ease: [0.45, 0, 0.25, 1] }}
            />
          </div>
          <motion.div
            className="absolute top-[-6px] w-[26cqw] max-w-[120px]"
            initial={reduced ? { left: "64%" } : { left: "8%", y: 0, rotate: -10 }}
            animate={reduced ? { left: "64%" } : { left: ["8%", "37%", "64%"], y: [0, -46, 0], rotate: [-10, 8, -6] }}
            transition={reduced ? { duration: 0.15 } : { duration: 1.2, delay: 0.95, times: [0, 0.5, 1], ease: [0.45, 0, 0.25, 1] }}
          >
            <BatonSprite className="w-full" rotate={0} delay={0.4} />
          </motion.div>
          <div className="relative flex justify-between pt-[64px]">
            <Station label={from} date={storyDate(offered ?? received)} tint="apricot" icon={<Users />} />
            <Station label="Free Geek Toronto" date={storyDate(received)} tint="mint" icon={<Wrench />} delay={1.9} />
          </div>
        </div>
      </Hero>
      <Sub delay={1.6}>From one desk to the next, every move is stamped in its passport.</Sub>
    </>
  );
}

function Station({ label, date, tint, icon, delay = 0.5 }: { label: string; date: string; tint: "apricot" | "mint"; icon: ReactNode; delay?: number }) {
  const { reduced } = useStoryMotion();
  return (
    <motion.div
      className="flex w-[40%] flex-col items-center text-center"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0.15 } : { ...springSoft, delay }}
    >
      <span data-tint={tint} className="clay-sm grid size-[19cqw] max-h-[88px] max-w-[88px] place-items-center rounded-[30%] text-loop-deep [&_svg]:size-[38%] [&_svg]:stroke-[1.75]">
        {icon}
      </span>
      <span className="mt-3 text-[0.9375rem] font-semibold leading-tight text-ink">{label}</span>
      <span className="mt-1 font-mono text-[0.75rem] text-ink-2">{date}</span>
    </motion.div>
  );
}

/* 4 · Erased & verified: the sky seal stamps down. */
function Erased({ story }: SlideProps) {
  return (
    <>
      <Eyebrow>Certified data wipe</Eyebrow>
      <KineticLine text="Its old data, *wiped.*" className="mt-3" />
      <Hero>
        <Seal rim="DATA WIPED · VERIFIED · TORONTO · " icon={<ShieldCheck />} size={200} tilt={-8} />
      </Hero>
      <MonoChip className="self-start">VERIFIED · {storyDate(story.dates.wipeVerified).toUpperCase()}</MonoChip>
      <Sub delay={0.9}>The drive was wiped at the bench, then verified by Free Geek Toronto staff before the laptop could be refurbished or sold{story.donor.household ? "" : ", and the business gets a certificate that lists it"}.</Sub>
    </>
  );
}

const STEP_ICON: Record<BenchStep["kind"], ReactNode> = {
  hardware_test: <Cpu />,
  wipe_performed: <HardDrive />,
  wipe_verified: <ShieldCheck />,
  os_installed: <Terminal />,
  final_qa: <BadgeCheck />,
};

/* 5 · The volunteer leg: real checklist steps stamp in order. */
function Bench({ story }: SlideProps) {
  const v = story.volunteer;
  const done = story.benchSteps.every((s) => s.at);
  const recycled = story.stage === "recycled";
  const line = recycled
    ? v.named
      ? `*${clean(v.label)}* gave it a full check-up.`
      : "Volunteers gave it a full *check-up.*"
    : done
      ? v.named
        ? `*${clean(v.label)}* brought it back to life.`
        : `${capital(v.label)} brought it *back to life.*`
      : v.named
        ? `*${clean(v.label)}* is bringing it back to life.`
        : "It's on the volunteer bench *right now.*";
  const steps = recycled ? story.benchSteps.filter((s) => s.at) : story.benchSteps;
  return (
    <>
      <Eyebrow>Leg 2 · The bench</Eyebrow>
      <KineticLine text={line} size="sm" className="mt-3" />
      <Hero className="justify-start">
        <StampSequence stamps={steps.map((s) => ({ key: s.kind, label: s.label, date: s.at ? storyDate(s.at) : "Coming up", icon: STEP_ICON[s.kind], done: Boolean(s.at), tint: s.kind === "wipe_verified" ? "sky" : "butter" }))} />
      </Hero>
      {done && story.benchDays !== null && !recycled ? (
        <MonoChip className="self-start">
          {story.benchDays} DAY{story.benchDays === 1 ? "" : "S"} ON THE BENCH
        </MonoChip>
      ) : null}
      {!v.named ? <Footnote className="mt-3">Volunteers choose whether their name appears here.</Footnote> : null}
    </>
  );
}

/* 6 · Speed: donation to ready. */
function Speed({ story }: SlideProps) {
  const { reduced } = useStoryMotion();
  const days = story.daysToReady ?? 0;
  return (
    <>
      <Eyebrow>Turnaround</Eyebrow>
      <KineticLine text={`From donation to ready in *${days} day${days === 1 ? "" : "s"}.*`} size="sm" className="mt-3" />
      <Hero className="flex-col items-start">
        <div className="flex items-end gap-3">
          <OdometerDigits value={days} label={`${days} days`} className="text-[34cqw] leading-none" delay={0.6} />
          <span className="story-huge pb-[0.18em] text-[11cqw] text-loop-deep">day{days === 1 ? "" : "s"}</span>
        </div>
        <div className="mt-[4cqh] w-full">
          <div className="relative h-[6px] overflow-hidden rounded-full bg-white/70">
            <motion.span
              className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-loop to-loop-light"
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 90, damping: 20, mass: 1.2, delay: 0.8 }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[0.75rem] text-ink-2">
            <span>ARRIVED {storyDate(story.dates.received).toUpperCase()}</span>
            <span>READY {storyDate(story.dates.ready).toUpperCase()}</span>
          </div>
        </div>
      </Hero>
    </>
  );
}

/* 7 · Open source. */
function Software({ story }: SlideProps) {
  const { reduced } = useStoryMotion();
  const os = story.os!;
  return (
    <>
      <Eyebrow>Fresh start</Eyebrow>
      <KineticLine text={os.openSource ? `Now running *${clean(os.name)}:* free, open and fast.` : `A fresh install of *${clean(os.name)}.*`} size="sm" className="mt-3" />
      <Hero>
        <div className="relative w-[78cqw] max-w-[360px]">
          <ClayLaptop tint="mint" pointerLight={false} className="w-full" />
          <motion.span
            className="absolute -right-[4%] top-[6%] inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 font-mono text-[0.75rem] tracking-[0.06em] text-white shadow-[0_12px_24px_-12px_rgba(23,32,28,.7)]"
            initial={reduced ? { rotate: 4 } : { opacity: 0, scale: 0.7, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 4 }}
            transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 320, damping: 16, delay: 0.9 }}
          >
            <Terminal className="size-4" aria-hidden /> {os.openSource ? "OPEN SOURCE" : "FRESH INSTALL"}
          </motion.span>
        </div>
      </Hero>
      {os.openSource ? <Sub delay={0.8}>Open-source software keeps a refurbished computer useful for years, and its next owner pays nothing for licences.</Sub> : null}
    </>
  );
}

/* 8 · The numbers: liquid odometers. */
function Numbers({ story }: SlideProps) {
  const { kg, co2eKg, litresOfWater, factorsToVerify } = story.impact;
  const lead = story.stage === "recycled" ? "Recycled, not landfilled" : story.stage === "sold" ? "What reusing it saves" : "What its reuse will save";
  return (
    <>
      <Eyebrow>{lead}</Eyebrow>
      <KineticLine text={`*${kg} kg* kept out of landfill.`} size="sm" className="mt-3" />
      <Hero className="flex-col items-start justify-center gap-[3cqh]">
        <div>
          <div className="flex items-end gap-2">
            <OdometerDigits value={kg} decimals={kg % 1 === 0 ? 0 : 1} label={`${kg} kilograms`} className="text-[21cqw]" />
            <span className="story-huge pb-[0.12em] text-[9cqw] text-loop-deep">kg</span>
          </div>
          <p className="mt-2 text-[0.9375rem] text-ink-2">About the weight of {litresOfWater} litres of water.</p>
        </div>
        {co2eKg !== null && co2eKg > 0 ? (
          <div>
            <div className="flex items-end gap-2">
              <OdometerDigits value={co2eKg} label={`${co2eKg} kilograms of CO2e`} className="text-[15cqw]" delay={0.9} />
              <span className="story-huge pb-[0.12em] text-[6.5cqw] text-loop-deep">kg CO₂e</span>
            </div>
            <p className="mt-2 text-[0.9375rem] text-ink-2">avoided by not making a new one (est.)</p>
          </div>
        ) : null}
      </Hero>
      {factorsToVerify ? <Footnote>Estimates use placeholder impact factors, marked TO VERIFY until Free Geek Toronto confirms them.</Footnote> : null}
    </>
  );
}

/* 9 · Where your money goes: the pour. */
function Money({ story }: SlideProps) {
  const { reduced } = useStoryMotion();
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Eyebrow>Where your money goes</Eyebrow>
        {!story.priceBreakdownConfirmed ? <span className="rounded-full bg-[#FFF1BF] px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[#6b4e00]">Illustrative</span> : null}
      </div>
      <KineticLine text="Every dollar keeps the relay *running.*" size="sm" className="mt-3" />
      <Hero>
        <VesselPour slices={story.priceBreakdown} className="w-full" />
      </Hero>
      {story.pifSubsidized ? (
        <motion.p
          className="mt-2 flex items-start gap-2.5 rounded-[18px] bg-white/70 p-3 text-[0.9375rem] font-medium text-ink"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0.15 } : { ...springSoft, delay: 2 }}
        >
          <HandCoins className="mt-0.5 size-5 shrink-0 text-ember-ink" aria-hidden />
          Someone paid it forward to make this laptop more affordable.
        </motion.p>
      ) : null}
      {!story.priceBreakdownConfirmed ? <Footnote className="mt-2">Illustrative split, to be confirmed by Free Geek Toronto.</Footnote> : null}
    </>
  );
}

/* 10 · Why it isn't free. */
function Why() {
  const { reduced } = useStoryMotion();
  const items = [
    ["Refurbishing", "Testing every part and fixing what it can."],
    ["Data security", "Wiping and verifying every drive."],
    ["Fair wages & training", "Paid work and training for people facing barriers to employment."],
    ["Fair prices", "Free Geek Toronto aims for access that reflects ability to pay."],
  ];
  return (
    <>
      <Eyebrow>Honest pricing</Eyebrow>
      <KineticLine text="Why isn't it *free?*" className="mt-3" />
      <Sub delay={0.5}>Getting a computer ready for you is real work. The price pays for it:</Sub>
      <Hero className="items-start pt-[2.4cqh]">
        <ul className="grid w-full gap-[1.3cqh]">
          {items.map(([t, d], i) => (
            <motion.li
              key={t}
              className="rounded-[18px] bg-white/60 px-4 py-[1.2cqh]"
              initial={reduced ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reduced ? { duration: 0.15 } : { ...springSoft, delay: 0.8 + i * 0.12 }}
            >
              <p className="text-[0.9375rem] font-semibold text-ink">{t}</p>
              <p className="text-[0.8125rem] leading-snug text-ink-2">{d}</p>
            </motion.li>
          ))}
        </ul>
      </Hero>
      <Footnote delay={1.4} className="mt-3 !text-[0.8125rem] text-ink">
        Free Geek Toronto is an independent non-profit. Free Geek locations operate independently, so products, prices and services differ by city.
      </Footnote>
    </>
  );
}

/* 11 · Your turn: the baton lands with the viewer. */
function YourTurn({ story }: SlideProps) {
  const sold = story.stage === "sold";
  return (
    <>
      <Eyebrow>Leg 3 · {sold ? "You" : "What's next"}</Eyebrow>
      <KineticLine text={sold ? "Now it's your turn. *Pass it on.*" : "Ready for its next owner. *Could it be you?*"} className="mt-3" />
      <Hero className="flex-col">
        <Landing />
      </Hero>
      <Sub delay={1.4}>{sold ? "When you're done with it, bring it back to Free Geek Toronto and its relay keeps going." : "Find it, and computers like it, at Free Geek Toronto."}</Sub>
    </>
  );
}

/** The baton drops onto a clay cradle and settles. */
function Landing({ waiting = false }: { waiting?: boolean }) {
  const { reduced } = useStoryMotion();
  return (
    <div className="relative flex w-full flex-col items-center">
      <motion.div
        className="relative z-10 w-[48cqw] max-w-[240px]"
        initial={reduced ? false : { y: -260, rotate: -30, opacity: 0 }}
        animate={{ y: waiting ? -18 : 6, rotate: waiting ? -8 : 0, opacity: 1 }}
        transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 320, damping: 16, delay: 0.7 }}
      >
        <BatonSprite className="w-full" rotate={0} delay={0} glow={!waiting} />
      </motion.div>
      <motion.div
        data-tint="porcelain"
        className={cn("clay -mt-3 h-[9cqh] max-h-[72px] w-[64cqw] max-w-[300px] !rounded-[50%]", waiting && "opacity-70")}
        initial={reduced ? false : { scaleX: 1 }}
        animate={reduced || waiting ? { scaleX: 1 } : { scaleX: [1, 1.08, 0.98, 1], scaleY: [1, 0.88, 1.02, 1] }}
        transition={{ duration: 0.6, delay: 0.95 }}
      />
    </div>
  );
}

/* 11b · In progress: the next leg is coming. */
function NextLeg({ story }: SlideProps) {
  return (
    <>
      <Eyebrow>Leg {story.leg + 1} · Coming soon</Eyebrow>
      <KineticLine text="Its next leg is *coming soon.*" className="mt-3" />
      <Hero className="flex-col">
        <Landing waiting />
      </Hero>
      <Sub delay={1.2}>Scan this code again in a few weeks to see where the relay takes it next.</Sub>
    </>
  );
}

/* Recycled: a short, respectful ending. */
function Recycled({ story }: SlideProps) {
  const { reduced } = useStoryMotion();
  return (
    <>
      <Eyebrow>Recycled responsibly{story.dates.recycled ? ` · ${storyDate(story.dates.recycled)}` : ""}</Eyebrow>
      <KineticLine text="Its parts live on through *responsible recycling.*" size="sm" className="mt-3" />
      <Hero>
        <motion.span
          data-tint="mint"
          className="clay grid size-[46cqw] max-h-[220px] max-w-[220px] place-items-center !rounded-[34%] text-loop-deep"
          initial={reduced ? false : { scale: 0.6, rotate: -40, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 170, damping: 18, delay: 0.5 }}
        >
          <Recycle className="size-[44%] stroke-[1.5]" aria-hidden />
        </motion.span>
      </Hero>
      <Sub delay={0.9}>Not every laptop can be refurbished. When one can&apos;t, Free Geek Toronto makes sure it&apos;s recycled responsibly instead of sent to landfill.</Sub>
    </>
  );
}


/* Persona: Wrapped's "personality" reveal. A holographic plate flips in, then its traits stamp down. */
function PersonaSlide({ story }: SlideProps) {
  const { reduced } = useStoryMotion();
  const p = story.persona;
  return (
    <>
      <Eyebrow>Its passport personality</Eyebrow>
      <KineticLine text="After everything, this laptop is…" size="sm" className="mt-3" />
      <Hero className="flex-col gap-[3cqh]">
        <motion.div
          className="story-holo w-full max-w-[380px]"
          initial={reduced ? false : { rotateY: -90, scale: 0.7, opacity: 0 }}
          animate={{ rotateY: 0, scale: 1, opacity: 1 }}
          transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 120, damping: 14, delay: 1.1 }}
          style={{ transformPerspective: 900 }}
        >
          <div className="flex flex-col items-center rounded-[26px] bg-[#0A3D2B] px-[6cqw] py-[3.4cqh] text-center">
            <motion.span
              className="grid size-[16cqw] max-h-16 max-w-16 place-items-center rounded-full bg-[#8FF5C4] text-[#0A3D2B] shadow-[0_0_40px_rgba(143,245,196,.55)] [&_svg]:size-[46%] [&_svg]:stroke-[2]"
              initial={reduced ? false : { scale: 0, rotate: -120 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 260, damping: 14, delay: 1.6 }}
            >
              {PERSONA_ICON[p.key]}
            </motion.span>
            <p className="story-huge mt-[2cqh] text-[clamp(2.4rem,13cqw,4rem)] !leading-[0.9] text-[#F6F3EC]">{p.name}</p>
            <p className="mt-[1.4cqh] max-w-[28ch] text-[0.9375rem] leading-snug text-[#B9E6D2]">{p.tagline}</p>
          </div>
        </motion.div>
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Traits">
          {p.traits.map((t, i) => (
            <motion.li
              key={t}
              className="rounded-full border border-[#8FF5C4]/40 bg-[#8FF5C4]/10 px-3.5 py-1.5 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-[#E4FBEF]"
              initial={reduced ? false : { opacity: 0, scale: 1.6, rotate: i % 2 ? 8 : -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={reduced ? { duration: 0.15 } : { type: "spring", stiffness: 480, damping: 20, delay: 2.2 + i * 0.16 }}
            >
              {t}
            </motion.li>
          ))}
        </ul>
      </Hero>
    </>
  );
}

function capital(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
