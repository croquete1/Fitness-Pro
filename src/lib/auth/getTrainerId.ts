import type { SupabaseClient } from '@supabase/supabase-js';
import { getSBC } from '@/lib/supabase/server';
import {
  MissingSupabaseEnvError,
  MissingSupabaseServiceRoleKeyError,
  tryCreateServiceRoleClient,
} from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { isPT } from '@/lib/roles';
import { getAuthUser } from './getUser';

/**
 * Resolve o trainer_id para o utilizador autenticado.
 * Estratégia robusta:
 *  1) tenta users.auth_id = auth.user.id → usa users.id
 *  2) se não existir, tenta users.id = auth.user.id (quando coincidem)
 *  3) valida que role === 'TRAINER'
 */
type TrainerRow = { id: string | null; role: string | null };

async function selectTrainer(
  client: SupabaseClient,
  column: 'auth_id' | 'id' | 'email',
  value: string,
) {
  const query = client
    .from('users')
    .select('id, role')
    .limit(1);

  if (column === 'email') {
    return query.ilike(column, value).maybeSingle<TrainerRow>();
  }

  return query.eq(column, value).maybeSingle<TrainerRow>();
}

export async function getTrainerId() {
  const bridge = await getSessionUserSafe().catch(() => null);
  if (bridge?.id) {
    if (!isPT(bridge.role)) {
      return { trainerId: null, reason: 'NOT_TRAINER' as const };
    }
    return { trainerId: String(bridge.id), reason: null };
  }

  const user = await getAuthUser();
  const supabaseEmail = bridge?.email ?? bridge?.user?.email ?? null;
  const searchValues = new Map<string, { column: 'auth_id' | 'id' | 'email'; value: string }>();

  if (user?.id) {
    searchValues.set(`auth:${user.id}`, { column: 'auth_id', value: user.id });
    searchValues.set(`id:${user.id}`, { column: 'id', value: user.id });
  }

  if (bridge?.id) {
    searchValues.set(`bridge-id:${bridge.id}`, { column: 'id', value: String(bridge.id) });
  }

  if (supabaseEmail) {
    searchValues.set(`email:${supabaseEmail.toLowerCase()}`, {
      column: 'email',
      value: supabaseEmail,
    });
  }

  let client: SupabaseClient | null = null;
  try {
    client = tryCreateServiceRoleClient();
    if (!client) {
      client = await getSBC();
    }
  } catch (err) {
    if (err instanceof MissingSupabaseServiceRoleKeyError || err instanceof MissingSupabaseEnvError) {
      return { trainerId: null, reason: 'SUPABASE_OFFLINE' as const };
    }
    throw err;
  }

  for (const lookup of searchValues.values()) {
    const { data, error } = await selectTrainer(client, lookup.column, lookup.value);
    if (error) {
      console.warn('[getTrainerId] lookup falhou', lookup, error);
      continue;
    }

    if (!data?.id) {
      continue;
    }

    if (String(data.role ?? '').toUpperCase() !== 'TRAINER') {
      return { trainerId: null, reason: 'NOT_TRAINER' as const };
    }

    return { trainerId: String(data.id), reason: null };
  }

  if (!bridge && !user) {
    return { trainerId: null, reason: 'NO_SESSION' as const };
  }

  return { trainerId: null, reason: 'NO_MAPPING' as const };
}
