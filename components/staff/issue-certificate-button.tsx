"use client";

import { ClayButton } from "@/components/clay";

/** Wired to certificate issuance in Stage 6. */
export function IssueCertificateButton({ disabled }: { batchId: string; disabled: boolean }) {
  return (
    <ClayButton variant="secondary" size="sm" disabled={disabled}>
      Issue certificate
    </ClayButton>
  );
}
