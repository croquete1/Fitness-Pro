// src/lib/supabaseServer.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

if (typeof window !== 'undefined') {
  throw new Error('supabaseServer só pode ser utilizado no contexto do servidor.');
}

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
    super('Variáveis do servidor em falta (URL e/ou chave).');
    this.name = 'MissingSupabaseEnvError';
  }
}

export class MissingSupabaseServiceRoleKeyError extends Error {
  constructor() {
    super('Chave de serviço do servidor em falta.');
    this.name = 'MissingSupabaseServiceRoleKeyError';
  }
}

type GlobalWithSupabase = typeof globalThis & {
  __sb_admin?: SupabaseClient | null;
  __sb_service?: SupabaseClient | null;
};
const g = globalThis as GlobalWithSupabase;

function ensureServiceClient(opts?: { optional?: boolean }): SupabaseClient | null {
  if (g.__sb_service) return g.__sb_service;

  const url = URL.trim();
  const key = SERVICE.trim();

  if (!url || !key) {
    if (opts?.optional) {
      g.__sb_service = null;
      return null;
    }
    throw new MissingSupabaseServiceRoleKeyError();
  }

  g.__sb_service = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return g.__sb_service;
}

function ensureClient(opts?: { optional?: boolean }): SupabaseClient | null {
  if (SERVICE.trim()) {
    const client = ensureServiceClient(opts);
    g.__sb_admin = client;
    return client;
  }

  if (g.__sb_admin) return g.__sb_admin;

  const url = URL.trim();
  const key = ANON.trim();

  if (!url || !key) {
    if (opts?.optional) {
      g.__sb_admin = null;
      return null;
    }
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
  const client = ensureClient();
  if (!client) throw new MissingSupabaseEnvError();
  return client;
}

export function createServerClient() {
  const client = ensureClient();
  if (!client) throw new MissingSupabaseEnvError();
  return client;
}

export function tryCreateServerClient(): SupabaseClient | null {
  return ensureClient({ optional: true });
}

export function createServiceRoleClient(): SupabaseClient {
  const client = ensureServiceClient();
  if (!client) throw new MissingSupabaseServiceRoleKeyError();
  return client;
}

export function tryCreateServiceRoleClient(): SupabaseClient | null {
  return ensureServiceClient({ optional: true });
}
