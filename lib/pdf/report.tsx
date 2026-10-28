import { Document, Font, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ImpactTotals } from "@/lib/impact";
import { impactSummary } from "@/lib/report";

// Never hyphenate: model names like "MacBook Pro 13 (2017)" must not break mid-word.
Font.registerHyphenationCallback((word) => [word]);

/**
 * Annual impact report (PP-10). Same document language as the certificate (UI §9.8):
 * white, ink text, loop-green rules, charts drawn as simple flat bars. Partner logo + FGT.
 */

export interface ReportData {
  orgName: string;
  tierLabel: string;
  logoDataUrl: string | null;
  periodLabel: string;
  generatedAt: string;
  totals: ImpactTotals;
  monthly: { label: string; received: number; reused: number }[];
  recipients: { label: string; count: number }[];
  batches: { date: string; title: string; devices: number; status: string; certificate: string | null }[];
  factors: { label: string; avgWeightKg: number; co2eKg: number; source: string }[];
  refurbMinutes: { uniform: number; mixed: number };
  siteUrl: string;
}

const INK = "#17201C";
const INK2 = "#4A544F";
const INK3 = "#6F7873";
const LOOP = "#138A61";
const LOOP_SOFT = "#9BD8BE";
const LINE = "#E4DED4";

const s = StyleSheet.create({
  page: { padding: 44, paddingBottom: 80, fontSize: 9.5, color: INK, fontFamily: "Helvetica", lineHeight: 1.4 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 2, borderBottomColor: LOOP, paddingBottom: 14 },
  brand: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  small: { fontSize: 8.5, color: INK2 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 22, lineHeight: 1.15 },
  period: { fontSize: 11, color: LOOP, marginTop: 6, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  lead: { fontSize: 11, color: INK2, marginTop: 10, maxWidth: 440 },
  stats: { flexDirection: "row", flexWrap: "wrap", marginTop: 20, borderTopWidth: 1, borderTopColor: LINE },
  stat: { width: "33.33%", paddingVertical: 10, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: LINE },
  statValue: { fontSize: 20, fontFamily: "Helvetica-Bold" },
  label: { fontSize: 7.5, color: INK2, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 8 },
  row: { flexDirection: "row", gap: 24 },
  th: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 4, fontFamily: "Helvetica-Bold", fontSize: 8 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: LINE, paddingVertical: 4, fontSize: 8.5 },
  note: { fontSize: 8, color: INK2, marginTop: 6 },
  footer: { position: "absolute", bottom: 30, left: 44, right: 44, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 8, fontSize: 7.5, color: INK3 },
});

const n = (x: number) => x.toLocaleString("en-CA");

