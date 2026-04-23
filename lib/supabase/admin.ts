import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — SADECE server (API routes / server actions).
 * RLS bypass eder, asla browser'a expose etme.
 */
export function createAdminClient() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRole) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY env yok. Vercel/.env.local icinde tanimla.",
    );
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRole,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
