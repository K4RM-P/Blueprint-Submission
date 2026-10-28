import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { FullPassport } from "@/components/passport/full-passport";
import { StoryPlayer } from "@/components/passport/story-player";
import { getPassportStory } from "@/lib/queries/passport";
import { buildPassportStory, personalizeForOwner, shareText, slideIndexFromParam } from "@/lib/passport-story";
import { getPassportOwner } from "@/lib/queries/passport";
import { getPublicSettings } from "@/lib/queries/common";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ code: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const SearchSchema = z.object({
  view: z.enum(["full", "story"]).optional().catch(undefined),
  s: z.union([z.string(), z.array(z.string())]).optional(),
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getPassportStory((await params).code);
  if (!p) return { title: "Passport not found", robots: { index: false } };
  const story = buildPassportStory(p);
  const title = `${story.deviceName} · its second life`;
  const description = `${shareText(story)} A refurbished ${story.deviceName} from Free Geek Toronto: donated, given a certified data wipe, brought back to life by volunteers.`;
  return {
    title: `${story.deviceName} · Device Passport`,
    description,
    openGraph: { title, description, type: "article", url: `/p/${story.code}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Relay Wrapped (DP-02…DP-06, DP-11, PIF-06): scanning the QR opens the device's
 * story. ?view=full is the static passport (also the print view); ?s=N deep-links
 * a slide. The data is server-rendered; only the player runs on the client.
 */
export default async function PassportPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const p = await getPassportStory((await params).code);
  if (!p) notFound();
  // A signed-in Reuse Partner opening one of its own laptops gets its story personalized.
  const [owner, settings] = await Promise.all([getPassportOwner(p.code), getPublicSettings(await createClient())]);
  const base = buildPassportStory(p);
  const story = owner ? personalizeForOwner(base, owner.orgName) : base;
  const q = SearchSchema.parse(await searchParams);
  const storeUrl = p.status === "ready" || p.status === "listed" ? settings.storeUrl : null;

  if (q.view === "full") return <FullPassport p={p} story={story} storeUrl={storeUrl} />;

  return (
    <>
      <StoryPlayer story={story} storeUrl={storeUrl} initialIndex={slideIndexFromParam(q.s, story.slides.length)} />
      <div className="story-print-only">
        <FullPassport p={p} story={story} storeUrl={storeUrl} printOnly />
      </div>
    </>
  );
}
