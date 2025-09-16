// src/lib/supabase.server.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type AnyClient = SupabaseClient<any, 'public', any>;
let _adminClient: AnyClient | null = null;

function assertServerEnvs() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    '';

  if (!url || !serviceKey) {
    const missing: string[] = [];
    if (!url) missing.push('SUPABASE_URL (ou NEXT_PUBLIC_SUPABASE_URL)');
    if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SERVICE_KEY)');
    throw new Error(
      `Faltam variáveis de ambiente ${missing.join(
        ' / '
      )} para o supabaseAdmin().`
    );
  }
  return { url, serviceKey };
}

/** Admin client (service-role) — lazy e só no servidor */
export function supabaseAdmin(): AnyClient {
  if (_adminClient) return _adminClient;
  const { url, serviceKey } = assertServerEnvs();
  _adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminClient;
}

/** Alias p/ compatibilidade */
export const getSBAdmin = supabaseAdmin;
