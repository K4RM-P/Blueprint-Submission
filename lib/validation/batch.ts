import { z } from "zod";
import { DEVICE_CATEGORIES, DEVICE_CONDITIONS } from "@/lib/domain";
import { isMonday } from "@/lib/dates";

const thisYear = new Date().getFullYear();

export const lineItemSchema = z.object({
  category: z.enum(DEVICE_CATEGORIES, { message: "Choose a category." }),
  make: z.string().trim().min(1, "Enter the make, e.g. Dell.").max(60),
  model: z.string().trim().min(1, "Enter the model, e.g. Latitude 5420.").max(80),
  approxYear: z
    .number({ message: "Enter a year, or leave it blank." })
    .int()
    .min(1990, "That year looks too early.")
    .max(thisYear + 1, "That year is in the future.")
    .nullable(),
  quantity: z.number({ message: "Enter how many." }).int("Use a whole number.").min(1, "Enter at least 1 device.").max(500, "Over 500? Contact us directly."),
  condition: z.enum(DEVICE_CONDITIONS),
});

export const batchSchema = z
  .object({
    lineItems: z.array(lineItemSchema).min(1, "Add at least one device.").max(30, "Split very large batches into two."),
    logistics: z.enum(["dropoff", "pickup"]),
    preferredWeek: z.string().refine(isMonday, "Choose a week from the calendar."),
    pickupAddress: z.string().trim().max(200).optional().or(z.literal("")),
    dataHandlingAck: z.literal(true, { message: "Please confirm so we can wipe the drives for you." }),
    notes: z.string().trim().max(1000, "Keep notes under 1,000 characters.").optional().or(z.literal("")),
  })
  .refine((b) => b.logistics !== "pickup" || (b.pickupAddress ?? "").length >= 5, { path: ["pickupAddress"], message: "Enter the pickup address." });

export type BatchInput = z.infer<typeof batchSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;

export const idSchema = z.object({ id: z.uuid() });
