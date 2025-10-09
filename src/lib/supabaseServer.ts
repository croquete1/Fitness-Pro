// src/lib/supabaseServer.ts
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';
const ANON =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';
const SERVICE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

export class MissingSupabaseEnvError extends Error {
  constructor() {
    super('Supabase env vars em falta (URL e/ou chave).');
    this.name = 'MissingSupabaseEnvError';
  }
}

type GlobalWithSupabase = typeof globalThis & { __sb_admin?: SupabaseClient };
const g = globalThis as GlobalWithSupabase;

function ensureClient(): SupabaseClient {
  if (g.__sb_admin) return g.__sb_admin;

  const url = URL.trim();
  const key = (SERVICE || ANON).trim();

  if (!url || !key) {
    throw new MissingSupabaseEnvError();
  }

  g.__sb_admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return g.__sb_admin;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(URL && (SERVICE || ANON));
}

const supabaseProxy: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = ensureClient();
    const value = Reflect.get(client as unknown as object, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export const supabaseAdmin = supabaseProxy;
export default supabaseProxy;

export function getSupabaseServer() {
  return ensureClient();
}

export function createServerClient() {
  return ensureClient();
}
