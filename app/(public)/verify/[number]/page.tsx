import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, SearchX } from "lucide-react";
import { ClayCard } from "@/components/clay";
import { createClient } from "@/lib/supabase/server";
import { isValidCertificateNumber } from "@/lib/certificate-number";
import { longDate } from "@/lib/dates";

type Verified = { certificate_number: string; partner_name: string; device_count: number; issued_at: string };

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params;
  return { title: `Verify ${decodeURIComponent(number).toUpperCase()}`, robots: { index: false } };
}

/** CI-02: confirms the certificate exists — partner, device count, issue date. Never serials. */
export default async function VerifyPage({ params }: { params: Promise<{ number: string }> }) {
  const number = decodeURIComponent((await params).number).toUpperCase();
  let cert: Verified | null = null;
  if (isValidCertificateNumber(number)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("verify_certificate", { p_number: number });
    cert = (data as Verified | null) ?? null;
  }
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16 sm:py-24">
      <ClayCard tint={cert ? "sky" : "porcelain"} size="xl" material="glass" className="flex flex-col items-center gap-6 text-center">
        <span data-tint={cert ? "sky" : "porcelain"} className="clay grid size-24 place-items-center rounded-full text-[#1d4f9a]">
          {cert ? <BadgeCheck className="size-11" strokeWidth={1.5} aria-hidden /> : <SearchX className="size-10 text-ink-2" strokeWidth={1.5} aria-hidden />}
        </span>
        {cert ? (
          <>
            <div>
              <p className="eyebrow">Certificate verified</p>
              <h1 className="font-display mt-2 text-[2.25rem] leading-tight">This certificate is genuine.</h1>
            </div>
            <dl className="w-full divide-y divide-white/70 text-left font-mono text-[0.9375rem]">
              {[
                ["Number", cert.certificate_number],
                ["Issued to", cert.partner_name],
                ["Devices", String(cert.device_count)],
                ["Issued", longDate(cert.issued_at)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-2">{k}</dt>
                  <dd className="text-right text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-small text-ink-2">Issued by Free Geek Toronto, 180 Sudbury Street, Unit C3. Serial numbers stay on the partner&apos;s copy only.</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-[2rem] leading-tight">We couldn&apos;t find that certificate.</h1>
            <p className="text-ink-2">
              Check the number — it looks like <span className="font-mono">GL-2026-0001</span>. If it still doesn&apos;t match, contact Free Geek Toronto.
            </p>
            <Link href="/about" className="font-semibold text-loop-deep underline underline-offset-4">
              About our data-security process
            </Link>
          </>
        )}
      </ClayCard>
    </main>
  );
}
