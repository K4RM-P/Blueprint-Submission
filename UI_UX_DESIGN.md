# GeekLoop — UI/UX Design Spec

**Companion to:** `PRD.md` (what & why) and `KICKOFF_PROMPT.md` (build stages).  
**This document supersedes PRD §15.** Claude Code must read it before building any UI, and every UI stage must pass the **Taste Checklist (§14)** before its checkpoint.

---

## 0. The idea in one sentence

> **GeekLoop should feel like holding a beautifully made object: soft, tactile clay you want to press, with liquid that flows through it to show that technology keeps moving — precise and calm like Apple, warm and hopeful like a community workshop.**

Three words to judge every screen against: **Tactile. Flowing. Precise.**

- **Tactile** → claymorphism. Things you can press look pressable and respond like soft material.
- **Flowing** → liquid motion. Value *flows* from donor → bench → buyer. Liquid is never decoration; it always means *something is moving or filling*.
- **Precise** → Apple restraint. Generous space, crisp type, exact alignment, few colors, one idea per section. "Futuristic" here means **precision and light**, never neon, never cyberpunk.

### Why clay + liquid is right for Free Geek Toronto (say this in the pitch)
Clay = repair, hands, craft, warmth — the opposite of disposable tech. Liquid = the circular economy — devices flowing back into the community. The visual language *is* the mission.

---

## 1. Design principles

1. **Clay is for things you touch.** Buttons, cards you can open, toggles, badges, stat pebbles, hero objects. Page backgrounds, tables, body text areas and long forms stay **flat and quiet**. If everything is clay, nothing is.
2. **Liquid means flow or fill.** Use liquid only for: progress/filling (score meter, capacity, uploads), transitions between states (tab indicator, step changes), and the journey of a device. Never as random background goo on every page.
3. **One hero per view.** Each screen has exactly one expressive moment. Everything else supports it.
4. **Motion has physics.** Springs, not linear easings. Things have weight, squash slightly, settle. Nothing spins, bounces forever, or loops for attention.
5. **Real data, specific words.** "20 Dell Latitude laptops → 16 students online" beats "Impact metrics." Copy is part of the design.
6. **Calm by default, joy on success.** The interface is quiet while you work and celebrates when you finish something (badge unlock, batch submitted, certificate issued).
7. **Accessible is non-negotiable.** Digital inclusion is the mission. Soft clay must still hit contrast targets; all motion respects reduced-motion settings.

---

## 2. Expression dial (per audience)

Each area of the app has a different personality. Components read `data-expression` on the shell to scale motion and decoration.

| Area | Level | Feel | What changes |
|---|---|---|---|
| Public site + Passport | **3 — Expressive** | Inspirational, showpiece | Liquid hero, scroll-driven loop, stamp animations, pointer light |
| Volunteer bench | **3 — Playful** | Game-like, tactile | Press-and-hold liquid confirm, badge coins, celebration |
| Partner portal | **2 — Polished** | Premium, reassuring | Clay cards, liquid meters, gentle springs, one celebration on submit |
| Staff console | **1 — Efficient** | Calm, dense, fast | Flatter surfaces, clay only on primary actions and active nav, minimal motion, tables crisp |

---

## 3. Color

Warm, light, and few. No purple-to-blue gradients. No rainbow.

### 3.1 Core tokens

| Token | Hex | Use |
|---|---|---|
| `--canvas` | `#F3EFE8` | App background (warm porcelain) |
| `--surface` | `#FBF9F5` | Default clay / card surface |
| `--surface-flat` | `#FFFFFF` | Tables, long forms, PDFs |
| `--ink` | `#17201C` | Primary text (≈ 15:1 on canvas) |
| `--ink-2` | `#4A544F` | Secondary text (≥ 7:1) |
| `--ink-3` | `#6F7873` | Tertiary/meta text (≥ 4.5:1 — never lighter) |
| `--line` | `#E4DED4` | Hairlines, dividers |
| `--loop` | `#138A61` | Brand green: links, active states, primary data |
| `--loop-deep` | `#0B5E42` | Pressed/hover green, text on mint |
| `--ember` | `#F26A2E` | The one CTA color (primary buttons only) |
| `--ember-deep` | `#C9501C` | Ember pressed |
| `--success` | `#1E9E6A` · `--warning` `#D99A1E` · `--danger` `#D64545` | Semantic only |

