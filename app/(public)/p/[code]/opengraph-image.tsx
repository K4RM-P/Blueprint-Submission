import { ImageResponse } from "next/og";
import { getPassportStory } from "@/lib/queries/passport";
import { buildPassportStory } from "@/lib/passport-story";
import { OG_IMAGE_SIZE, renderPassportOg } from "@/lib/og/passport-card";

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";
export const alt = "Relay Device Passport: this laptop's second life";

/** Per-passport Open Graph card (1200×630), the same collectible as the story finale. */
export default async function OgImage({ params }: { params: Promise<{ code: string }> }) {
  const data = await getPassportStory((await params).code);
  if (!data) {
    return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#F4F0E9", fontSize: 64, color: "#17201C" }}>Relay · Device Passport</div>, size);
  }
  return renderPassportOg(buildPassportStory(data));
}
