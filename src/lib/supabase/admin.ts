// Server-only Supabase client (usa SERVICE ROLE). NÃO importar no cliente.
import { createClient } from "@supabase/supabase-js";

export function getSBAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE!;
  if (!url || !service) {
    throw new Error(
      "Faltam envs do Supabase: NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE"
    );
  }
  return createClient(url, service, { auth: { persistSession: false } });
}
