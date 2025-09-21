// src/lib/supabaseServer.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function assertEnv(name: string, value?: string) {
  if (!value) throw new Error(`Missing env "${name}" for Supabase`);
  return value;
}

function makeClient(key: string): SupabaseClient {
  const url = assertEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Função (service role) — usar em endpoints/server actions com permissões de admin (bypass RLS).
 */
export function getSupabaseServer(): SupabaseClient {
  const serviceKey = assertEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
  return makeClient(serviceKey);
}

/**
 * Função (anon) — usar em server components/APIs que respeitam RLS.
 */
export function getSupabaseAnonServer(): SupabaseClient {
  const anonKey = assertEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return makeClient(anonKey);
}

/**
 * Aliases para compatibilidade com código existente.
 * - Alguns ficheiros importam uma FUNÇÃO `createServerClient`
 * - Outros importam uma INSTÂNCIA `supabaseAdmin` (cliente já criado)
 */
export const createServerClient: () => SupabaseClient = getSupabaseServer;

// Clientes prontos a usar (se precisas de uma instância diretamente)
export const supabaseAdmin: SupabaseClient = getSupabaseServer();
export const supabase: SupabaseClient = getSupabaseAnonServer();

// Default export compatível com `import createServerClient from '@/lib/supabaseServer'`
export default createServerClient;
