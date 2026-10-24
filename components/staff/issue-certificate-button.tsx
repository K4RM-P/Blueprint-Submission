"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Stamp } from "lucide-react";
import { toast } from "sonner";
import { ClayButton } from "@/components/clay";
import { useMotionPrefs } from "@/lib/motion";
import { issueCertificate } from "@/server/actions/certificates";

/** OPS-08: the sky seal stamps onto the card when the certificate is issued (§7.4). */
export function IssueCertificateButton({ batchId, disabled }: { batchId: string; disabled: boolean }) {
  const router = useRouter();
  const { reduced, t } = useMotionPrefs();
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
      <motion.div
        role="status"
        initial={reduced ? false : { scale: 1.3, rotate: -6, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={t("press")}
        className="relative flex items-center gap-3 self-start rounded-full border-2 border-[#2e68c4] bg-white/70 px-4 py-2 font-mono text-[#1d4f9a]"
      >
        {!reduced ? <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-[#2e68c4]" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.8 }} /> : null}
        <ShieldCheck className="size-5" aria-hidden /> {stamped}
      </motion.div>
    );
  }
  return (
    <ClayButton variant="primary" size="sm" icon={<Stamp />} disabled={disabled} loading={busy} onClick={issue}>
      Issue certificate
    </ClayButton>
  );
}
