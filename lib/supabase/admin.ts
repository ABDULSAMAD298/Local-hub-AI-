import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-only contexts that must bypass RLS
// (Stripe webhooks have no user session to authenticate as). Requires
// SUPABASE_SERVICE_ROLE_KEY — never expose this client or key to the browser.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