### 3.2 Clay tints (pastel surfaces with *tinted* shadows)
Clay never uses grey shadows. Each tint carries its own shade and drop color.

| Tint | Surface | Inner shade | Drop shadow | Meaning |
|---|---|---|---|---|
| `porcelain` | `#FBF9F5` | `rgba(90,75,55,.14)` | `rgba(90,75,55,.18)` | Default |
| `mint` | `#D7F1E4` | `rgba(19,138,97,.22)` | `rgba(19,138,97,.26)` | Reuse, success, environment |
| `apricot` | `#FFE0CB` | `rgba(226,104,46,.22)` | `rgba(226,104,46,.24)` | Partners, energy, CTAs |
| `sky` | `#DCEAFE` | `rgba(46,104,196,.20)` | `rgba(46,104,196,.22)` | Data security, trust |
| `butter` | `#FFF1BF` | `rgba(176,128,0,.20)` | `rgba(176,128,0,.22)` | Volunteers, badges, achievement |

**Rule:** max **two tints per screen** plus porcelain. Text on tints uses `--ink` (all tints pass AA).

### 3.3 Liquid
Liquid is always `--loop` → `#2FBF8A` (a two-stop green, same hue family — not a rainbow gradient), with a 1px lighter meniscus line. Ember liquid only for the Pay-It-Forward fund.

---

## 4. Typography

Apple-clean with one note of personality.

| Role | Font | Notes |
|---|---|---|
| Display (H1–H2, big numbers) | **Bricolage Grotesque** (variable, Google Fonts) | Characterful, rounded, friendly. Weight 600–700, tracking −0.035em, optical size max. Use sparingly. |
| UI & body | **Geist Sans** | Neutral, crisp, "precise." Weight 400/500/600. |
| Codes & data | **Geist Mono** | Passport codes, certificate numbers, serials, tabular figures. |

Load with `next/font` (no layout shift).

### Scale (rem, 16px base)

| Token | Size / line-height | Use |
|---|---|---|
| `display-xl` | 5.5 / 0.95 | Landing hero only (clamp down to 3rem on mobile) |
| `display-l` | 4 / 1.0 | Section openers, Passport device name |
| `display-m` | 2.75 / 1.05 | Page titles |
| `title` | 1.5 / 1.2 | Card titles |
| `body-l` | 1.1875 / 1.55 | Lead paragraphs |
| `body` | 1.0625 / 1.6 | Default (17px, Apple-ish) |
| `small` | 0.875 / 1.45 | Meta, captions |
| `micro` | 0.75 / 1.3, +0.06em, uppercase | Eyebrow labels only |

Rules: max line length 65ch. Numbers in stats use `font-variant-numeric: tabular-nums`. No gradient text. No all-caps headlines.

---

## 5. Space, shape, layout

- **8-pt spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Sections on public pages breathe at 128–160px vertical.
- **Radii:** `--r-sm 12px` (inputs, chips) · `--r-md 20px` (buttons are full pill) · `--r-lg 28px` (cards) · `--r-xl 40px` (hero objects, sheets). Use **squircle-ish smoothing** where possible (`corner-shape: squircle` progressive enhancement; fall back to border-radius).
- **Grid:** 12 columns, 24px gutter, max content width 1200px (1320 for staff tables). 16px side gutter on mobile.
- **Layouts are asymmetric on purpose:** e.g. 7/5 splits, offset images, a big number next to a small explanation. Avoid three identical cards in a row.
- **Bento grids** for dashboards, but every tile size must reflect importance (primary metric = 2×2, supporting = 1×1).

---

## 6. The clay system (implementation)

### 6.1 Recipe
Clay = surface tint + soft inner highlight (top-left light) + inner shade (bottom-right) + tinted, diffuse drop shadow. Light source is always **top-left**.

