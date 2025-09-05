// src/lib/supabaseServer.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente admin (service role) para uso em rotas /server.
 * Requer:
 *  - SUPABASE_URL
 *  - SUPABASE_SERVICE_ROLE_KEY  (NUNCA expor no cliente)
 */
export function supabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Faltam variáveis de ambiente SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY para o supabaseAdmin().'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'fitness-pro/server' } },
  });
}
export function supabasePublic(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'fitness-pro/server-public' } },
  });
}
/**
 * Compat layer para código existente.
 * Alguns ficheiros chamam createServerClient(...) com args (cookies/headers).
 * Para manter compatibilidade, aceitamos quaisquer argumentos e devolvemos o admin client.
 * Se no futuro quiseres RLS por utilizador, podemos trocar aqui por um cliente SSR com cookies.
 */
export function createServerClient(..._args: any[]): SupabaseClient {
  return supabaseAdmin();
}

// (Opcional) exporta o tipo para quem quiser anotar variáveis
export type { SupabaseClient };
