import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { cardFacts, legLabel, type PassportStory } from "@/lib/passport-story";

/**
 * Relay Wrapped share images, drawn with next/og (Satori: flexbox only). Built
 * from the public-safe story alone, so they can never contain a serial, wipe
 * reference, recipient or price (DP-05). Fonts are bundled OFL TTFs.
 */
export const STORY_IMAGE_SIZE = { width: 1080, height: 1920 };
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

const INK = "#17201C";
const INK2 = "#4A544F";
const LOOP_DEEP = "#0B5E42";
const COVER = "linear-gradient(160deg, #157a56 0%, #0b5e42 58%, #08452f 100%)";

let fontCache: Promise<{ name: string; data: Buffer; weight: 500 | 700; style: "normal" }[]> | null = null;
function fonts() {
  const dir = join(process.cwd(), "lib/og/fonts");
  fontCache ??= Promise.all([
    readFile(join(dir, "bricolage-700.ttf")).then((data) => ({ name: "Bricolage", data, weight: 700 as const, style: "normal" as const })),
    readFile(join(dir, "geist-500.ttf")).then((data) => ({ name: "Geist", data, weight: 500 as const, style: "normal" as const })),
    readFile(join(dir, "geist-mono-500.ttf")).then((data) => ({ name: "GeistMono", data, weight: 500 as const, style: "normal" as const })),
  ]);
  return fontCache;
}

function headline(s: PassportStory): string {
  if (s.stage === "sold") return "My laptop has had 3 lives.";
  if (s.stage === "recycled") return "Its parts live on.";
  return "This laptop has a story.";
}

/** The Relay mark: a liquid-cored baton on a mint tile, drawn with boxes. */
function Mark({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", width: size, height: size, borderRadius: size * 0.32, background: "#D7F1E4", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", width: size * 0.72, height: size * 0.29, borderRadius: size, background: "#FBF9F5", border: `${Math.max(2, size * 0.055)}px solid ${LOOP_DEEP}`, transform: "rotate(-35deg)", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", width: "52%", height: "48%", borderRadius: size, background: "#138A61" }} />
      </div>
    </div>
  );
}

function Legs({ story, scale = 1 }: { story: PassportStory; scale?: number }) {
  const legs = story.stage === "recycled" ? 2 : story.leg;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 * scale }}>
      <div style={{ display: "flex", gap: 8 * scale }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ display: "flex", width: 44 * scale, height: 16 * scale, borderRadius: 99, background: n <= legs ? "linear-gradient(90deg, #138A61, #2FBF8A)" : "#E9E2D6" }} />
        ))}
      </div>
      <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 24 * scale, letterSpacing: 3 * scale, color: INK2 }}>{legLabel(story).toUpperCase()}</div>
    </div>
  );
}

/** The collectible card, shared by both images. `w` is its width in px. */
function Card({ story, w, maxFacts = 6 }: { story: PassportStory; w: number; maxFacts?: number }) {
  const k = w / 900;
  const facts = cardFacts(story).slice(0, maxFacts);
  return (
    <div style={{ display: "flex", flexDirection: "column", width: w, borderRadius: 64 * k, background: "#FBF9F5", overflow: "hidden", boxShadow: "0 60px 90px -40px rgba(11,94,66,.55)" }}>
      <div style={{ display: "flex", flexDirection: "column", padding: `${56 * k}px ${64 * k}px ${64 * k}px`, background: COVER, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 * k }}>
            <Mark size={56 * k} />
            <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 24 * k, letterSpacing: 4 * k, color: "#CDEFDF" }}>DEVICE PASSPORT</div>
          </div>
          <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 30 * k, letterSpacing: 3 * k, color: "#CDEFDF" }}>{story.code}</div>
        </div>
        <div style={{ display: "flex", marginTop: 56 * k, fontFamily: "Bricolage", fontSize: 96 * k, lineHeight: 0.95, letterSpacing: -4 * k, color: "#fff" }}>{story.deviceName}</div>
        <div style={{ display: "flex", marginTop: 22 * k, fontSize: 30 * k, color: "#B9E6D2" }}>{story.specs.slice(0, 3).join(" · ")}</div>
      </div>
      {/* tear line */}
      <div style={{ display: "flex", height: 0, borderTop: `${4 * k}px dashed #E4DED4`, margin: `0 ${48 * k}px` }} />
      <div style={{ display: "flex", flexWrap: "wrap", padding: `${52 * k}px ${64 * k}px ${20 * k}px` }}>
        {facts.map((f) => (
          <div key={f.label} style={{ display: "flex", flexDirection: "column", width: "50%", marginBottom: 40 * k, paddingRight: 24 * k }}>
            <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 22 * k, letterSpacing: 3 * k, color: INK2 }}>{f.label.toUpperCase()}</div>
            <div style={{ display: "flex", marginTop: 8 * k, fontSize: 36 * k, color: INK }}>{f.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${30 * k}px ${64 * k}px`, borderTop: "2px solid #EEE8DE" }}>
        <Legs story={story} scale={k} />
        <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 40 * k, color: LOOP_DEEP }}>Pass it on.</div>
      </div>
    </div>
  );
}

/** 1080×1920 Instagram/LinkedIn story image. */
export async function renderStoryImage(story: PassportStory): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "120px 90px 110px",
          justifyContent: "space-between",
          fontFamily: "Geist",
          color: INK,
          backgroundColor: "#F4F0E9",
          backgroundImage: "radial-gradient(900px 700px at 100% 0%, #FFE0CB 0%, rgba(255,224,203,0) 70%), radial-gradient(900px 800px at 0% 100%, #D7F1E4 0%, rgba(215,241,228,0) 70%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Mark size={64} />
          <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 28, letterSpacing: 3, color: INK2 }}>RELAY · FREE GEEK TORONTO</div>
        </div>
        <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 132, lineHeight: 0.95, letterSpacing: -4, marginTop: 40 }}>{headline(story)}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <Card story={story} w={900} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontSize: 56, letterSpacing: -2, color: LOOP_DEEP }}>Every device deserves a second leg.</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 30, color: INK2 }}>Donated, wiped, refurbished and passed on in Toronto.</div>
        </div>
      </div>
    ),
    { ...STORY_IMAGE_SIZE, fonts: await fonts() },
  );
}

/** 1200×630 Open Graph image so shared links unfurl as the card. */
export async function renderPassportOg(story: PassportStory): Promise<ImageResponse> {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "56px 64px",
          alignItems: "center",
          gap: 56,
          fontFamily: "Geist",
          color: INK,
          backgroundColor: "#F4F0E9",
          backgroundImage: "radial-gradient(700px 500px at 100% 0%, #FFE0CB 0%, rgba(255,224,203,0) 70%), radial-gradient(600px 500px at 0% 100%, #D7F1E4 0%, rgba(215,241,228,0) 70%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Mark size={44} />
            <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 20, letterSpacing: 2.5, color: INK2 }}>RELAY · FREE GEEK TORONTO</div>
          </div>
          <div style={{ display: "flex", marginTop: 40, fontFamily: "Bricolage", fontSize: 76, lineHeight: 0.96, letterSpacing: -3 }}>{headline(story)}</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 26, lineHeight: 1.4, color: INK2 }}>Every device deserves a second leg.</div>
        </div>
        <Card story={story} w={470} maxFacts={4} />
      </div>
    ),
    { ...OG_IMAGE_SIZE, fonts: await fonts() },
  );
}