```css
:root {
  --clay-surface: #FBF9F5;
  --clay-shade: rgba(90,75,55,.14);
  --clay-drop: rgba(90,75,55,.18);
}
[data-tint="mint"]    { --clay-surface:#D7F1E4; --clay-shade:rgba(19,138,97,.22);  --clay-drop:rgba(19,138,97,.26); }
[data-tint="apricot"] { --clay-surface:#FFE0CB; --clay-shade:rgba(226,104,46,.22); --clay-drop:rgba(226,104,46,.24); }
[data-tint="sky"]     { --clay-surface:#DCEAFE; --clay-shade:rgba(46,104,196,.20); --clay-drop:rgba(46,104,196,.22); }
[data-tint="butter"]  { --clay-surface:#FFF1BF; --clay-shade:rgba(176,128,0,.20);  --clay-drop:rgba(176,128,0,.22); }

.clay {
  background: var(--clay-surface);
  border-radius: var(--r-lg);
  box-shadow:
    inset 6px 6px 14px rgba(255,255,255,.75),   /* highlight */
    inset -8px -10px 18px var(--clay-shade),      /* inner shade */
    0 22px 44px -18px var(--clay-drop),           /* main drop */
    0 6px 12px -6px var(--clay-drop);             /* contact shadow */
}
.clay-sm { /* buttons, chips, pebbles: same recipe, halved values */ }
.clay:active, .clay[data-pressed] {             /* pressed = pushed into the surface */
  box-shadow:
    inset 8px 10px 16px var(--clay-shade),
    inset -4px -4px 10px rgba(255,255,255,.6),
    0 2px 4px -2px var(--clay-drop);
  transform: scale(.97);
}
.well {                                          /* inputs: pressed INTO the page */
  background: #F7F4EE;
  border-radius: var(--r-sm);
  box-shadow: inset 3px 4px 8px rgba(90,75,55,.12), inset -2px -2px 6px rgba(255,255,255,.8);
}
.flat { background: var(--surface-flat); border: 1px solid var(--line); border-radius: var(--r-md); box-shadow: none; }
```

Expose as Tailwind utilities/components (`clay`, `clay-sm`, `well`, `flat`, `data-tint`). shadcn components are restyled to these tokens — never shipped with default shadcn look.

### 6.2 Where clay goes (and doesn't)

| Clay ✅ | Flat ❌ |
|---|---|
| Primary & secondary buttons, toggles, segmented controls | Data tables, long form bodies |
| Openable cards (batches, devices on bench) | Page background, section backgrounds |
| Stat pebbles, badges, icon tiles | Dropdown menus, tooltips (use crisp flat + subtle shadow) |
| Hero objects (clay laptop, passport card) | Text-heavy pages (About, methodology) |
| Nav dock and active nav pill | Certificate & report PDFs (always flat, print-professional) |

### 6.3 Icons
Lucide icons, stroke 1.75, `--ink` or `--loop-deep`. When an icon needs presence it sits in a **clay icon tile** (44px squircle, tinted). Never mix icon sets. No emoji in UI chrome.

### 6.4 Hero objects (custom SVG, built in code)
Three simple, chunky clay illustrations drawn as SVG with the same light model (radial highlight top-left, tinted shade bottom-right):
1. **Clay laptop** (landing hero, Passport header): rounded, slightly toy-like proportions, screen shows a tiny liquid loop.
2. **Clay vessel** (Batch Value Score, Pay-It-Forward jar).
3. **Badge coins** (volunteer badges): thick rounded discs with an embossed lucide glyph.
Keep them geometric and simple — no faces, no mascots, no stock 3D.

---

## 7. Motion system

Library: **`motion`** (Motion for React, formerly Framer Motion). CSS for simple hover states.

### 7.1 Springs (the only easing presets allowed)

| Name | Config | Use |
|---|---|---|
| `soft` | `{ type:"spring", stiffness:170, damping:24 }` | Cards entering, layout changes |
| `press` | `{ type:"spring", stiffness:520, damping:30 }` | Button press/release |
| `bouncy` | `{ type:"spring", stiffness:320, damping:16 }` | Celebration only (badges, submit success) |
| `liquid` | `{ type:"spring", stiffness:90, damping:20, mass:1.2 }` | Fills, meters, gooey indicators |
| `fade` | `{ duration:.2, ease:[.2,0,0,1] }` | Opacity-only transitions |

Put them in `lib/motion.ts`. Durations feel under 400ms for UI; fills up to 900ms.

