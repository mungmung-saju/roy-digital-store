import { createClient } from '@supabase/supabase-js';

// ── Public client (browser-safe, respects RLS) ───────────────────────────────
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// ── Admin client (server-side ONLY – bypasses RLS) ───────────────────────────
// Never import supabaseAdmin in any file under pages/ that ships to the browser.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
