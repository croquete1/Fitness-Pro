import type { SupabaseClient } from '@supabase/supabase-js';
import { AUDIT_TABLE_CANDIDATES, isMissingAuditTableError } from '@/lib/audit';

export type PresenceRecord = {
  lastLogin: string | null;
  lastLogout: string | null;
  lastSeen: string | null;
  activeSession: boolean;
};

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

  const ensureRecord = (id: string): PresenceRecord => {
    const existing = presence.get(id);
    if (existing) return existing;
    const fresh: PresenceRecord = {
      lastLogin: null,
      lastLogout: null,
      lastSeen: null,
      activeSession: false,
    };
    presence.set(id, fresh);
    return fresh;
  };

  const parseIso = (value: unknown): string | null => {
    if (!value) return null;
    const date = new Date(value as any);
    const time = date.getTime();
    if (!Number.isFinite(time)) return null;
    return date.toISOString();
  };

  const maxIso = (a: string | null, b: string | null): string | null => {
    if (!a) return b;
    if (!b) return a;
    return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
  };

  const isPermissionDenied = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;
    const code = 'code' in error ? String((error as any).code ?? '') : '';
    if (code === '42501') return true;
    const message = 'message' in error ? String((error as any).message ?? '') : '';
    const normalized = message.toLowerCase();
    return normalized.includes('permission') && normalized.includes('denied');
  };

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
        const createdAt = parseIso(row.created_at);
        if (!createdAt) continue;
        const current = ensureRecord(actorId);
        if (kind === 'LOGIN') {
          current.lastLogin = maxIso(current.lastLogin, createdAt);
          current.lastSeen = maxIso(current.lastSeen, createdAt);
        }
        if (kind === 'LOGOUT') {
          current.lastLogout = maxIso(current.lastLogout, createdAt);
          current.lastSeen = maxIso(current.lastSeen, createdAt);
        }
        presence.set(actorId, current);
      }

      break;
    } catch (err) {
      if (isMissingAuditTableError(err)) continue;
      console.warn(`[presence] erro inesperado ao consultar ${table}`, err);
      return presence;
    }
  }

  try {
    const { data, error } = await client
      .schema('auth')
      .from('sessions')
      .select('user_id, created_at, updated_at, refreshed_at, not_after, revoked')
      .in('user_id', ids);
    if (error) {
      if (!isPermissionDenied(error)) console.warn('[presence] falha ao ler auth.sessions', error);
    } else {
      const now = Date.now();
      for (const row of data ?? []) {
        const userId = String(row.user_id ?? '').trim();
        if (!userId) continue;
        const current = ensureRecord(userId);
        const createdAt = parseIso((row as any).created_at);
        const updatedAt = parseIso((row as any).updated_at);
        const refreshedAt = parseIso((row as any).refreshed_at);
        const notAfterTs = parseIso((row as any).not_after);
        const notAfterMs = notAfterTs ? new Date(notAfterTs).getTime() : null;
        const revoked = Boolean(row.revoked);

        if (createdAt) {
          current.lastLogin = maxIso(current.lastLogin, createdAt);
          current.lastSeen = maxIso(current.lastSeen, createdAt);
        }
        if (updatedAt) {
          current.lastSeen = maxIso(current.lastSeen, updatedAt);
          if (revoked) current.lastLogout = maxIso(current.lastLogout, updatedAt);
        }
        if (refreshedAt) {
          current.lastSeen = maxIso(current.lastSeen, refreshedAt);
        }
        if (!revoked && (!notAfterMs || notAfterMs > now)) {
          current.activeSession = true;
        }
        presence.set(userId, current);
      }
    }
  } catch (error) {
    if (!isPermissionDenied(error)) console.warn('[presence] erro inesperado ao consultar auth.sessions', error);
  }

  try {
    const { data, error } = await client
      .schema('auth')
      .from('users')
      .select('id, last_sign_in_at')
      .in('id', ids);
    if (error) {
      if (!isPermissionDenied(error)) console.warn('[presence] falha ao ler auth.users', error);
    } else {
      for (const row of data ?? []) {
        const userId = String(row.id ?? '').trim();
        if (!userId) continue;
        const current = ensureRecord(userId);
        const lastSignIn = parseIso((row as any).last_sign_in_at);
        if (lastSignIn) {
          current.lastLogin = maxIso(current.lastLogin, lastSignIn);
          current.lastSeen = maxIso(current.lastSeen, lastSignIn);
        }
        presence.set(userId, current);
      }
    }
  } catch (error) {
    if (!isPermissionDenied(error)) console.warn('[presence] erro inesperado ao consultar auth.users', error);
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
  const lastSeenAt = record?.lastSeen ?? lastLoginAt;

  const lastLoginDate = lastLoginAt ? new Date(lastLoginAt) : null;
  const lastLogoutDate = lastLogoutAt ? new Date(lastLogoutAt) : null;
  const lastSeenDate = lastSeenAt ? new Date(lastSeenAt) : null;
  const candidateDates = [lastSeenDate, lastLoginDate, lastLogoutDate]
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => b.getTime() - a.getTime());
  const lastSeenCandidate = candidateDates[0] ?? null;

  const online = Boolean(
    record?.activeSession ||
      (lastLoginDate &&
        (!lastLogoutDate || lastLoginDate.getTime() >= lastLogoutDate.getTime()) &&
        now - lastLoginDate.getTime() <= onlineWindow),
  );

  return {
    lastLoginAt: lastLoginDate ? lastLoginDate.toISOString() : lastLoginAt,
    lastLogoutAt: lastLogoutDate ? lastLogoutDate.toISOString() : lastLogoutAt,
    lastSeenAt: lastSeenCandidate ? lastSeenCandidate.toISOString() : lastSeenAt ?? lastLoginAt,
    online,
  };
}

export function fallbackOnlineStatus(opts: {
  explicitOnline?: unknown;
  lastSeenAt?: string | null;
  lastLoginAt?: string | null;
  now?: number | Date;
  onlineWindowMs?: number;
}): boolean {
  const { explicitOnline, lastSeenAt, lastLoginAt, now: nowInput, onlineWindowMs } = opts;
  if (typeof explicitOnline === 'boolean') return explicitOnline;

  const candidate = lastSeenAt ?? lastLoginAt;
  if (!candidate) return false;

  const timestamp = new Date(candidate).getTime();
  if (!Number.isFinite(timestamp)) return false;

  const nowRaw = nowInput ?? Date.now();
  const now = nowRaw instanceof Date ? nowRaw.getTime() : Number(nowRaw) || Date.now();
  const window = onlineWindowMs ?? DEFAULT_ONLINE_WINDOW_MS;

  return now - timestamp <= window;
}
