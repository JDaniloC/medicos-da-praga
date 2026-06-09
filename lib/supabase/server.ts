// lib/supabase/server.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente server-side com service role. NUNCA importar isto em código de cliente.
export function getServiceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configurados.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function hasSupabaseConfig(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
