import { getSBC } from '@/lib/supabase/server';

/** Devolve o auth.user do Supabase (ou null) no lado do servidor. */
export async function getAuthUser() {
  const sb = getSBC();
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}
