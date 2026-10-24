import { ImageResponse } from "next/og";
import { getPassport } from "@/lib/queries/passport";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Relay Device Passport";

export default async function OgImage({ params }: { params: Promise<{ code: string }> }) {
  const p = await getPassport((await params).code);
  const name = p ? `${p.make} ${p.model}` : "Device Passport";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #FFE0CB 0%, #FBF9F5 60%, #D7F1E4 100%)", color: "#17201C" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, letterSpacing: 4 }}>
          <span>DEVICE PASSPORT</span>
          <span style={{ fontFamily: "monospace" }}>{p?.code ?? ""}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>{name}</div>
          <div style={{ fontSize: 34, marginTop: 24, color: "#4A544F" }}>Donated · data wiped & verified · refurbished in Toronto</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#0B5E42" }}>Relay · Free Geek Toronto</div>
      </div>
    ),
    size,
  );
}
