"use client";

import { useState } from "react";
import { HandCoins } from "lucide-react";
import { toast } from "sonner";
import { ClayButton, Field, Input, Segmented } from "@/components/clay";
import { CONTRIBUTION_PRESETS_CENTS, formatCents, validateContribution } from "@/lib/ledger";
import { startContribution } from "@/server/actions/payments";

type Choice = `${(typeof CONTRIBUTION_PRESETS_CENTS)[number]}` | "custom";

/** PIF-01: $5 / $10 / $25 / custom, then checkout (mock or Stripe test mode). */
export function ContributionForm({ initialCents }: { initialCents?: number }) {
  const preset = CONTRIBUTION_PRESETS_CENTS.find((c) => c === initialCents);
  const [choice, setChoice] = useState<Choice>(preset ? (`${preset}` as Choice) : initialCents ? "custom" : "1000");
  const [custom, setCustom] = useState(initialCents && !preset ? (initialCents / 100).toFixed(2) : "");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const cents = choice === "custom" ? Math.round(Number(custom.replace(/[$,\s]/g, "")) * 100) : Number(choice);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invalid = Number.isFinite(cents) ? validateContribution(cents) : "Enter an amount in dollars, like 15.";
    setError(invalid ?? undefined);
    if (invalid) return;
    setBusy(true);
    const res = await startContribution({ amountCents: cents, source: "pay_it_forward" });
    // On success the action redirects to checkout; we only get here on an error.
    if (!res.ok) {
      toast.error(res.error);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Segmented<Choice>
        label="Contribution amount"
        value={choice}
        onChange={(v) => {
          setChoice(v);
          setError(undefined);
        }}
        options={[...CONTRIBUTION_PRESETS_CENTS.map((c) => ({ value: `${c}` as Choice, label: formatCents(c).replace(".00", "") })), { value: "custom", label: "Custom" }]}
      />
      {choice === "custom" ? (
        <Field label="Amount (CAD)" hint="Between $1 and $1,000." error={error}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} inputMode="decimal" autoFocus placeholder="15.00" aria-describedby={describedBy} aria-invalid={invalid} value={custom} onChange={(e) => setCustom(e.target.value)} />
          )}
        </Field>
      ) : error ? (
        <p role="alert" className="text-small font-medium text-danger-ink">
          {error}
        </p>
      ) : null}
      <ClayButton type="submit" variant="primary" size="lg" loading={busy} icon={<HandCoins />} className="self-start">
        {Number.isFinite(cents) && cents > 0 ? `Contribute ${formatCents(cents)}` : "Contribute"}
      </ClayButton>
      <p className="text-small text-ink-3">Contributions through Relay don&apos;t come with a tax receipt.</p>
    </form>
  );
}
