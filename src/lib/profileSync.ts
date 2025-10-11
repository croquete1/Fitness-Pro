// src/lib/profileSync.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type Client = SupabaseClient<Database>;

type Patch = Record<string, unknown>;

type SyncResult = { ok: boolean; error?: string };

const USER_FIELDS = new Set([
  'name',
  'avatar_url',
  'phone',
  'username',
  'role',
  'status',
  'approved',
  'active',
  'metadata',
  'last_sign_in_at',
]);

const PROFILE_FIELDS = new Set([
  'name',
  'avatar_url',
  'phone',
  'bio',
  'birthdate',
  'height_cm',
  'weight_kg',
  'rejection_reason',
]);

const PROFILE_ALIASES = new Map<string, string>([
  ['birth_date', 'birthdate'],
]);

function assign(target: Record<string, unknown>, key: string, value: unknown) {
  if (value === undefined) return;
  target[key] = value;
}

function splitPatch(patch: Patch) {
  const user: Record<string, unknown> = {};
  const profile: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(patch)) {
    const alias = PROFILE_ALIASES.get(key) ?? key;
    if (USER_FIELDS.has(key)) assign(user, key, value);
    if (PROFILE_FIELDS.has(alias)) assign(profile, alias, value);
  }

  return { user, profile };
}

export async function syncUserProfile(client: Client, userId: string, patch: Patch): Promise<SyncResult> {
  const { user, profile } = splitPatch(patch);

  if (Object.keys(user).length) {
    const { error } = await client.from('users').update(user).eq('id', userId);
    if (error) {
      return { ok: false, error: error.message };
    }
  }

  if (Object.keys(profile).length) {
    const { error } = await client.from('profiles').upsert({ id: userId, ...profile }, { onConflict: 'id' });
    if (error) {
      return { ok: false, error: error.message };
    }
  }

  return { ok: true };
}

export function extractUserPatch(patch: Patch) {
  return splitPatch(patch).user;
}

export function extractProfilePatch(patch: Patch) {
  return splitPatch(patch).profile;
}
