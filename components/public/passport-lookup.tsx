"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ScanLine } from "lucide-react";
import { isValidPassportCode, normalizePassportCode } from "@/lib/passport-code";

/** Type the code from a laptop sticker → its passport. */
export function PassportLookup({ className }: { className?: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const c = normalizePassportCode(code);
        if (!isValidPassportCode(c)) return setError("Codes look like FGT-7K3M9Q2X — 8 letters and numbers after FGT-.");
        router.push(`/p/${c}`);
      }}
    >
      <label htmlFor="passport-code" className="sr-only">
        Passport code
      </label>
      <div className="glass flex h-14 items-center gap-2 rounded-full pl-5 pr-1.5">
        <ScanLine className="size-5 shrink-0 text-loop-deep" aria-hidden />
        <input
          id="passport-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          placeholder="FGT-7K3M9Q2X"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "passport-error" : undefined}
          className="min-w-0 flex-1 bg-transparent font-mono uppercase tracking-wider placeholder:text-ink-3 focus:outline-none"
        />
        <button type="submit" aria-label="Open passport" className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white hover:bg-loop-deep">
          <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
      {error ? (
        <p id="passport-error" role="alert" className="mt-2 pl-5 text-small font-medium text-danger-ink">
          {error}
        </p>
      ) : null}
    </form>
  );
}
