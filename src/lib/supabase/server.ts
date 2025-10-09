import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { MissingSupabaseEnvError } from '@/lib/supabaseServer';

export function getSBC() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new MissingSupabaseEnvError();
  }
  const cookieStore = cookies();
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) { try { cookieStore.set({ name, value, ...options }); } catch {} },
        remove(name: string, options: CookieOptions) { try { cookieStore.set({ name, value: '', ...options }); } catch {} },
      },
    }
  );
}

/** Alias estável para usar nos endpoints */
export const serverSB = getSBC;
