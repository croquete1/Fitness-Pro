import { getSBC } from '@/lib/supabase/server';
import { MissingSupabaseEnvError } from '@/lib/supabaseServer';

/** Devolve o auth.user do Supabase (ou null) no lado do servidor. */
export async function getAuthUser() {
  try {
    const sb = await getSBC();
    const { data, error } = await sb.auth.getUser();
    if (error) return null;
    return data.user ?? null;
  } catch (err) {
    if (err instanceof MissingSupabaseEnvError) {
      return null;
    }
    throw err;
  }
}
