import { describe, expect, it } from "vitest";
import { sniffLogoType } from "@/lib/validation/organization";

const bytes = (...b: number[]) => new Uint8Array([...b, ...Array(16).fill(0)]);

describe("logo uploads are checked by content, not by the browser's claimed type (C3)", () => {
  it("recognises PNG, JPEG and WebP", () => {
    expect(sniffLogoType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(sniffLogoType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffLogoType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50))).toBe("image/webp");
  });
  it("rejects SVG and anything else, even if it claims to be an image", () => {
    expect(sniffLogoType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
    expect(sniffLogoType(new TextEncoder().encode("GIF89a"))).toBeNull();
    expect(sniffLogoType(new Uint8Array())).toBeNull();
  });
});
