// src/lib/supabase.server.ts
// Cliente Supabase apenas no servidor (service-role). Sem Prisma.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type AnyClient = SupabaseClient<any, 'public', any>;
let _adminClient: AnyClient | null = null;

/** Lê envs aceitando ambos os nomes; só lança erro quando o client é pedido. */
function readServerEnvs() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    '';
  return { url, serviceKey };
}

export function supabaseAdmin(): AnyClient {
  if (_adminClient) return _adminClient;
  const { url, serviceKey } = readServerEnvs();
  if (!url || !serviceKey) {
    const miss: string[] = [];
    if (!url) miss.push('SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL');
    if (!serviceKey) miss.push('SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY');
    throw new Error(`[supabaseAdmin] Faltam envs: ${miss.join(' + ')}`);
  }
  _adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _adminClient;
}

/** Alias para compat com código existente */
export const getSBAdmin = supabaseAdmin;
