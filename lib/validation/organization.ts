import { z } from "zod";
import { EMPLOYEE_RANGES } from "@/lib/domain";

const optionalUrl = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v), "Enter a full web address, like https://example.ca")
  .optional();

export const organizationSchema = z.object({
  name: z.string().trim().min(2, "Enter your organization's name.").max(120),
  industry: z.string().trim().max(60).optional(),
  employeeRange: z.enum(EMPLOYEE_RANGES).or(z.literal("")).optional(),
  website: optionalUrl,
  contactEmail: z.email("Enter a valid email.").or(z.literal("")).optional(),
  contactPhone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || /^[+\d][\d\s().-]{6,}$/.test(v), "Enter a phone number.")
    .optional(),
  wallOptIn: z.boolean(),
  passportAttributionOptIn: z.boolean(),
});
export type OrganizationInput = z.infer<typeof organizationSchema>;

export const colleagueSchema = z.object({
  fullName: z.string().trim().min(2, "Enter their name.").max(80),
  email: z.email("Enter a valid email.").trim().toLowerCase(),
});

// Raster only: an SVG in the public logos bucket could carry script, and the browser-sent type can't be trusted.
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export type LogoType = (typeof LOGO_TYPES)[number];

/** The real image type from the file's first bytes (magic numbers), or null if it isn't a PNG, JPEG or WebP. */
export function sniffLogoType(bytes: Uint8Array): LogoType | null {
  const at = (i: number, ...b: number[]) => b.every((x, j) => bytes[i + j] === x);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}
export const LOGO_MAX_BYTES = 1024 * 1024;
