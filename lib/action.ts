import type { z } from "zod";

/** Uniform result for every server action: the UI shows `error` in a toast and `fieldErrors` under fields. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export class ActionError extends Error {}

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** Turn database / Supabase errors into plain-language messages. */
export function friendlyError(err: unknown): string {
  const message = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : String(err);
  if (err instanceof ActionError) return message;
  if (/row-level security|permission denied|42501/i.test(message)) return message.includes("Only") ? message : "You don't have permission to do that.";
  if (/duplicate key/i.test(message)) return "That already exists.";
  if (/Invalid login credentials/i.test(message)) return "That email and password don't match.";
  if (/fetch failed|network/i.test(message)) return "We couldn't reach the server. Check your connection and try again.";
  // Our own trigger messages are already written for people.
  if (message.length < 160 && !/[{}]|violates|relation|column/.test(message)) return message;
  return "Something went wrong. Please try again.";
}

/** Validate input with Zod, then run the handler; never throws to the client. */
export async function runAction<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  handler: (data: z.infer<S>) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  try {
    return await handler(parsed.data);
  } catch (err) {
    // Next.js redirect()/notFound() throw special errors that must propagate.
    if (typeof err === "object" && err && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    console.error("[action]", err);
    return { ok: false, error: friendlyError(err) };
  }
}
