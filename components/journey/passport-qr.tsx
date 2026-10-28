import { ExternalLink, Printer, QrCode } from "lucide-react";
import { ClayButton } from "@/components/clay";
import { passportUrl, qrSvg } from "@/lib/qr";
import { cn } from "@/lib/utils";

/** Inline QR that links to a device's public passport (DP-01). Server-rendered SVG, no network. */
export async function PassportQrImage({ code, size = 160, className }: { code: string; size?: number; className?: string }) {
  const svg = await qrSvg(passportUrl(code));
  return (
    <div
      role="img"
      aria-label={`QR code for passport ${code}`}
      className={cn("shrink-0 rounded-[var(--r-sm)] bg-white p-2.5 [&_svg]:size-full", className)}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** Quiet "scan for its story" card: the QR, the passport code and what to do with it. */
export async function PassportQrCard({ code, deviceId, title = "Device Passport", className }: { code: string; deviceId?: string; title?: string; className?: string }) {
  return (
    <section aria-label={title} className={cn("flat flex flex-col gap-5 p-5 sm:flex-row sm:items-center", className)}>
      <PassportQrImage code={code} size={120} className="border border-line" />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <QrCode className="size-4" aria-hidden /> {title}
        </p>
        <p className="font-mono text-lg font-semibold text-ink">{code}</p>
        <p className="text-small text-ink-2">Scan with a phone camera to see where this laptop came from, how its data was wiped and who refurbished it.</p>
        <div className="mt-1 flex flex-wrap gap-2.5">
          <ClayButton href={`/p/${code}`} prefetch={false} size="sm" icon={<ExternalLink />}>
            Open Device Passport
          </ClayButton>
          {deviceId ? (
            <ClayButton href={`/staff/labels?ids=${deviceId}`} variant="ghost" size="sm" icon={<Printer />}>
              Print QR label
            </ClayButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
