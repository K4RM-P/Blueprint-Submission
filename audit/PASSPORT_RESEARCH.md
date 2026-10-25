# Passport research: "Relay Wrapped"

Research notes for turning the Device Passport (`/p/[code]`) into a story experience. These products were studied for **structure and mechanics only**. Relay copies no visuals, layouts, branding or text from any of them; our look comes entirely from `UI_UX_DESIGN.md` (clay, liquid, Apple restraint).

## 1. What the best "year in review" stories have in common

| Product | What it does well | What we take from it |
|---|---|---|
| **Spotify Wrapped** | Native 9:16 cards sized for Instagram/TikTok Stories, so sharing needs no cropping. One fact per card, bold type, and a colour system that changes each slide. Small game mechanics (guess, then reveal) make people react and argue, which drives shares. | One fact per slide. 9:16 frame. Change the tint on every slide so the sequence feels like a journey. A "reveal" beat on the numbers slide (the odometer). |
| **Apple Music Replay** (2022 redesign) | A highlight reel of stories-style animated panels at the top of a page, with a scrollable detail section underneath. The whole reel runs about 70 s untouched and you can tap through it. | The **story + full page** split: our story is the reel, and `?view=full` is the scrollable detail. Keep the total reel under about 75 s. |
| **Duolingo Year in Review** | A condensed, image-like share card so friends see the key stats without opening a web page. Putting a *comparative* stat on the card (a percentile) raised share rates. There's also a second, more personal share hook. | The finale is a **collectible card** that stands alone as an image. Lead with one headline stat ("Leg 3 of 3", "18 days to ready"), and the image carries the story without the page. |
| **Strava Year in Sport** (by Manual) | A fully data-driven animated experience built from **modular building blocks** (colour panels, lines, dots, circles) that adapt across hundreds of assets. The data points were chosen to support a narrative. | Build a small **slide-primitive kit** (frame, eyebrow, hero line, hero object) and compose every slide from it. Choose data points for the narrative (handoffs), not for completeness. |
| **GitHub "wrapped"** (community, e.g. CoderWrap) | Generates a shareable image from public data only, with no login. | Our share image is built **only from public-safe passport fields**, so it's safe to render for anyone who has the code. |
| **Instagram Stories** | The grammar everyone already knows: a segmented progress bar, tap right/left, press and hold to pause, swipe to leave. | Use the same grammar so nobody needs instructions. |

**Why people share** (pattern across all of them): the result feels *about me* and specific (identity), it's novel but familiar, it's already sized for the destination, and the share button is part of the story instead of an afterthought. For Relay, "my laptop has had three lives" is the identity hook. It's a small, good thing to signal.

## 2. Mobile story UX patterns

