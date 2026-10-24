import { ShieldCheck } from "lucide-react";
import { ClayButton, ClayCard, IconTile } from "@/components/clay";
import { longDate } from "@/lib/dates";
import { IssueCertificateButton } from "./issue-certificate-button";

/** OPS-08: issue only when every device is verified-or-later or recycled. */
export function CertificatePanel({ batchId, certificate, canIssue, pendingWipes, total }: { batchId: string; certificate: { certificate_number: string; issued_at: string; device_count: number } | null; canIssue: boolean; pendingWipes: number; total: number }) {
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
              Issued {longDate(certificate.issued_at)} · {certificate.device_count} devices
            </p>
          </div>
          <ClayButton href={`/api/certificates/${certificate.certificate_number}`} variant="secondary" size="sm" prefetch={false}>
            Download PDF
          </ClayButton>
        </>
      ) : (
        <>
          <div>
            <h2 className="font-semibold">Data-sanitization certificate</h2>
            <p className="mt-1 text-small text-ink-2">
              {total === 0
                ? "Receive the batch first."
                : canIssue
                  ? "Every device is verified or recycled. Ready to issue."
                  : `${pendingWipes} wipe${pendingWipes === 1 ? "" : "s"} waiting for verification. Every device must be verified or recycled first.`}
            </p>
          </div>
          <IssueCertificateButton batchId={batchId} disabled={!canIssue} />
        </>
      )}
    </ClayCard>
  );
}
