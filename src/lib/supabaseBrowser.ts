// src/lib/supabaseBrowser.ts
'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export function supabaseBrowser(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(url, anon, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

// Alias p/ retrocompatibilidade
export function createBrowserClient(): SupabaseClient<Database> {
  return supabaseBrowser();
}

// ✅ re-exporta o tipo, caso queiras importar de aqui
export type { Database } from '@/types/supabase';