### 7.2 Liquid techniques

1. **Gooey merge filter** (`<GooFilter/>` SVG: `feGaussianBlur stdDeviation=8` → `feColorMatrix` alpha `18 -7`). Used for: tab/segmented indicator that *stretches* between options; stepper dots that merge as you advance; toast emerging from a pill. Apply only to the small indicator layer, never to text.
2. **Liquid fill with wave surface** (`<LiquidFill value={0..1}/>`): SVG clip-path vessel; two sine-wave paths offset in phase drift horizontally (8s loop, translateX only); level animates with the `liquid` spring. Used for Batch Value Score, capacity "glasses", uploads, Pay-It-Forward jar, Hold-to-confirm.
3. **Blob morph** (`<LiquidBlob/>`): 2–3 large, blurred (`filter: blur(40px)`), low-opacity (≤ .35) mint/apricot blobs morphing between 4 SVG paths over 18–24s. **Landing hero and Passport header only.** Paused when offscreen (IntersectionObserver) and disabled on low-power/reduced-motion.
4. **Flow line** (`<FlowLine/>`): a thick rounded path whose `pathLength` fills with liquid green as the user scrolls (scroll-linked via `useScroll`). Used for the device journey timeline and landing "loop" section.
5. **Liquid press** (buttons): on press, a small circular ripple of `--clay-shade` expands from the pointer and fades in 350ms — subtle, inside the button only.

### 7.3 Micro-interactions catalogue

| Element | Interaction |
|---|---|
| Clay button | Hover: lift 2px + shadow grows. Press: `press` spring to scale .97 + pressed shadow. Release: settles with 1 overshoot. |
| Toggle | Knob is a clay pebble; slides with `liquid` spring and stretches 15% horizontally mid-travel (squash & stretch). Track fills with liquid green. |
| Segmented control / tabs | Gooey indicator stretches from old to new option, then snaps. |
| Number stats | Count up with spring when first in view (once). Tabular nums so width doesn't jump. |
| Cards → detail | Shared-element `layoutId` morph: the batch card expands into the detail header. |
| Wizard steps | Content slides 24px + fades; stepper dots merge gooey-style. |
| Form errors | Field does a 2-cycle 4px shake (`press` spring) + message slides in. Never red flashes. |
| Toasts | Emerge from a pill at the bottom with gooey stretch; auto-dismiss 4s. |
| Hold-to-confirm | Button fills with liquid over 1.2s while held; release early drains it back. Completion = soft haptic (`navigator.vibrate(10)` where supported) + check. |
| Pointer light | On hero clay objects only: a soft radial highlight follows the pointer (max 10px travel). Desktop only. |
| Skeletons | Clay-shaped placeholders with a slow liquid sheen sweep (1.6s), not grey bars. |

### 7.4 Celebrations (rare, earned)
- **Batch submitted:** the clay vessel fills to the batch's score, a liquid droplet "flows" into the partner's dashboard icon. One time.
- **Badge unlocked:** coin drops from top with `bouncy` spring, squashes on landing, a single liquid ring ripples out, name types in. Max 1.4s. No confetti cannons.
- **Certificate issued:** a sky-tinted seal stamps onto the card (scale 1.3 → 1, `press` spring) with a soft ring.

### 7.5 Reduced motion & performance
- `prefers-reduced-motion: reduce` → no blobs, no waves (static fill level), no scroll-linked effects, counters show final values, springs replaced with 150ms fades. Build this into `lib/motion.ts` via `useReducedMotion`.
- Animate only `transform` and `opacity` (plus SVG path `d` for blobs offscreen-paused). No animated `box-shadow` on large lists — swap classes instead.
- Max 1 blur-filtered animated layer per viewport. Disable blobs below 768px wide or when `navigator.hardwareConcurrency <= 4`.
- Targets: 60fps on a mid-range phone; Lighthouse performance ≥ 90 on `/` and `/p/[code]`.

---

## 8. Core components (spec)

