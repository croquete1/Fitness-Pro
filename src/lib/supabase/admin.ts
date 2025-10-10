// Server-only Supabase client (usa SERVICE ROLE). NÃO importar no cliente.
import { createServerClient } from '@/lib/supabaseServer';

export function getSBAdmin() {
  return createServerClient();
}
