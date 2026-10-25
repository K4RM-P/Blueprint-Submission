# Landing revamp: audit, research, concepts

## 1. Blunt audit of the current `/` (see `landing-before/`)

- **Hero is a template.** Headline-left / object-right 7/5 split, eyebrow, two pills. It reads like every SaaS hero of 2023. Nothing about it says *relay*.
- **"Every laptop has another leg to run."** Clever but slow. Takes two reads. The product's own tagline, "Pass it on.", never appears.
- **The laptop is a toy.** Peach slab with a dark screen; it sits in a box of empty space and does nothing after the lid opens. The pointer light is barely visible.
- **"5 8" odometer** looks like a broken calculator: two lonely tiles in a glass chip, offset under the laptop, not anchored to anything.
- **Hard stop under the hero.** The hero ends, then a new section starts with a new eyebrow. Nothing carries you down. The baton in the relay section appears from nowhere.
- **Relay section:** a long empty gap after the pinned block in full-page view (240vh pin), four identical cards with icons in rounded squares (§12.3-adjacent), stats tucked at the bottom of each card where they lose to the body text.
- **Live impact:** a decent bento, but every tile appears the same way (counter only) and the section header is "Live impact" with no sentence. Flat.
- **Audience cards:** generic icon-in-a-tile + eyebrow + bold sentence. The two right cards are identical in structure.
- **Passport strip:** `border-y` hairlines create the only hard edges on the page. Feels like a footer form.
- **Partner wall:** six identical tiles in a 3×2 grid. The best partner looks exactly like the newest one.
- **Rhythm:** every section starts with the same left heading + right link line; section spacing is uniform; no moment where the page breathes or changes tempo.
- **Mobile:** headline wraps to four lines; the laptop is pushed below the fold so the 360px fold is just text and two buttons.

## 2. What I looked at and what is worth adapting

Sources: Awwwards "Creative Pass" hero collections (hero-section animations, typography-led heroes, preloader→hero sequences), Apple product page teardowns, Linear/Stripe hero teardowns (SaaS Frame), Chrome's scroll-driven/scroll-triggered animation docs, MDN-style guides on `animation-timeline: view()`, gooey/metaball write-ups (dev.to SVG metaballs, gooey-react notes on Safari), Smashing/LogRocket/daisyUI on claymorphism.

**Hero patterns**
- Typography-led heroes win when the line is short. Apple and Linear use one headline, one line, two CTAs and *one* object; the object carries the emotion. → Shrink the copy to "Pass it on." and make the object do the storytelling.
- Choreographed entrances on award sites are short (≈1–1.5s), staggered, and never block reading: type first, object second, proof last.
- Strongest heroes **hand off** to the next section (the object keeps moving as you scroll) instead of ending in a hard edge.

**Liquid / fluid techniques**
- *Gooey/metaball filter*: blur + alpha-threshold colour matrix. Cheap for a few shapes in one SVG layer, but WebKit struggles when filtered DOM elements restyle every frame. → Keep all moving blobs inside **one SVG** with transform-only animation, desktop only, paused offscreen.
- *SVG path morphing*: already used by LiquidBlob; fine for slow ambient shapes.
- *Displacement maps*: beautiful but expensive per frame on large areas; skip for the hero.
- *CSS scroll-driven animations* (`animation-timeline: view()`): now in Chromium and Safari 26, Firefox uneven. → Use only as progressive enhancement behind `@supports`, content visible without it.
- *Spring physics with `motion`*: `useSpring` on pointer motion values gives weight without a render per frame. → Pointer tilt, highlight travel and liquid slosh all on motion values.
- *Pointer-reactive lighting*: a specular highlight that moves ≤10px reads as "real material"; more than that reads as a gimmick.

**Claymorphism that doesn't look childish**
- Restraint: one hero clay object, everything else flat or glass. Desaturated pastel surfaces, one saturated CTA colour.
- Precision details carry the "premium": crisp hairline highlights, tinted (never grey) shadows, real proportions (a long, slim capsule beats a chunky toy), and type that is much bigger than the objects.
- Mix with a little glass for chrome; never stack glass.

## 3. Hero concepts explored

**A. Liquid relay.** A long, slim glossy clay baton lies across the hero, its glass core full of green liquid that slowly flows business → owner. Pointer tilts it; the liquid sloshes against the tilt and the specular highlight follows. On scroll it rotates level and drops toward the relay lane, so the hero literally passes the baton to the page.
*Strength:* the brand metaphor in one object; cheap (SVG + transforms). *Risk:* a capsule alone can look like a pill/battery without context.

**B. Morphing object.** Old laptop → baton → laptop with a new owner's screen, morphing in a loop.
*Strength:* the full story. *Risk:* path morphs between such different silhouettes look mushy at this fidelity; a loop "for attention" breaks §1.4; heavy to make look premium. Rejected.

**C. Living headline + live proof.** "Pass it on." where the words are handed to each other on entrance and the full stop is a drop of the liquid that lands last. Under it, the real "devices back in use" count rolls in on liquid odometer digits.
*Strength:* readable in under 2 seconds, memorable, honest data. *Risk:* without an object it's just type.