| Component | Spec |
|---|---|
| **Button** | Pill, 48px tall (44 min touch). `primary`: ember clay, white text 600. `secondary`: porcelain clay, ink text. `ghost`: no clay, loop-green text, underline on hover. Max **one** primary per view. |
| **ClayCard** | `clay` + `data-tint`, 24–32px padding, `--r-lg`. Interactive cards lift on hover; static cards don't. |
| **StatPebble** | Small clay pebble: big Bricolage number, `micro` label above, optional delta chip. Counts up on view. |
| **LiquidMeter** | Clay vessel + LiquidFill + label (e.g. "Batch Value Score · 86 · Excellent"). Level color stays green; label carries meaning (never color alone). |
| **CapacityGlasses** | 8 small clay glasses (one per week) filling to that week's load; Full weeks get a lid and `aria-disabled`. Selecting a week presses it in. |
| **JourneyTimeline** | Vertical FlowLine with **stamp** nodes (see Passport). Horizontal compact variant for tables/cards. |
| **Stamp** | Round clay seal with icon + label + date. Animates in by pressing into the card (scale 1.15 → 1, slight rotation −4° → 0°). |
| **BadgeCoin** | Butter-tint thick disc; locked = flat outline with progress ring; unlocked = full clay. |
| **Input / Select / Textarea** | `well` style, 48px tall, label above (always visible, no placeholder-as-label), focus = 2px loop-green ring + well deepens slightly. |
| **Toggle / Checkbox / Radio** | Clay knob/pebble on well track; liquid fill when on. |
| **Tabs / Segmented** | Well track + gooey clay indicator. |
| **Dialog / Sheet** | Porcelain clay, `--r-xl`, rises with `soft` spring from bottom on mobile, scales from 0.96 on desktop. Backdrop: canvas at 60% + 8px blur. |
| **Table** | Flat white, hairline rows, 52px rows, sticky header, tabular nums, status shown as small tinted chips. Row hover = canvas tint. |
| **Status chip** | Tinted flat pill (not clay) — mint reuse, sky security, butter in-progress, apricot partner, neutral for others. Always includes text. |
| **Nav (app shells)** | Desktop: slim flat sidebar, active item is a clay pill that slides (gooey) between items. Mobile: floating clay **dock** at bottom (4–5 items, 64px, safe-area aware). |
| **Empty state** | Small clay illustration + one specific sentence + one action. e.g. "No batches yet. Your first 5 laptops could reach a classroom next month." |
| **Toast** | Dark ink pill, white text, gooey emerge; success icon in mint pebble. |
| **Demo banner** | Thin butter strip, top: "Demo environment · fictional data" — calm, not alarming. |

---

## 9. Page designs

### 9.1 Landing `/` — Expression 3
1. **Hero (7/5 split).** Left: eyebrow `FREE GEEK TORONTO × GEEKLOOP`; headline in display-xl: **"Old laptops. New loops."**; one-line lead: "We turn your business's retired laptops into affordable computers for Toronto students, newcomers and families — and show you every step." Primary CTA "Become a Reuse Partner", secondary "Scan a Passport". Right: the clay laptop hero object floating over two LiquidBlobs, with pointer light. A tiny live counter pebble under it: "1,284 devices back in use" (from `public_impact_totals`).
2. **The Loop (scroll-driven, pinned).** A FlowLine travels through 4 clay stations as you scroll: *Donated → Wiped & verified → Refurbished by volunteers → In someone's hands.* Each station has one sentence and one real number. This is the page's showpiece.
3. **Live impact strip.** Four StatPebbles, asymmetric bento (one large: kg e-waste diverted). Methodology link.
4. **For each audience.** Three *different-sized* cards (not identical): Businesses (apricot, largest), Volunteers (butter), Buyers (mint). Each with a specific line and one action.
5. **Partner Wall preview.** Calm grid of partner logos in porcelain clay tiles with devices-reused counts. No marquee.
6. **Honest footer note:** Free Geek Toronto is independent; links to About and pricing philosophy.

