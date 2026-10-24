import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

/**
 * Data-sanitization certificate (CI-01). Flat, formal, print-professional:
 * white, ink text, loop-green rules, no clay, no gradients (UI §9.8).
 */

export interface CertificateDevice {
  category: string;
  makeModel: string;
  serial: string | null;
  method: string | null;
  verifiedAt: string | null;
  outcome: "Reused" | "Recycled" | "In refurbishment";
}

export interface CertificateData {
  number: string;
  partnerName: string;
  batchId: string;
  receivedAt: string | null;
  issuedAt: string;
  issuedBy: string;
  devices: CertificateDevice[];
  verifyUrl: string;
  qrDataUrl: string;
}

const INK = "#17201C";
const INK2 = "#4A544F";
const LOOP = "#138A61";
const LINE = "#E4DED4";

const s = StyleSheet.create({
  page: { padding: 44, paddingBottom: 120, fontSize: 9.5, color: INK, fontFamily: "Helvetica", lineHeight: 1.4 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 2, borderBottomColor: LOOP, paddingBottom: 14 },
  brand: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  small: { fontSize: 8.5, color: INK2 },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", marginTop: 22 },
  number: { fontSize: 12, fontFamily: "Courier-Bold", color: LOOP, marginTop: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 18, borderTopWidth: 1, borderTopColor: LINE },
  cell: { width: "50%", paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: LINE },
  label: { fontSize: 7.5, color: INK2, textTransform: "uppercase", letterSpacing: 0.6 },
  value: { fontSize: 10, marginTop: 2 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 6 },
  th: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 4, fontFamily: "Helvetica-Bold", fontSize: 8 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 4, fontSize: 8 },
  c1: { width: "6%" },
  c2: { width: "24%" },
  c3: { width: "16%", fontFamily: "Courier" },
  c4: { width: "28%" },
  c5: { width: "14%" },
  c6: { width: "12%" },
  statement: { marginTop: 20, fontSize: 9, color: INK2 },
  footer: { position: "absolute", bottom: 32, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderTopWidth: 1, borderTopColor: LINE, paddingTop: 10 },
});

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "America/Toronto" }) : "—");

export function CertificateDocument({ data }: { data: CertificateData }) {
  return (
    <Document title={`Data-Sanitization Certificate ${data.number}`} author="Free Geek Toronto" creator="Relay">
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Free Geek Toronto</Text>
            <Text style={s.small}>180 Sudbury Street, Unit C3, Toronto, ON</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[s.brand, { color: LOOP }]}>Relay</Text>
            <Text style={s.small}>Chain-of-custody record</Text>
          </View>
        </View>

        <Text style={s.title}>Certificate of Data Sanitization</Text>
        <Text style={s.number}>{data.number}</Text>

        <View style={s.grid}>
          {[
            ["Issued to", data.partnerName],
            ["Batch ID", data.batchId],
            ["Date received", fmt(data.receivedAt)],
            ["Date issued", fmt(data.issuedAt)],
            ["Issued by", data.issuedBy],
            ["Devices covered", String(data.devices.length)],
          ].map(([k, v]) => (
            <View key={k} style={s.cell}>
              <Text style={s.label}>{k}</Text>
              <Text style={s.value}>{v}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Devices</Text>
        <View style={s.th} fixed>
          <Text style={s.c1}>#</Text>
          <Text style={s.c2}>Device</Text>
          <Text style={s.c3}>Serial</Text>
          <Text style={s.c4}>Sanitization method</Text>
          <Text style={s.c5}>Verified</Text>
          <Text style={s.c6}>Outcome</Text>
        </View>
        {data.devices.map((d, i) => (
          <View key={i} style={s.tr} wrap={false}>
            <Text style={s.c1}>{i + 1}</Text>
            <Text style={s.c2}>
              {d.makeModel} ({d.category})
            </Text>
            <Text style={s.c3}>{d.serial ?? "not recorded"}</Text>
            <Text style={s.c4}>{d.method ?? (d.outcome === "Recycled" ? "Physically recycled" : "—")}</Text>
            <Text style={s.c5}>{d.verifiedAt ? fmt(d.verifiedAt) : "—"}</Text>
            <Text style={s.c6}>{d.outcome}</Text>
          </View>
        ))}

        <Text style={s.statement}>
          Statement of process: each storage device listed above was received with its drive intact and sanitized by Free Geek Toronto using its data-sanitization software, which
          produces a report for every device. A Free Geek Toronto staff member verified each sanitization report before the device could be refurbished, sold or recycled. Devices
          that could not be reused were recycled responsibly. Every step is recorded in an append-only chain of custody. Relay records sanitization; Free Geek Toronto&apos;s
          sanitization software remains the system of record. [Process wording to be confirmed by Free Geek Toronto.]
        </Text>

        <View style={s.footer} fixed>
          <View style={{ maxWidth: 380 }}>
            <Text style={s.small}>Verify this certificate at</Text>
            <Text style={{ fontSize: 9, fontFamily: "Courier", color: LOOP }}>{data.verifyUrl}</Text>
            <Text style={[s.small, { marginTop: 4 }]}>The public page confirms the partner, device count and issue date — never serial numbers.</Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
          <Image src={data.qrDataUrl} style={{ width: 64, height: 64 }} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderCertificatePdf(data: CertificateData): Promise<Buffer> {
  return renderToBuffer(<CertificateDocument data={data} />);
}
