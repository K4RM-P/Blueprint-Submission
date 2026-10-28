"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, Stamp } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { Seal } from "@/components/clay/seal";
import { useMotionPrefs } from "@/lib/motion";
import { issueCertificate } from "@/server/actions/certificates";

/** OPS-08: the sky seal stamps onto the card when the certificate is issued (§7.4). */
export function IssueCertificateButton({ batchId, disabled }: { batchId: string; disabled: boolean }) {
  const router = useRouter();
  const { reduced } = useMotionPrefs();
  const [busy, setBusy] = useState(false);
  const [stamped, setStamped] = useState<string | null>(null);
  const issue = async () => {
    setBusy(true);
    const res = await issueCertificate({ batchId });
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setStamped(res.data.number);
    toast.success(res.message ?? "Issued.");
    setTimeout(() => router.refresh(), reduced ? 0 : 1100);
  };
  if (stamped) {
    return (
      <div role="status" className="flex items-center gap-3 self-start">
        {/* Certificate seal (Signature Moment 14): one crisp press, nothing more. */}
        <Seal rim="CERTIFIED · FREE GEEK TORONTO · " icon={<ShieldCheck />} size={72} tilt={-8} />
        <span className="font-mono text-[#1d4f9a]">{stamped}</span>
      </div>
    );
  }
  return (
    <ClayButton variant="primary" size="sm" icon={<Stamp />} disabled={disabled} loading={busy} onClick={issue}>
      Issue certificate
    </ClayButton>
  );
}