### 9.2 Device Passport `/p/[code]` — Expression 3, mobile-first (the hero of the demo)
Metaphor: **a real passport** that collects stamps.
1. **Passport cover card** (apricot-to-porcelain clay, `--r-xl`): Geist Mono code `FGT-7K3M9Q2X`, device name in display-l ("Dell Latitude 5420"), key specs as chips, small clay laptop. Subtle LiquidBlob behind.
2. **"Its second life" — stamps.** Vertical JourneyTimeline; as you scroll, each Stamp *presses* onto the page and the FlowLine fills: *Donated by Maple Ledger Accounting · Data wiped & verified · Refurbished by Aisha · Ready for its next owner.* Attribution falls back gracefully ("a Toronto business", "an FGT volunteer").
3. **Impact pebbles:** kg kept out of landfill, CO₂e avoided, "Running open-source Linux Mint."
4. **"Where your money goes":** one clay bar split into liquid segments that flow in left-to-right, each labelled with % and plain words. "Illustrative" tag if unconfirmed.
5. **"Why isn't it free?"** — a short, warm, honest paragraph in a flat card.
6. **Network note** (sky tint, data-security icon): "Refurbished by Free Geek Toronto, an independent non-profit. Free Geek locations run independently, so products and prices differ by city."
7. CTA row: "Pay it forward" (P1) · "Donate your old laptop".
Print view: flat, black-on-white, no animation.

### 9.3 Become a Partner `/become-a-partner` — Expression 3
Hero with a big honest promise ("Retire your laptops. Get proof they're wiped. See exactly who they help."), a 4-step horizontal FlowLine, **tier cards** (Community porcelain, Impact apricot raised higher, Champion butter) with a gooey segmented "What's included" comparator, data-security section in sky, FAQ accordions (clay header pebbles that press).

### 9.4 Partner portal — Expression 2
- **Dashboard:** bento — large mint tile "Your laptops are now helping **16 people**" with recipient-category breakdown pebbles; devices over time chart (green area with liquid sheen on load); certificates tile (sky); recent batches as clay cards with compact timelines; Community tier sees a tasteful apricot upgrade card (not a nag).
- **Batch wizard:** two-column on desktop. Left: steps in a porcelain clay card with gooey stepper. Right (sticky): **LiquidMeter** of Batch Value Score that rises live as line items are added, with one contextual tip beneath. Step 2 uses **CapacityGlasses**. Submit triggers the celebration (§7.4). Mobile: meter collapses into a sticky top pill.
- **Batch detail:** shared-element morph from the card; horizontal timeline; device journeys table (flat); certificate card with stamp once issued.

### 9.5 Staff console — Expression 1
Dense, fast, calm. Flat white tables, hairlines, keyboard shortcuts (`/` search, `j/k` rows, `v` verify selected). Clay reserved for: primary action buttons, active nav pill, the 4 overview StatPebbles, and the capacity chart's glasses. Bulk-action bar slides up as a dark ink floating pill when rows are selected. Certificate issue uses the stamp moment. QR label sheet is pure print layout.

### 9.6 Volunteer bench — Expression 3, phone-first
- **My Bench:** big clay cards of assigned devices; floating **"Claim next device"** primary button in the dock.
- **Checklist:** four huge stacked step tiles (minimum 72px tall). Tapping completes simple steps; **"Data wipe performed" uses Hold-to-confirm** (liquid fills the tile) because it matters. Each completion presses a mini stamp and advances the FlowLine.
- **Skills Wallet:** profile header with counts; **BadgeCoin** grid (locked coins show progress rings: "7 / 10 wipes"); "Passports you're on" horizontal scroller of mini passport covers. Badge unlock celebration.

### 9.7 Demo `/demo`
Three tall clay cards (apricot Partner, sky Staff, butter Volunteer), each with a clay icon tile, a one-line "Try this:" instruction, and a primary button. Pressing a card presses it in, then the page morphs into that dashboard.

### 9.8 Verify `/verify/[n]` and certificates
Verify page: calm, centered sky seal with check, certificate facts in Geist Mono. **Certificate PDF and reports are flat and formal** — white, ink text, loop-green rules, small GeekLoop + Free Geek Toronto wordmarks, no clay, no gradients. They must look like documents a company would file.

---

## 10. Voice & copy

- Plain, warm, specific, active. Grade 8 reading level on public pages.
- Lead with people and outcomes, back with numbers: "Your 20 laptops are now helping 16 students and newcomers get online."
- Honest about money: never imply products are free; explain pricing kindly.
- Microcopy examples: Empty bench → "Nothing on your bench. Claim the next device when you're ready." · Capacity full → "This week's bench is full — the next open week is Nov 16." · Success → "Batch sent. We'll confirm your drop-off week within 2 business days."

