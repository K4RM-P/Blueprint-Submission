import { Check } from "lucide-react";
import { LoopMark } from "@/components/shell/logo";
import { cn } from "@/lib/utils";

const ROWS = [
  ["Batch", "FGT-B-0131"],
  ["Devices", "30 × Dell Latitude 5420"],
  ["Drives wiped", "30 of 30"],
  ["Verified by", "Free Geek Toronto staff"],
];

/**
 * What a partner gets with every batch: a data-wipe certificate, drawn as a
 * crisp paper document (example data). Decorative; the card it sits in says
 * the same thing in words.
 */
export function CertificatePreview({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("cert-paper w-[290px] sm:w-[340px] rounded-[14px] p-5 text-left", className)}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <LoopMark className="size-5" />
          <span className="font-display text-[0.9375rem] font-semibold tracking-[-0.03em]">Relay</span>
        </span>
        <span className="font-mono text-[0.625rem] tracking-[0.06em] text-ink-3">GL-2026-0131</span>
      </div>
      <p className="mt-5 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ink-3">Certificate of</p>
      <p className="font-display text-[1.375rem] font-semibold leading-tight tracking-[-0.035em]">Data destruction</p>
      <p className="mt-1 text-[0.6875rem] text-ink-2">Issued to Northwind Legal · Oct 14, 2026</p>
      <dl className="mt-4 border-t border-line">
        {ROWS.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-line py-2 text-[0.6875rem]">
            <dt className="text-ink-3">{k}</dt>
            <dd className="font-medium text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-end justify-between">
        <span className="flex flex-col gap-1">
          <span className="font-display text-[1.0625rem] italic leading-none text-ink-2" style={{ fontFamily: "ui-serif, Georgia, serif" }}>
            A. Okafor
          </span>
          <span className="h-px w-28 bg-ink/30" />
          <span className="text-[0.5625rem] uppercase tracking-[0.12em] text-ink-3">Verifying technician</span>
        </span>
        <span className="grid size-11 place-items-center rounded-full border border-loop/50 text-loop">
          <span className="grid size-8 place-items-center rounded-full bg-loop text-white">
            <Check className="size-4" strokeWidth={2.5} />
          </span>
        </span>
      </div>
    </div>
  );
}
