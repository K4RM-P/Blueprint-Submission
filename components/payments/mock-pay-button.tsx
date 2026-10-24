"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { ClayButton } from "@/components/clay";

/** Posts the signed token to the webhook, exactly like a provider callback. Double-submit safe. */
export function MockPayButton({ token, label }: { token: string; label: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <form method="post" action="/api/payments/webhook" onSubmit={(e) => (busy ? e.preventDefault() : setBusy(true))}>
      <input type="hidden" name="token" value={token} />
      <ClayButton type="submit" variant="primary" size="lg" loading={busy} icon={<Lock />} className="w-full">
        {label}
      </ClayButton>
    </form>
  );
}
