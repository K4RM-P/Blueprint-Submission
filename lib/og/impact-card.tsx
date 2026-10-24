import { ImageResponse } from "next/og";
import type { ImpactTotals } from "@/lib/impact";
import { recipientPhrase } from "@/lib/report";

/** LinkedIn's recommended link-post image size (PP-11). */
export const IMPACT_CARD_SIZE = { width: 1200, height: 627 };

const n = (x: number) => x.toLocaleString("en-CA");

export interface ImpactCardProps {
  orgName: string;
  tierLabel: string;
  periodLabel: string;
  totals: ImpactTotals;
}

/** The card itself — flat porcelain, one mint pebble, real numbers (UI §3, §12). */
export function renderImpactCard({ orgName, tierLabel, periodLabel, totals: t }: ImpactCardProps): ImageResponse {
  const who = recipientPhrase(t);
  const line = `gave ${n(t.devicesReceived)} retired ${t.devicesReceived === 1 ? "device" : "devices"} a second life${who ? ` — now helping ${who}` : ""}.`;
  const stats = [
    [n(t.devicesReused), "devices back in use"],
    [`${n(t.kgDiverted)} kg`, "kept out of landfill"],
    [`${n(t.co2eAvoidedKg)} kg`, "CO₂e avoided (est.)"],
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#F3EFE8", color: "#17201C" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#4A544F" }}>{`REUSE PARTNER · ${periodLabel.toUpperCase()}`}</div>
          <div style={{ display: "flex", fontSize: 24, color: "#0B5E42", fontWeight: 700 }}>{tierLabel}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02 }}>{orgName}</div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 18, color: "#4A544F" }}>{line}</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {stats.map(([v, l], i) => (
            <div
              key={l}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "26px 30px",
                borderRadius: 32,
                background: i === 0 ? "#D7F1E4" : "#FBF9F5",
                boxShadow: i === 0 ? "0 18px 36px -18px rgba(19,138,97,.45)" : "0 18px 36px -18px rgba(90,75,55,.35)",
              }}
            >
              <div style={{ display: "flex", fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>{v}</div>
              <div style={{ display: "flex", fontSize: 24, color: "#4A544F", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#4A544F" }}>
          <div style={{ display: "flex" }}>Data wiped & verified · refurbished by volunteers in Toronto</div>
          <div style={{ display: "flex", color: "#0B5E42", fontWeight: 700 }}>Free Geek Toronto × Relay</div>
        </div>
      </div>
    ),
    IMPACT_CARD_SIZE,
  );
}
