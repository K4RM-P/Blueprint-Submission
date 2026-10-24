"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { ClayButton } from "@/components/clay/clay-button";
import { ClayVessel } from "@/components/illustrations/clay-vessel";

export function ErrorState({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.warn("[GeekLoop] page error", error.digest ?? error.message);
  }, [error]);
  return (
    <div role="alert" className="flex flex-col items-start gap-5 py-16">
      <ClayVessel tone="apricot" className="size-20" />
      <div>
        <h1 className="font-display text-display-m">Something didn&apos;t load.</h1>
        <p className="measure mt-2 text-body-l text-ink-2">It&apos;s probably a hiccup with the connection. Your work is saved — try again.</p>
      </div>
      <ClayButton variant="secondary" onClick={reset} icon={<RotateCcw />}>
        Try again
      </ClayButton>
    </div>
  );
}