- **Segmented progress bar**: one segment per slide, filling in real time, which shows how many slides there are and how long is left (Airship's Stories docs and react-insta-stories both describe it this way). Ours fill like liquid (a green fill with a meniscus highlight).
- **Tap zones**: the right side goes forward and the left goes back. We use **left 30% / right 70%**, because forward is the common action.
- **Hold to pause**: press and hold anywhere pauses, and release resumes. A hold over about 220 ms must not count as a tap.
- **Swipe**: a horizontal swipe changes slides. A swipe down on mobile closes to the full passport.
- **Auto-advance timing**: no platform standard is published. react-insta-stories and similar libraries set a duration *per story*. We use **5.5 s by default, 7–9 s for text-heavy slides**, and pause when `document.hidden`.
- **Deep links**: `?s=N` (1-based) opens slide N. Use `history.replaceState` so the back button leaves the passport instead of stepping through slides.
- **Keyboard**: ← and → change slides, Space pauses, Esc goes to the full view. A live region announces "Slide 4 of 11: Every byte erased." for screen readers.

## 3. Techniques

- **SVG gooey / metaball**: `feGaussianBlur` then an alpha-threshold `feColorMatrix` (`… 0 0 0 18 -7`), with the source composited back on top (`feComposite operator="atop"`). Animating the blur or the alpha multiplier makes blobs merge and detach (Codrops, Visual Cinnamon). We already ship `<GooFilter/>`. The rule is to apply it only to small indicator layers, never to text (UI §7.2.1).
- **Liquid mask wipe between slides**: animate a `clip-path: circle()` or a wavy `path()` on the incoming slide while the outgoing slide scales down slightly. A rising **liquid surface** (a tinted wave band moving up the screen) hides the cut. Transform/clip only, with no layout work.
- **Kinetic typography**: split the hero line into words and spring each one in (`y` 0.6 em → 0, opacity 0 → 1, staggered about 45 ms). Keep it legible: the line settles within about 600 ms.
- **Spring physics with `motion`**: use the existing presets (`soft`, `press`, `liquid`, `bouncy`). Stamps use the `press` keyframes from `Stamp`/`Seal`, and the odometer uses `LiquidDigits` (the `liquid` spring).
- **CSS 3D for the cover**: `perspective` plus `rotateY(-160deg)` on the booklet cover, with `transform-origin: left`. CSS only, so no 3D library.
- **next/og**: `ImageResponse` with explicit `{ width, height }` renders at any size. Satori supports **flexbox only** (no grid), the bundle must stay under 500 KB, and fonts must be TTF/OTF/WOFF (not WOFF2). We bundle static TTFs for Bricolage Grotesque 700, Geist 500 and Geist Mono 500 (about 226 KB, OFL-licensed) in `lib/og/fonts/`.
- **Web Share API**: `navigator.share({ title, text, url })` on mobile, and `navigator.canShare({ files })` to share the PNG itself where supported. Otherwise, download the PNG and copy the link.

## 4. Design decisions for Relay Wrapped

1. **One transition system: the "liquid rise".** Each new slide's tint rises up from the bottom edge behind a soft wave surface. Going back reverses it. The meaning stays "something flows into the next leg" (UI §1.2: liquid means flow). There are no random per-slide effects.
2. **One hero element and one tint per slide**, in this order: porcelain → apricot → apricot/porcelain → sky → butter → mint → mint → butter → porcelain → sky → apricot → porcelain (the card). That's never more than one tint on screen at a time, plus the porcelain chrome.
3. **The baton is the through-line.** It glows in on the origin slide, crosses between two clay stations on the handoff slide, and lands in the viewer's hands on "Your turn".
4. **Never invent data.** Slides drop out when their data is missing. Dates come from `device_events`. Comparisons are exact: 1 kg of water = 1 litre, and nothing beyond that.
5. **Reduced motion means a finished, static deck**: crossfades only, numbers at their final value, no 3D cover, no wipe. The "full passport" view is both the print view and the no-JS fallback.

## Sources
- NoGood, "Spotify Wrapped marketing strategy" — https://nogood.io/2025/01/20/spotify-wrapped-marketing-strategy/
- ADMA, "The winning formula behind Spotify Wrapped" — https://adma.com.au/resources/personal-shareable-no-strings-attached-the-winning-formula-behind-spotify-wrapped
- TechCrunch, "Apple Music launches revamped 2022 Replay experience with new highlight reel" — https://techcrunch.com/2022/11/29/apple-music-2022-replay-experience-with-new-highlight-reel
- 9to5Mac, Apple Music Replay 2022 — https://9to5mac.com/2022/11/29/apple-music-replay-new-spotify-wrapped-2022/
- Duolingo blog, "Year in Review: behind the scenes" — https://blog.duolingo.com/year-in-review-behind-the-scenes
- UX Collective, "Duolingo wrapped" — https://uxdesign.cc/duolingo-wrapped-your-year-in-languages-streaks-and-progress-43f7f95c3eac
- Manual, Strava Year in Sport — https://manualcreative.com/work/strava
- It's Nice That, Manual × Strava Year in Sport — https://www.itsnicethat.com/articles/manual-strava-year-in-sport-graphic-design-150321
- UX Collective, "Monzo, Depop and Strava wrapped" — https://uxdesign.cc/monzo-depop-and-strava-wrapped-who-did-it-better-33f50c63f351
- CoderWrap (community GitHub wrapped) — https://github.com/dev0jha/CoderWrap
- Airship, Stories docs — https://docs.airship.com/whats-new/2023-06-22-stories
- react-insta-stories — https://github.com/mohitk05/react-insta-stories
- Codrops, "Creative gooey effects" — https://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
- Codrops, "Gooey search interaction with Framer Motion" — https://tympanus.net/codrops/2024/11/18/how-to-create-a-gooey-search-interaction-with-framer-motion-and-react/
- Visual Cinnamon, "SVG gooey effect" — https://www.visualcinnamon.com/2016/06/fun-data-visualizations-svg-gooey-effect/
- Next.js `ImageResponse` reference (v16 docs bundled in `node_modules/next/dist/docs`) — https://nextjs.org/docs/app/api-reference/functions/image-response
