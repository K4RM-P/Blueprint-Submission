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

export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
export const LOGO_MAX_BYTES = 1024 * 1024;