**Banned phrases:** "Unlock the power of", "Supercharge", "Revolutionize", "Seamless", "Elevate", "Next-gen", "Harness", "In today's fast-paced world", "🚀", "✨".

---

## 11. Accessibility

- Contrast: text ≥ 4.5:1 (body) / 3:1 (≥ 24px). Clay edges are decorative — every interactive element also has a visible label and a **2px loop-green focus ring** offset 3px (clay shadows don't count as focus).
- Never use color or liquid level alone: always text values ("86 · Excellent").
- Touch targets ≥ 44px (48 default, 72 on bench).
- Hold-to-confirm has a keyboard/screen-reader alternative (press Enter twice / a confirm dialog) and `aria-live` progress.
- Gooey/blob layers are `aria-hidden`. Respect `prefers-reduced-motion` and `prefers-contrast: more` (increase line weights, drop inner shades).
- Every animation that conveys state has an equivalent static state.

---

## 12. Anti-AI-slop rules (hard bans)

1. No purple/blue/pink gradients, no gradient text, no glowing neon borders.
2. No glassmorphism stacked everywhere (one backdrop blur on dialogs only).
3. No identical three-card icon grids as the default section layout.
4. No centered-everything pages; use asymmetry and alignment.
5. No grey drop shadows on clay; shadows are tinted.
6. No stock photos, no 3D human characters, no mascot, no sparkle icons.
7. No emoji in headings or buttons.
8. No lorem ipsum or fake round numbers in demos (use seeded data).
9. No infinite attention-seeking animations (bouncing arrows, pulsing CTAs, marquees).
10. No more than two clay tints per screen; no more than one primary button per view.
11. No default shadcn look anywhere — every component restyled to tokens.
12. No custom cursors, no scroll-jacking beyond the one pinned Loop section, no page-load splash screens.

---

## 13. Implementation notes for Claude Code

- Dependencies to add: `motion`, fonts via `next/font/google` (`Bricolage_Grotesque`, `Geist`, `Geist_Mono`).
- Files:
  - `app/globals.css` — tokens (§3, §5), clay utilities (§6.1), reduced-motion overrides.
  - `lib/motion.ts` — spring presets (§7.1), `useMotionPrefs()` (reduced motion + low-power detection + expression level).
  - `components/clay/` — `ClayButton`, `ClayCard`, `StatPebble`, `ClayToggle`, `Segmented`, `BadgeCoin`, `Stamp`, `IconTile`, `Dock`.
  - `components/liquid/` — `GooFilter`, `LiquidFill`, `LiquidMeter`, `CapacityGlasses`, `LiquidBlob`, `FlowLine`, `HoldToConfirm`.
  - `components/illustrations/` — `ClayLaptop`, `ClayVessel` (pure SVG).
- Build a **`/styleguide`** route (dev + demo only) in Stage 0/2 showing every token and component in every state. Every later stage reuses these components — no one-off styles.
- Shell sets `data-expression="1|2|3"`; components read it to scale motion (e.g. level 1 disables blobs and celebrations).
- Charts (Recharts): loop-green series, hairline grid, no legends when a label suffices, rounded bar ends, tooltips styled as flat cards.

---

## 14. Taste Checklist (run at the end of every UI stage)

- [ ] Does each screen have exactly **one** hero moment?
- [ ] Is clay only on things you can touch? Are tables and long text flat?
- [ ] Does every liquid animation mean *fill* or *flow*?
- [ ] ≤ 2 tints, ≤ 1 primary button per view?
- [ ] Is the copy specific, with real numbers from seed data?
- [ ] Squint test: is the hierarchy obvious (one biggest thing)?
- [ ] Reduced-motion mode works and still looks finished?
- [ ] 360px phone: nothing cramped, nothing overflows, targets ≥ 44px?
- [ ] Keyboard: every action reachable, focus ring visible?
- [ ] Would this look at home next to an Apple product page — calm, exact, generous? If it looks like a generic AI dashboard, simplify.
- [ ] None of the §12 bans present?
