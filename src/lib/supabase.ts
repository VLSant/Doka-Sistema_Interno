/**
 * Single browser Supabase client.
 *
 * Uses only the publishable key from `env.ts`. Default session persistence
 * and refresh are kept (Research #1/#4/#8). Never accepts a secret/service
 * role key: there is no code path in this module that reads any environment
 * variable other than the validated publishable ones.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadAppEnv } from "./env";

let client: SupabaseClient | undefined;

function createSupabaseClient(): SupabaseClient {
  const env = loadAppEnv();

  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Returns the shared Supabase client, creating it lazily on first use.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}
