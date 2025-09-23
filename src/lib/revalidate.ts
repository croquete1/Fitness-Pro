// src/lib/revalidate.ts
'use server';

import { revalidateTag } from 'next/cache';
import { TAG, type TagKey } from './cache-tags';

/** Revalida tags de cache (usar após mutações). Tem de ser async porque este módulo usa "use server". */
export async function revalidateTags(...keys: TagKey[]) {
  for (const k of keys) {
    revalidateTag(k);
  }
}

// Atalhos semânticos (podem ser chamados sem await; se quiseres, usa `void touchUsers()` etc.)
export const touchUsers         = async () => revalidateTags(TAG.USERS, TAG.SIGNUPS, TAG.METRICS);
export const touchProfiles      = async () => revalidateTags(TAG.PROFILES, TAG.SIGNUPS, TAG.METRICS);
export const touchSessions      = async () => revalidateTags(TAG.SESSIONS, TAG.METRICS);
export const touchNotifications = async () => revalidateTags(TAG.NOTIFICATIONS, TAG.METRICS);