**D. Fluid backdrop.** Mint/apricot metaballs merging behind the hero, pulled gently toward the pointer.
*Strength:* depth and life. *Risk:* AI-slop territory if loud. Only as a quiet layer.

**Chosen: A + C, with D as a whisper.** The headline says "Pass it on.", the baton *is* the "it", and the period is a drop of the same liquid that runs through the baton. The hand route (business → volunteer → new owner) is etched on the baton's lane. The live counter sits on the baton's lane like a reading on an instrument. On scroll the baton levels out and travels down into the relay lane where the next section's baton picks it up. On phones the composition is re-cut: huge headline, the baton crosses the full screen width (bleeding off the right edge, entering from the left like a handoff), then the line, CTAs and the counter.

## 4. Result (see `landing-after/`)

Honest comparison with `landing-before/`:
- **Hero:** the template 7/5 split is gone. The page now opens on a two-line "Pass it / on." set huge, with the baton riding the end of the sentence and the full stop as a liquid drop. It's recognisably Relay in a thumbnail. At 360px the baton bleeds off the right edge (handed off-screen); at 768px it does the same at a larger size; at 1280/1600 it sits whole.
- **Entrance (~1.4s):** eyebrow → "Pass" → "it" → "on" handed in from the left → baton slides in and its core fills → the drop falls and squashes → copy, CTAs, live counter. Frames: `landing-after/frames/_entrance-sheet-1280.png`, `_entrance-sheet-360.png`.
- **Hand-off:** on scroll the baton sinks and the copy recedes, a liquid line pours down the left edge into "The relay", whose lane catches the baton from above before the run starts. Frames: `_scroll-sheet-1280.png`, `_scroll-sheet-360.png`.
- **Below the hero:** the relay cards now lead with the real count and pour liquid along their floor at each handoff; impact has a sticky intro beside an uneven bento plus a "58 of 109" lane; audience cards lost their icon tiles (the business card holds a clay laptop, the volunteer card a real number); passport is a sunken panel instead of a strip between hairlines; the partner wall leads with the furthest-run partner.
- **Still not perfect:** the metaball backdrop is close to "soft blob" territory. It is kept quiet (60% opacity, masked edges, desktop-only motion). The pinned relay still leaves sticky runway in full-page captures; that's how pinning looks in a full-page capture, not something a visitor sees.

**Performance (Lighthouse 12.6, `pnpm start`, localhost):** desktop 100 (LCP 0.8s, CLS 0). Mobile (simulated slow 4G) 87; the previous commit measured 88 on the same machine. Observed LCP is ~0.63s; the simulated 4.1s is render delay from the app-wide JS bundle (React + motion, shared by every page), not from the landing changes. Getting mobile ≥ 90 means trimming shared client JS in the shell, which is outside this task's scope.

## 5. Round 2: sharpened, pattern by pattern

Studied the live reference sites (screenshots kept out of the repo) and adapted specific patterns, rebuilt in Relay's own clay + liquid material. No assets, copy or branding taken.

| Pattern | Seen on | How Relay uses it |
|---|---|---|
| Live running number above the headline ("Global GDP running on Stripe: 1.73…%") | Stripe | "Devices back in use through Relay: 58 →" ticker, counts up, links to /impact |
| Hairline guides framing the content column, logo strip boxed by hairlines | Stripe | `page-guides` + `Rule` hairlines; "In the relay" partner strip under the hero (static, no marquee per §12.9) |
| Two-tone statements (ink + muted continuation) | Stripe, Vercel | Hero supporting line and every chapter heading |
| Product shown in a large framed stage under a short headline; "FIG 0.x" mono labels | Linear | The baton on a framed stage, "Fig 0.1 · The baton"; chapters numbered Fig 0.2–0.6 |
| Object on a soft halo, crosshair marks on the grid | Vercel | Mint halo behind the baton, faint grid, "+" crosshairs on stage corners and where rules meet the guides |
| Floating product render with floor reflection; spec callouts; sticky buy pill | Apple | Baton reflection, three leader-line callouts with live counts (handed over / wiped & rebuilt / passed on), sticky "Free to start · Become a partner" pill once the hero's own CTA is gone |
| Product tilts flat as it scrolls into view | Linear/Apple | Stage starts at rotateX 18° and stands up on scroll |
| One dark band for contrast | Linear, Apple | Passport becomes the page's only ink panel |

Removed: the metaball backdrop (the weakest, most "AI blob" element), the baton-inside-the-sentence layout (the headline is now one clean line on desktop, two on phones), the bento of stat pebbles (now a Stripe-style stat row on hairlines plus one liquid lane).

**Performance (Lighthouse 12.6, prod build, localhost):** desktop 99 (LCP 0.8s, CLS 0, TBT 0). Mobile 87, same as before this round and vs 88 for the pre-revamp page; the gap is the shared app-wide JS bundle, not the landing page.
