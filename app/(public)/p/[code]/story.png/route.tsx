import { NextResponse } from "next/server";
import { z } from "zod";
import { getPassportStoryForImage } from "@/lib/queries/passport";
import { buildPassportStory } from "@/lib/passport-story";
import { renderStoryImage } from "@/lib/og/passport-card";

export const runtime = "nodejs";

const Params = z.object({ code: z.string().min(4).max(32) });

/** Relay Wrapped share image, 1080×1920 (Instagram / LinkedIn stories). Public-safe fields only. */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const parsed = Params.safeParse(await params);
  if (!parsed.success) return NextResponse.json({ error: "Invalid passport code" }, { status: 400 });
  const data = await getPassportStoryForImage(parsed.data.code);
  if (!data) return NextResponse.json({ error: "Passport not found" }, { status: 404 });
  const story = buildPassportStory(data);
  const image = await renderStoryImage(story);
  image.headers.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  if (new URL(req.url).searchParams.has("download")) image.headers.set("Content-Disposition", `attachment; filename="relay-${story.code}-story.png"`);
  return image;
}