/** Vertical bar pairs per month (received = soft green, reused = loop green). */
function MonthlyChart({ data }: { data: ReportData["monthly"] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.received, d.reused]));
  const H = 110;
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", height: H, borderBottomWidth: 1, borderBottomColor: INK3 }}>
        {data.map((d) => (
          <View key={d.label} style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 2 }}>
            <View style={{ width: 9, height: Math.max(d.received ? 2 : 0, (d.received / max) * (H - 12)), backgroundColor: LOOP_SOFT, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
            <View style={{ width: 9, height: Math.max(d.reused ? 2 : 0, (d.reused / max) * (H - 12)), backgroundColor: LOOP, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", marginTop: 3 }}>
        {data.map((d) => (
          <Text key={d.label} style={{ flex: 1, textAlign: "center", fontSize: 6.5, color: INK2 }}>
            {d.label.split(" ")[0]}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 14, marginTop: 6 }}>
        <Legend color={LOOP_SOFT} label="Received" />
        <Legend color={LOOP} label="Back in use" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <View style={{ width: 8, height: 8, backgroundColor: color, borderRadius: 2 }} />
      <Text style={{ fontSize: 7.5, color: INK2 }}>{label}</Text>
    </View>
  );
}

/** Horizontal bars with the value written out (never colour alone). */
function HBars({ data }: { data: { label: string; count: number; color?: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <View style={{ gap: 5 }}>
      {data.map((d) => (
        <View key={d.label} style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ width: 92, fontSize: 8, color: INK2 }}>{d.label}</Text>
          <View style={{ flex: 1, height: 9, backgroundColor: "#F3EFE8", borderRadius: 2 }}>
            <View style={{ width: `${(d.count / max) * 100}%`, height: 9, backgroundColor: d.color ?? LOOP, borderRadius: 2 }} />
          </View>
          <Text style={{ width: 28, textAlign: "right", fontSize: 8, fontFamily: "Helvetica-Bold" }}>{n(d.count)}</Text>
        </View>
      ))}
    </View>
  );
}

export function ReportDocument({ data }: { data: ReportData }) {
  const t = data.totals;
  const people = t.devicesReused;
  return (
    <Document title={`${data.orgName} — Annual Impact Report`} author="Free Geek Toronto" creator="Relay">
      <Page size="LETTER" style={s.page}>
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            {data.logoDataUrl ? <Image src={data.logoDataUrl} style={{ height: 30, maxWidth: 110, objectFit: "contain" }} /> : null}
            <View>
              <Text style={s.brand}>{data.orgName}</Text>
              <Text style={s.small}>{data.tierLabel}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.brand}>Free Geek Toronto</Text>
            <Text style={[s.small, { color: LOOP }]}>Reuse Partnership · Relay</Text>
          </View>
        </View>

        <Text style={s.title}>Annual Impact Report</Text>
        <Text style={s.period}>{data.periodLabel}</Text>
        <Text style={s.lead}>
          {people > 0
            ? impactSummary(data.orgName, t)
            : `${n(t.devicesReceived)} devices donated by ${data.orgName} are moving through Free Geek Toronto's refurbishment process.`}
        </Text>

        <View style={s.stats}>
          {[
            ["Devices donated", n(t.devicesReceived)],
            ["Back in use", n(t.devicesReused)],
            ["Recycled responsibly", n(t.devicesRecycled)],
            ["kg kept out of landfill", n(t.kgDiverted)],
            ["kg CO2e avoided (est.)", n(t.co2eAvoidedKg)],
            ["Volunteer hours supported", n(t.volunteerHours)],
          ].map(([k, v]) => (
            <View key={k} style={s.stat}>
              <Text style={s.label}>{k}</Text>
              <Text style={s.statValue}>{v}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>Devices by month</Text>
        <MonthlyChart data={data.monthly} />

        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Who your devices help</Text>
            {data.recipients.length ? <HBars data={data.recipients} /> : <Text style={s.note}>Recipient categories appear once devices are sold.</Text>}
            <Text style={s.note}>Categories only — never names or personal details.</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Outcomes</Text>
            <HBars
              data={[
                { label: "Back in use", count: t.devicesReused },
                { label: "Recycled", count: t.devicesRecycled, color: LOOP_SOFT },
                { label: "In progress", count: t.devicesInProgress, color: LINE },
              ]}
            />
          </View>
        </View>

        {/* Keep the heading and table header with at least the first rows. */}
        <View minPresenceAhead={60}>
          <Text style={s.sectionTitle}>Batches</Text>
        </View>
        <View style={s.th} minPresenceAhead={40}>
          <Text style={{ width: "16%" }}>Submitted</Text>
          <Text style={{ width: "40%" }}>Devices</Text>
          <Text style={{ width: "10%", textAlign: "right" }}>Qty</Text>
          <Text style={{ width: "16%", paddingLeft: 10 }}>Status</Text>
          <Text style={{ width: "18%" }}>Certificate</Text>
        </View>
        {data.batches.map((b, i) => (
          <View key={i} style={s.tr} wrap={false}>
            <Text style={{ width: "16%" }}>{b.date}</Text>
            <Text style={{ width: "40%" }}>{b.title}</Text>
            <Text style={{ width: "10%", textAlign: "right" }}>{b.devices}</Text>
            <Text style={{ width: "16%", paddingLeft: 10 }}>{b.status}</Text>
            <Text style={{ width: "18%", fontFamily: "Courier" }}>{b.certificate ?? "—"}</Text>
          </View>
        ))}

        <View wrap={false}>
          <Text style={s.sectionTitle}>Methodology</Text>
          <Text style={s.note}>
            Kilograms diverted = the weight of every device that was reused or recycled responsibly (average weight by category where a device wasn&apos;t weighed). CO2e avoided
            counts reused devices only, using a per-category factor for the emissions of making a new device. Volunteer hours = {data.refurbMinutes.uniform} minutes per device from
            a uniform batch (5+ of one model) and {data.refurbMinutes.mixed} minutes per mixed device, for every refurbished device. These are the same calculations used on your
            dashboard and on {data.siteUrl.replace(/^https?:\/\//, "")}/impact.
          </Text>
          <View style={[s.th, { marginTop: 8 }]}>
            <Text style={{ width: "22%" }}>Category</Text>
            <Text style={{ width: "16%", textAlign: "right" }}>Avg kg</Text>
            <Text style={{ width: "18%", textAlign: "right" }}>kg CO2e / reuse</Text>
            <Text style={{ width: "44%", paddingLeft: 12 }}>Source</Text>
          </View>
          {data.factors.map((f) => (
            <View key={f.label} style={s.tr}>
              <Text style={{ width: "22%" }}>{f.label}</Text>
              <Text style={{ width: "16%", textAlign: "right" }}>{f.avgWeightKg}</Text>
              <Text style={{ width: "18%", textAlign: "right" }}>{f.co2eKg}</Text>
              <Text style={{ width: "44%", paddingLeft: 12, color: INK2 }}>{f.source}</Text>
            </View>
          ))}
          <Text style={s.note}>Factors marked TO VERIFY are placeholders pending review by Free Geek Toronto. Memberships are a business service; no tax receipt is implied.</Text>
        </View>

        <View style={s.footer} fixed>
          <Text>{`Prepared for ${data.orgName} by Relay · ${data.generatedAt}`}</Text>
        </View>
        
      </Page>
    </Document>
  );
}

export async function renderReportPdf(data: ReportData): Promise<Buffer> {
  return renderToBuffer(<ReportDocument data={data} />);
}
