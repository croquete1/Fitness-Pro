// src/lib/supabaseBrowser.ts
'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

class MissingSupabaseBrowserEnvError extends Error {
  constructor() {
    super('Variáveis NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY em falta.');
    this.name = 'MissingSupabaseBrowserEnvError';
  }
}

let cachedClient: SupabaseClient<Database> | null = null;

function buildClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anon) {
    throw new MissingSupabaseBrowserEnvError();
  }

  return createClient<Database>(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

export function supabaseBrowser(): SupabaseClient<Database> {
  if (!cachedClient) {
    cachedClient = buildClient();
  }
  return cachedClient;
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  return supabaseBrowser();
}

export function tryGetSupabaseBrowserClient(): SupabaseClient<Database> | null {
  try {
    return getSupabaseBrowserClient();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[supabaseBrowser] cliente indisponível', error);
    }
    return null;
  }
}

// Alias p/ retrocompatibilidade
export function createBrowserClient(): SupabaseClient<Database> {
  return supabaseBrowser();
}

// ✅ re-exporta o tipo, caso queiras importar de aqui
export type { Database } from '@/types/supabase';

export { MissingSupabaseBrowserEnvError };
