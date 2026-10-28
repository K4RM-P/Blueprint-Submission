import { ShieldCheck } from "lucide-react";
import { ClayButton, ClayCard, IconTile } from "@/components/clay";
import { longDate } from "@/lib/dates";
import { IssueCertificateButton } from "./issue-certificate-button";
import { plural } from "@/lib/domain";

/** OPS-08: issue only when every device is verified-or-later or recycled. */
export function CertificatePanel({
  batchId,
  certificate,
  canIssue,
  pendingWipes,
  notReady = 0,
  total,
}: {
  batchId: string;
  certificate: { certificate_number: string; issued_at: string; device_count: number } | null;
  canIssue: boolean;
  pendingWipes: number;
  /** Devices not yet verified or recycled. */
  notReady?: number;
  total: number;
}) {
  return (
    <ClayCard tint="sky" className="flex flex-col gap-4">
      <IconTile tint="sky">
        <ShieldCheck />
      </IconTile>
      {certificate ? (
        <>
          <div>
            <p className="font-mono text-lg">{certificate.certificate_number}</p>
            <p className="text-small text-ink-2">
              Issued {longDate(certificate.issued_at)} · {plural(certificate.device_count, "device")}
            </p>
          </div>
          <ClayButton href={`/api/certificates/${certificate.certificate_number}`} variant="secondary" size="sm" prefetch={false}>
            Download PDF
          </ClayButton>
        </>
      ) : (
        <>
          <div>
            <h2 className="font-semibold">Certificate of data sanitization</h2>
            <p className="mt-1 text-small text-ink-2">
              {total === 0
                ? "Available once the batch arrives and every drive is wiped and verified."
                : canIssue
                  ? "Every device is verified or recycled. Ready to issue."
                  : pendingWipes > 0
                    ? `${pendingWipes} wipe${pendingWipes === 1 ? "" : "s"} waiting for your verification. Every device must be verified or recycled first.`
                    : `${notReady} device${notReady === 1 ? " is" : "s are"} still on the bench, not yet wiped and verified.`}
            </p>
          </div>
          {canIssue ? <IssueCertificateButton batchId={batchId} disabled={false} /> : null}
        </>
      )}
    </ClayCard>
  );
}
