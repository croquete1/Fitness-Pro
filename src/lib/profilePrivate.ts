// src/lib/profilePrivate.ts
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

export type SaveProfilePrivateResult =
  | { ok: true }
  | { ok: false; error: string; status: number; cause?: PostgrestError };

export async function saveProfilePrivate(
  sb: SupabaseClient,
  userId: string,
  patch: Record<string, unknown>,
): Promise<SaveProfilePrivateResult> {
  const { data: existing, error: selectError } = await sb
    .from('profile_private')
    .select('user_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (selectError && String(selectError.code) !== 'PGRST116') {
    return {
      ok: false,
      error: selectError.message ?? 'UNEXPECTED_ERROR',
      status: 500,
      cause: selectError,
    };
  }

  const mutation = existing
    ? sb.from('profile_private').update(patch).eq('user_id', userId)
    : sb.from('profile_private').insert({ user_id: userId, ...patch });

  const { error } = await mutation;
  if (error) {
    return {
      ok: false,
      error: error.message ?? 'UPDATE_FAILED',
      status: 400,
      cause: error,
    };
  }

  return { ok: true };
}
