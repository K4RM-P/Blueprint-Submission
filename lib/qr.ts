import "server-only";
import QRCode from "qrcode";
import { env } from "@/lib/env";

export function passportUrl(code: string) {
  return `${env.siteUrl}/p/${code}`;
}

/** Inline SVG QR (no network, prints crisply). */
export async function qrSvg(text: string, margin = 0): Promise<string> {
  return QRCode.toString(text, { type: "svg", margin, errorCorrectionLevel: "M", color: { dark: "#17201C", light: "#FFFFFF00" } });
}

export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 0, errorCorrectionLevel: "M", width: 240, color: { dark: "#17201C", light: "#FFFFFF" } });
}
