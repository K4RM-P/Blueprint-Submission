"use client";

import { useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";

/** PP-11: card preview, download, LinkedIn share link and a suggested post to copy. */
export function ShareCard({ imageUrl, shareUrl, post }: { imageUrl: string; shareUrl: string; post: string }) {
  const [text, setText] = useState(post);
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Post text copied. Paste it into LinkedIn.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy — select the text and copy it yourself.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <figure className="flat overflow-hidden !p-0">
        <div className="relative aspect-[1200/627] bg-canvas">
          {!loaded ? <div className="skeleton-clay absolute inset-0 !rounded-none" aria-hidden /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element -- dynamic, private, per-org PNG */}
          <img src={imageUrl} alt="Your LinkedIn impact card with this year's numbers" width={1200} height={627} className="relative size-full object-cover" onLoad={() => setLoaded(true)} />
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-small text-ink-2">
          1200 × 627 · sized for LinkedIn posts
          <ClayButton href={`${imageUrl}?download=1`} variant="ghost" size="sm" icon={<Download />} prefetch={false}>
            Download image
          </ClayButton>
        </figcaption>
      </figure>

      <div className="flex flex-col gap-4">
        <label htmlFor="post" className="font-semibold">
          Suggested post
        </label>
        <textarea id="post" className="field-input min-h-[220px] text-[0.9375rem] leading-relaxed" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-wrap gap-3">
          <ClayButton variant="secondary" icon={copied ? <Check /> : <Copy />} onClick={copy}>
            {copied ? "Copied" : "Copy text"}
          </ClayButton>
          <ClayButton href={shareUrl} target="_blank" rel="noopener noreferrer" variant="secondary" icon={<Share2 />}>
            Open LinkedIn
          </ClayButton>
        </div>
        <p className="text-small text-ink-3">LinkedIn opens with a link to the public Partner Wall. Attach the downloaded card image to your post.</p>
      </div>
    </div>
  );
}
