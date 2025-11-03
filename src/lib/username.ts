// src/lib/username.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export type UsernameValidationResult =
  | { ok: true; normalized: string }
  | { ok: false; reason: 'required' | 'length' | 'format' };

const USERNAME_REGEX = /^[a-z0-9_.-]+$/i;

const RESERVED_USERNAMES = [
  'admin',
  'root',
  'support',
  'fitness',
  'user',
  'contato',
  'contact',
  'suporte',
  'help',
  'demo',
  'manager',
  'coach',
  'team',
  'info',
  'staff',
  'system',
  'guest',
  'marketing',
];

const RESERVED_LOOKUP = new Set(RESERVED_USERNAMES);

export function isReservedUsername(raw: string): boolean {
  if (!raw) return false;
  const normalized = normalizeUsername(raw);
  return RESERVED_LOOKUP.has(normalized);
}

export { RESERVED_USERNAMES };

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateUsernameCandidate(raw: string): UsernameValidationResult {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: 'required' };
  if (trimmed.length < 3 || trimmed.length > 30) return { ok: false, reason: 'length' };
  if (!USERNAME_REGEX.test(trimmed)) return { ok: false, reason: 'format' };
  return { ok: true, normalized: normalizeUsername(trimmed) };
}

type Client = SupabaseClient<Database>;

type AvailabilityOk = { ok: true; available: boolean };
type AvailabilityErr = {
  ok: false;
  reason: string;
  status?: number;
};
export type AvailabilityResult = AvailabilityOk | AvailabilityErr;

const IGNORABLE_CODES = new Set(['PGRST301', 'PGRST205', '42703', '42P01']);

async function countMatches(
  client: Client,
  table: 'users' | 'profiles',
  username: string,
  excludeUserId?: string,
) {
  let query = client.from(table).select('id', { count: 'exact', head: true }).ilike('username', username);
  if (excludeUserId) {
    const column = table === 'profiles' ? 'id' : 'id';
    query = query.neq(column, excludeUserId);
  }
  const { count, error } = await query;
  return { count: count ?? 0, error };
}

export async function checkUsernameAvailability(
  client: Client,
  username: string,
  options: { excludeUserId?: string } = {},
): Promise<AvailabilityResult> {
  const uname = normalizeUsername(username);

  if (isReservedUsername(uname)) {
    return { ok: true, available: false };
  }
  const { excludeUserId } = options;

  const [{ count: userCount, error: userError }, { count: profileCount, error: profileError }] = await Promise.all([
    countMatches(client, 'users', uname, excludeUserId),
    countMatches(client, 'profiles', uname, excludeUserId),
  ]);

  if (userError && !IGNORABLE_CODES.has(String(userError.code))) {
    return { ok: false, reason: userError.message, status: 500 };
  }
  if (profileError && !IGNORABLE_CODES.has(String(profileError.code))) {
    return { ok: false, reason: profileError.message, status: 500 };
  }

  return { ok: true, available: userCount === 0 && profileCount === 0 };
}
