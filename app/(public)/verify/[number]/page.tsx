import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, SearchX } from "lucide-react";
import { ClayCard } from "@/components/clay";
import { Seal } from "@/components/clay/seal";
import { createClient } from "@/lib/supabase/server";
import { isValidCertificateNumber } from "@/lib/certificate-number";
import { longDate } from "@/lib/dates";
import { getPublicSettings } from "@/lib/queries/common";
import { standardLine, type CertificateWording } from "@/lib/certificate-wording";

type Verified = { certificate_number: string; partner_name: string; device_count: number; issued_at: string; wiped_count?: number; recycled_count?: number; last_verified_at?: string | null };

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params;
  return { title: `Verify ${decodeURIComponent(number).toUpperCase()}`, robots: { index: false } };
}

/** CI-02: confirms the certificate exists and documents FGT's process: partner, device count, dates. Never serials or report IDs. */
export default async function VerifyPage({ params }: { params: Promise<{ number: string }> }) {
  const number = decodeURIComponent((await params).number).toUpperCase();
  let cert: Verified | null = null;
  let wording: CertificateWording | null = null;
  if (isValidCertificateNumber(number)) {
    const supabase = await createClient();
    const [{ data }, settings] = await Promise.all([supabase.rpc("verify_certificate", { p_number: number }), getPublicSettings(supabase)]);
    cert = (data as Verified | null) ?? null;
    wording = settings.certificate;
  }
  const standard = wording ? standardLine(wording) : null;
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16 sm:py-24">
      <ClayCard tint={cert ? "sky" : "porcelain"} size="xl" material="glass" className="flex flex-col items-center gap-6 text-center">
        {cert ? (
          <Seal rim="VERIFIED · FREE GEEK TORONTO · " icon={<BadgeCheck />} size={128} tilt={-7} />
        ) : (
          <span data-tint="porcelain" className="clay grid size-24 place-items-center rounded-full">
            <SearchX className="size-10 text-ink-2" strokeWidth={1.5} aria-hidden />
          </span>
        )}
        {cert ? (
          <>
            <div>
              <p className="eyebrow">Certificate verified</p>
              <h1 className="font-display mt-2 text-[2.25rem] leading-tight">This certificate is genuine.</h1>
              <p className="mt-3 text-ink-2">It was issued by Free Geek Toronto and documents that these devices went through its data sanitization process.</p>
            </div>
            <dl className="w-full divide-y divide-white/70 text-left font-mono text-[0.9375rem]">
              {[
                ["Number", cert.certificate_number],
                ["Issued to", cert.partner_name],
                ["Devices", String(cert.device_count)],
                ...(typeof cert.wiped_count === "number" ? [["Wiped and verified", String(cert.wiped_count)]] : []),
                ...(cert.recycled_count ? [["Recycled", String(cert.recycled_count)]] : []),
                ...(cert.last_verified_at ? [["Last wipe verified", longDate(cert.last_verified_at)]] : []),
                ["Issued", longDate(cert.issued_at)],
                ...(standard ? [["Standard", wording!.standard!]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-ink-2">{k}</dt>
                  <dd className="text-right text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            {wording ? <p className="text-left text-small text-ink-2">{wording.process}</p> : null}
            <p className="text-left text-small text-ink-2">Serial numbers and sanitization reference IDs stay on the partner&apos;s copy only. {wording?.disclaimer}</p>
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
