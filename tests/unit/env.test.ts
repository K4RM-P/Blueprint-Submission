import { describe, expect, it } from "vitest";
import { isPrivateUrl, PRODUCTION_SITE_URL, resolvePublicSiteUrl } from "@/lib/env";

/** DP-01: passport QR codes must point at a URL a phone can actually reach. */
describe("isPrivateUrl", () => {
  it("flags localhost and LAN addresses", () => {
    for (const u of ["http://localhost:3000", "http://192.168.1.43:3000", "http://10.0.0.5", "http://172.20.1.1", "http://127.0.0.1:3000", "http://mac.local:3000", "not a url"]) expect(isPrivateUrl(u)).toBe(true);
  });
  it("accepts public hosts", () => {
    for (const u of ["https://freegeek-relay.vercel.app", "https://relay.freegeektoronto.org", "http://172.32.0.1"]) expect(isPrivateUrl(u)).toBe(false);
  });
});

describe("resolvePublicSiteUrl (DP-01)", () => {
  it("swaps LAN/localhost for the production domain so scanned QRs always open", () => {
    expect(resolvePublicSiteUrl("http://192.168.1.43:3000")).toBe(PRODUCTION_SITE_URL);
    expect(resolvePublicSiteUrl("http://localhost:3000")).toBe(PRODUCTION_SITE_URL);
  });
  it("keeps a public URL as-is", () => {
    expect(resolvePublicSiteUrl("https://relay.freegeektoronto.org")).toBe("https://relay.freegeektoronto.org");
  });
});
