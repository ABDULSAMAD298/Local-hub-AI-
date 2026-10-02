import type { SupabaseClient, User } from "@supabase/supabase-js";

const TRIAL_DAYS = 14;

// Creates the profile row for a newly signed-up user on the default trial.
// Runs at signup and again at login, because when email confirmation is on
// there is no session at signup and RLS blocks the insert until first login.
// ON CONFLICT DO NOTHING: an existing profile (paid plan, admin role) is
// never touched.
export async function ensureProfile(supabase: SupabaseClient, user: User) {
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
      role: "client",
      plan: "trial",
      plan_status: "active",
      trial_ends_at: trialEndsAt,
    },
    { onConflict: "id", ignoreDuplicates: true }
  );
}
