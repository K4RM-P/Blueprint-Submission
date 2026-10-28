import { Download, ShieldCheck } from "lucide-react";
import { ClayButton, ClayCard, IconTile } from "@/components/clay";
import { Seal } from "@/components/clay/seal";
import { longDate } from "@/lib/dates";

interface Cert {
  certificate_number: string;
  issued_at: string;
  device_count: number;
}

/** PP-08: certificate card; the seal "stamps" in once issued (§7.4). */
export function CertificateCard({ cert, verifiedCount, total }: { cert: Cert | null; verifiedCount: number; total: number }) {
  if (!cert) {
    return (
      <ClayCard tint="sky" className="flex flex-col gap-4">
        <IconTile tint="sky">
          <ShieldCheck />
        </IconTile>
        <div>
          <h2 className="text-title font-semibold">Data-wipe certificate</h2>
          <p className="mt-1 text-ink-2">
            {total === 0
              ? "Your certificate is issued once your devices arrive and every drive is wiped and verified."
              : `${verifiedCount} of ${total} devices verified so far. Your numbered certificate appears here when every drive is wiped and verified.`}
          </p>
        </div>
      </ClayCard>
    );
  }
  return (
    <ClayCard tint="sky" className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Seal rim="CERTIFIED · FREE GEEK TORONTO · " icon={<ShieldCheck />} size={76} tilt={-8} inView />
        <div>
          <p className="font-semibold text-ink">Certificate issued</p>
          <p className="text-small text-ink-2 tnum">{longDate(cert.issued_at)}</p>
        </div>
      </div>
      <div>
        <p className="font-mono text-xl text-ink">{cert.certificate_number}</p>
        <p className="mt-1 text-ink-2">Covers {cert.device_count} devices. Anyone can confirm it at the public verification page.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <ClayButton href={`/api/certificates/${cert.certificate_number}`} variant="secondary" size="sm" icon={<Download />} prefetch={false}>
          Download PDF
        </ClayButton>
        <ClayButton href={`/verify/${cert.certificate_number}`} variant="ghost" size="sm">
          Public verification
        </ClayButton>
      </div>
    </ClayCard>
  );
}
