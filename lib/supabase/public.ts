import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/lib/database.types";

/**
 * Cookie-less anonymous client for public pages that only call public-safe RPCs
 * (impact totals, Partner Wall). Not reading cookies lets those pages be cached and
 * revalidated (ISR) instead of hitting the database on every visit.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
