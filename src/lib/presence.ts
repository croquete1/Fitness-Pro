import type { SupabaseClient } from '@supabase/supabase-js';
import { AUDIT_TABLE_CANDIDATES, isMissingAuditTableError } from '@/lib/audit';

export type PresenceRecord = { lastLogin: string | null; lastLogout: string | null };

export type PresenceSummary = {
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
  lastSeenAt: string | null;
  online: boolean;
};

export const DEFAULT_ONLINE_WINDOW_MS = 1000 * 60 * 15; // 15 minutes

export async function fetchPresenceMap(
  client: SupabaseClient,
  ids: string[],
): Promise<Map<string, PresenceRecord>> {
  const presence = new Map<string, PresenceRecord>();
  if (!ids.length) return presence;

  for (const table of AUDIT_TABLE_CANDIDATES) {
    try {
      const { data, error } = await client
        .from(table as any)
        .select('actor_id, kind, created_at')
        .in('actor_id', ids)
        .in('kind', ['LOGIN', 'LOGOUT'])
        .order('created_at', { ascending: false });

      if (error) {
        if (isMissingAuditTableError(error)) continue;
        console.warn(`[presence] falha a ler ${table}`, error);
        return presence;
      }

      for (const row of data ?? []) {
        const actorId = String(row.actor_id ?? '').trim();
        if (!actorId) continue;
        const kind = String(row.kind ?? '').toUpperCase();
        const createdAt = row.created_at ? new Date(row.created_at).toISOString() : null;
        if (!createdAt) continue;
        const current = presence.get(actorId) ?? { lastLogin: null, lastLogout: null };
        if (kind === 'LOGIN' && !current.lastLogin) current.lastLogin = createdAt;
        if (kind === 'LOGOUT' && !current.lastLogout) current.lastLogout = createdAt;
        presence.set(actorId, current);
      }

      break;
    } catch (err) {
      if (isMissingAuditTableError(err)) continue;
      console.warn(`[presence] erro inesperado ao consultar ${table}`, err);
      return presence;
    }
  }

  return presence;
}

export function summarizePresence(
  record: PresenceRecord | undefined,
  opts?: { now?: number | Date; onlineWindowMs?: number },
): PresenceSummary {
  const nowInput = opts?.now ?? Date.now();
  const now = nowInput instanceof Date ? nowInput.getTime() : Number(nowInput) || Date.now();
  const onlineWindow = opts?.onlineWindowMs ?? DEFAULT_ONLINE_WINDOW_MS;

  const lastLoginAt = record?.lastLogin ?? null;
  const lastLogoutAt = record?.lastLogout ?? null;

  const lastLoginDate = lastLoginAt ? new Date(lastLoginAt) : null;
  const lastLogoutDate = lastLogoutAt ? new Date(lastLogoutAt) : null;
  const candidates = [lastLoginDate, lastLogoutDate]
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => b.getTime() - a.getTime());
  const lastSeenDate = candidates[0] ?? null;

  const online = Boolean(
    lastLoginDate &&
    (!lastLogoutDate || lastLoginDate > lastLogoutDate) &&
    now - lastLoginDate.getTime() <= onlineWindow,
  );

  return {
    lastLoginAt,
    lastLogoutAt,
    lastSeenAt: lastSeenDate ? lastSeenDate.toISOString() : lastLoginAt,
    online,
  };
}
