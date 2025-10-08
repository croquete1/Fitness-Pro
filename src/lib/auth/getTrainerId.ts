import { getSBC } from '@/lib/supabase/server';
import { getAuthUser } from './getUser';

/**
 * Resolve o trainer_id para o utilizador autenticado.
 * Estratégia robusta:
 *  1) tenta users.auth_id = auth.user.id → usa users.id
 *  2) se não existir, tenta users.id = auth.user.id (quando coincidem)
 *  3) valida que role === 'TRAINER'
 */
export async function getTrainerId() {
  const user = await getAuthUser();
  if (!user) return { trainerId: null, reason: 'NO_SESSION' };

  const sb = getSBC();

  // 1) auth_id -> id
  const byAuth = await sb
    .from('users')
    .select('id, role')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (byAuth.data) {
    if (String(byAuth.data.role).toUpperCase() !== 'TRAINER') {
      return { trainerId: null, reason: 'NOT_TRAINER' };
    }
    return { trainerId: String(byAuth.data.id), reason: null };
  }

  // 2) fallback: users.id == auth.user.id
  const byId = await sb
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (byId.data) {
    if (String(byId.data.role).toUpperCase() !== 'TRAINER') {
      return { trainerId: null, reason: 'NOT_TRAINER' };
    }
    return { trainerId: String(byId.data.id), reason: null };
  }

  return { trainerId: null, reason: 'NO_MAPPING' };
}
