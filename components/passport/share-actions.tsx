"use client";

import { Building2, Download, HandCoins, Leaf, Link2, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { shareText, type PassportStory } from "@/lib/passport-story";
import { logStoryEvent } from "./story-analytics";

export function storyImagePath(code: string) {
  return `/p/${code}/story.png`;
}

/**
 * Finale actions. Mobile: the Web Share API, with the 1080×1920 story image
 * attached when the browser can share files. Elsewhere: download the image and
 * copy the link. One primary button (§8).
 */
export function ShareActions({ story, onReplay }: { story: PassportStory; onReplay: () => void }) {
  const [busy, setBusy] = useState(false);
  const url = typeof window === "undefined" ? `/p/${story.code}` : `${window.location.origin}/p/${story.code}`;
  const text = shareText(story);
  const filename = `relay-${story.code}-story.png`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Paste it anywhere to share this story.");
    } catch {
      toast(`Share this link: ${url}`);
    }
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = `${storyImagePath(story.code)}?download=1`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    setBusy(true);
    logStoryEvent("share", "finale");
    try {
      if (typeof navigator.share === "function") {
        let files: File[] | undefined;
        try {
          const blob = await (await fetch(storyImagePath(story.code))).blob();
          const file = new File([blob], filename, { type: "image/png" });
          if (navigator.canShare?.({ files: [file] })) files = [file];
        } catch {
          // share the link alone
        }
        await navigator.share({ title: `${story.deviceName} · Device Passport`, text, url, ...(files ? { files } : {}) });
        return;
      }
      download();
      await copyLink();
    } catch (err) {
      // The share sheet was dismissed: nothing to report.
      if (!(err instanceof DOMException && err.name === "AbortError")) await copyLink();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-no-tap className="flex w-full flex-col gap-2.5">
      <ClayButton variant="primary" size="md" icon={<Share2 />} onClick={share} loading={busy} className="w-full">
        {story.stage === "sold" ? "Share my laptop's story" : "Share this laptop's story"}
      </ClayButton>
      <div className="grid grid-cols-2 gap-2.5">
        <ClayButton size="sm" icon={<Download />} onClick={download} className="w-full">
          Download image
        </ClayButton>
        <ClayButton size="sm" icon={<Link2 />} onClick={copyLink} className="w-full">
          Copy link
        </ClayButton>
        {/* short labels so both fit side by side on a 390px phone; the accessible names start with the visible text */}
        <ClayButton size="sm" href="/become-a-partner" icon={<Building2 />} className="w-full" aria-label="For businesses: donate your company's laptops">
          For businesses
        </ClayButton>
        <ClayButton size="sm" href="/donate" icon={<Leaf />} className="w-full" aria-label="From home: donate a laptop">
          From home
        </ClayButton>
      </div>
      <div className="flex items-center justify-between px-1 pt-0.5">
        <Link href={`/p/${story.code}?view=full`} className="inline-flex h-11 items-center text-[0.9375rem] font-semibold text-loop-deep underline-offset-4 hover:underline">
          View full passport
        </Link>
        <Link href="/pay-it-forward" className="inline-flex h-11 items-center gap-1.5 text-[0.9375rem] font-medium text-ink-2 underline-offset-4 hover:underline">
          <HandCoins className="size-4" aria-hidden /> Pay it forward
        </Link>
        <button type="button" onClick={onReplay} className="inline-flex h-11 items-center gap-1.5 text-[0.9375rem] font-semibold text-ink underline-offset-4 hover:underline">
          <RotateCcw className="size-4" aria-hidden /> Replay
        </button>
      </div>
    </div>
  );
}
