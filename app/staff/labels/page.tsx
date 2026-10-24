import type { Metadata } from "next";
import { EmptyState } from "@/components/clay";
import { PageHeader } from "@/components/shell/page-header";
import { PrintButton } from "@/components/staff/print-button";
import { requireRole } from "@/lib/auth";
import { passportUrl, qrSvg } from "@/lib/qr";

export const metadata: Metadata = { title: "QR labels" };

/**
 * OPS-09: print-ready sheet sized for a standard 30-up US Letter label sheet
 * (Avery 5160 / 8160: 3 × 10 labels of 2.625" × 1").
 */
export default async function LabelsPage({ searchParams }: { searchParams: Promise<{ ids?: string; status?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireRole("staff");
  const ids = (sp.ids ?? "").split(",").filter((x) => /^[0-9a-f-]{36}$/.test(x)).slice(0, 300);
  let q = supabase.from("devices").select("id, passport_code, make, model").order("passport_code");
  q = ids.length ? q.in("id", ids) : q.eq("status", "received").limit(30);
  const { data } = await q;
  const devices = data ?? [];
  const labels = await Promise.all(devices.map(async (d) => ({ ...d, svg: await qrSvg(passportUrl(d.passport_code)) })));

  return (
    <>
      <div className="no-print">
        <PageHeader
          eyebrow="Staff Console"
          title="QR labels"
          description={ids.length ? `${labels.length} selected devices.` : "Showing up to 30 newly received devices. Select specific devices from the Devices table to print others."}
          actions={labels.length ? <PrintButton /> : null}
        />
        <p className="mb-6 text-small text-ink-2">Prints on US Letter, 30 labels per sheet (Avery 5160). Set margins to “None” and scale to 100% in the print dialog.</p>
      </div>
      {labels.length === 0 ? (
        <EmptyState title="No devices to label." tone="sky">Receive a batch or select devices from the Devices table.</EmptyState>
      ) : (
        <div className="label-sheet-wrap overflow-x-auto">
          <div className="label-sheet">
            {labels.map((l) => (
              <div key={l.id} className="label">
                <div className="label-qr" dangerouslySetInnerHTML={{ __html: l.svg }} aria-label={`QR code for ${l.passport_code}`} role="img" />
                <div className="label-text">
                  <p className="label-code">{l.passport_code}</p>
                  <p className="label-model">
                    {l.make} {l.model}
                  </p>
                  <p className="label-org">Free Geek Toronto · scan for its story</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
