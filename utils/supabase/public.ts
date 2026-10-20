import { createClient } from "@supabase/supabase-js";

/**
 * Server-side client for public, unauthenticated reads.
 * Deliberately does NOT touch cookies, so pages using it can be static/ISR.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
