// src/lib/supabaseServer.ts
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE ??
  process.env.SUPABASE_SERVICE_KEY; // cobre nomes comuns

if (!URL) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
if (!ANON && !SERVICE) throw new Error('Missing SUPABASE keys');

// singleton em dev/SSR
const g = globalThis as unknown as { __sb_admin?: SupabaseClient };

function makeAdmin(): SupabaseClient {
  // Em server usamos SERVICE se existir, senão ANON
  const key = SERVICE || ANON;
  return createClient(URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin: SupabaseClient = g.__sb_admin ?? makeAdmin();
if (!g.__sb_admin) g.__sb_admin = supabaseAdmin;

// ✅ default export para usares sem função
export default supabaseAdmin;

// ✅ aliases de compatibilidade (para ficheiros antigos)
export function getSupabaseServer() { return supabaseAdmin; }
export function createServerClient() { return supabaseAdmin; }
