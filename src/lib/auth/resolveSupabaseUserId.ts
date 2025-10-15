import type { SupabaseClient } from '@supabase/supabase-js';
import { getSBC } from '@/lib/supabase/server';
import {
  MissingSupabaseEnvError,
  MissingSupabaseServiceRoleKeyError,
  tryCreateServiceRoleClient,
} from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { getAuthUser } from './getUser';

type LookupColumn = 'auth_id' | 'id' | 'email';

type UserRow = { id: string | null; role: string | null; email?: string | null };

async function selectUser(client: SupabaseClient, column: LookupColumn, value: string) {
  const query = client
    .from('users')
    .select('id, role, email')
    .limit(1);

  if (column === 'email') {
    return query.ilike(column, value).maybeSingle<UserRow>();
  }

  return query.eq(column, value).maybeSingle<UserRow>();
}

export type ResolveSupabaseUserIdReason =
  | null
  | 'NO_SESSION'
  | 'SUPABASE_OFFLINE'
  | 'NO_MAPPING'
  | 'ROLE_MISMATCH';

export type ResolveSupabaseUserIdResult = {
  userId: string | null;
  role: string | null;
  reason: ResolveSupabaseUserIdReason;
};

type ResolveOpts = {
  expectedRole?: string | null;
};

/**
 * Procura o registo do utilizador na tabela "users" do Supabase para
 * corresponder ao utilizador autenticado via NextAuth/Supabase.
 */
export async function resolveSessionSupabaseUserId(opts: ResolveOpts = {}): Promise<ResolveSupabaseUserIdResult> {
  const bridge = await getSessionUserSafe().catch(() => null);
  const expectedRole = opts.expectedRole?.toUpperCase().trim() || null;

  if (!bridge?.id && !bridge?.user?.id) {
    return { userId: null, role: null, reason: 'NO_SESSION' };
  }

  const authUser = await getAuthUser().catch(() => null);
  const lookupMap = new Map<string, { column: LookupColumn; value: string }>();

  if (authUser?.id) {
    lookupMap.set(`auth:${authUser.id}`, { column: 'auth_id', value: authUser.id });
    lookupMap.set(`id:${authUser.id}`, { column: 'id', value: authUser.id });
  }

  const bridgeId = bridge?.id ?? bridge?.user?.id ?? null;
  if (bridgeId) {
    lookupMap.set(`bridge-id:${bridgeId}`, { column: 'id', value: String(bridgeId) });
  }

  const email = bridge?.email ?? bridge?.user?.email ?? authUser?.email ?? null;
  if (email) {
    lookupMap.set(`email:${email.toLowerCase()}`, { column: 'email', value: email });
  }

  let client: SupabaseClient | null = null;
  try {
    client = tryCreateServiceRoleClient();
    if (!client) {
      client = await getSBC();
    }
  } catch (err) {
    if (err instanceof MissingSupabaseServiceRoleKeyError || err instanceof MissingSupabaseEnvError) {
      return { userId: null, role: null, reason: 'SUPABASE_OFFLINE' };
    }
    throw err;
  }

  for (const lookup of lookupMap.values()) {
    const { data, error } = await selectUser(client, lookup.column, lookup.value);

    if (error) {
      console.warn('[resolveSessionSupabaseUserId] lookup falhou', lookup, error);
      continue;
    }

    if (!data?.id) {
      continue;
    }

    const supaRole = data.role ? String(data.role).toUpperCase() : null;
    if (expectedRole && supaRole && supaRole !== expectedRole) {
      return { userId: String(data.id), role: supaRole, reason: 'ROLE_MISMATCH' };
    }

    return { userId: String(data.id), role: supaRole, reason: null };
  }

  return { userId: null, role: null, reason: 'NO_MAPPING' };
}
