import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(80),
  organizationName: z.string().trim().min(2, "Enter your organization's name.").max(120),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(10, "Use at least 10 characters.").max(72),
});

/** Invited staff/volunteers/colleagues sign up without creating an organization. */
export const inviteSignUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(10, "Use at least 10 characters.").max(72),
});

export const demoRoleSchema = z.enum(["partner", "staff", "volunteer"]);

export const resetRequestSchema = z.object({ email: z.email("Enter a valid email address.").trim().toLowerCase() });
export const newPasswordSchema = z.object({ password: z.string().min(10, "Use at least 10 characters.").max(72) });

/** Only allow same-site relative redirects after sign-in. */
export function safeNext(next: string | undefined | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
