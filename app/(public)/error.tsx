"use client";

import { ErrorState } from "@/components/shell/error-state";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
      <ErrorState error={error} reset={reset} />
    </div>
  );
}
