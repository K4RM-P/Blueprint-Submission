import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Event = z.object({
  kind: z.enum(["start", "complete", "share", "drop"]),
  slide: z
    .string()
    .regex(/^[a-z_]{1,24}$/)
    .nullable()
    .optional(),
});

/** DP-06: anonymous passport-story analytics. Counts only, no identifiers. */
export async function POST(req: Request) {
  if (!(await rateLimit("passport-events", 60))) return new NextResponse(null, { status: 429 });
  const parsed = Event.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const supabase = await createClient();
  // The generated types mark p_slide as text; SQL null is the "no slide" value.
  const { error } = await supabase.rpc("log_passport_story", { p_kind: parsed.data.kind, p_slide: (parsed.data.slide ?? null) as string });
  // Analytics are best-effort: never surface a failure to the story.
  if (error) return new NextResponse(null, { status: 202 });
  return new NextResponse(null, { status: 204 });
}
