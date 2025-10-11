import { createServerClient } from '@/lib/supabaseServer';
import type { SupabaseClient } from '@supabase/supabase-js';

export const AUDIT_TABLE_CANDIDATES = ['audit_log', 'audit_logs', 'audits'] as const;

export function isMissingAuditTableError(error: unknown): boolean {
  if (!error) return false;
  const code = typeof error === 'object' && error && 'code' in error ? String((error as any).code ?? '') : '';
  if (code === '42P01') return true; // undefined_table
  const message =
    typeof error === 'object' && error && 'message' in error
      ? String((error as any).message ?? '')
      : '';
  const normalized = message.toLowerCase();
  return normalized.includes('relation') && normalized.includes('does not exist');
}

export const AUDIT_KINDS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  PUBLISH: 'PUBLISH',
  UNPUBLISH: 'UNPUBLISH',
  CLONE: 'CLONE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  APPROVE: 'APPROVE',
  SUSPEND: 'SUSPEND',
  INVITE: 'INVITE',
  RESET_PASSWORD: 'RESET_PASSWORD',
  OTHER: 'OTHER',

  EXERCISE_PUBLISH: 'EXERCISE_PUBLISH',
  EXERCISE_UNPUBLISH: 'EXERCISE_UNPUBLISH',

  TRAINING_PLAN_CREATE: 'TRAINING_PLAN_CREATE',
  TRAINING_PLAN_UPDATE: 'TRAINING_PLAN_UPDATE',
  TRAINING_PLAN_DELETE: 'TRAINING_PLAN_DELETE',
  TRAINING_PLAN_CLONE: 'TRAINING_PLAN_CLONE',
  TRAINING_PLAN_PUBLISH: 'TRAINING_PLAN_PUBLISH',
  TRAINING_PLAN_UNPUBLISH: 'TRAINING_PLAN_UNPUBLISH',

  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_SUSPEND: 'USER_SUSPEND',
  USER_APPROVE: 'USER_APPROVE',
} as const;
export type AuditKind = typeof AUDIT_KINDS[keyof typeof AUDIT_KINDS];

export const AUDIT_TARGET_TYPES = {
  USER: 'USER',
  TRAINING_PLAN: 'TRAINING_PLAN',
  EXERCISE: 'EXERCISE',
  SESSION: 'SESSION',
  NOTIFICATION: 'NOTIFICATION',
  SYSTEM: 'SYSTEM',
} as const;
export type AuditTargetType = typeof AUDIT_TARGET_TYPES[keyof typeof AUDIT_TARGET_TYPES];

type InsertLike = {
  kind?: AuditKind | string;
  target_type?: AuditTargetType | string;
  targetType?: AuditTargetType | string;
  target_id?: string | number | null;
  targetId?: string | number | null;
  actor_id?: string | null;
  actorId?: string | null;
  note?: string | null;
  message?: string | null;
  details?: unknown;
  metadata?: unknown;
  extra?: unknown;
  data?: unknown;
  diff?: unknown;
};

export function logAudit(client: SupabaseClient, payload: InsertLike): Promise<void>;
export function logAudit(payload: InsertLike): Promise<void>;
export async function logAudit(clientOrPayload: SupabaseClient | InsertLike, maybePayload?: InsertLike): Promise<void> {
  const sb = maybePayload ? (clientOrPayload as SupabaseClient) : createServerClient();
  const payload = (maybePayload ?? clientOrPayload) as InsertLike;

  const kind = String(payload.kind ?? AUDIT_KINDS.OTHER).toUpperCase();
  const target_type = String(payload.target_type ?? payload.targetType ?? AUDIT_TARGET_TYPES.SYSTEM).toUpperCase();

  const rawTargetId = payload.target_id ?? payload.targetId ?? null;
  const target_id =
    rawTargetId === undefined || rawTargetId === null || rawTargetId === ''
      ? null
      : String(rawTargetId);

  const actor_id = payload.actor_id ?? payload.actorId ?? null;
  const note = (payload.message ?? payload.note ?? null) as string | null;
  const details =
    payload.details ??
    payload.extra ??
    payload.metadata ??
    payload.data ??
    payload.diff ??
    null;

  const row = {
    kind,
    target_type,
    target_id,
    actor_id,
    note,
    details,
    created_at: new Date().toISOString(),
  };

  for (const table of AUDIT_TABLE_CANDIDATES) {
    try {
      const { error } = await sb.from(table as any).insert(row);
      if (!error) return;
      if (isMissingAuditTableError(error)) continue;
      console.warn(`[audit] falha ao escrever na tabela ${table}`, error);
      return;
    } catch (err) {
      if (isMissingAuditTableError(err)) continue;
      console.warn(`[audit] erro inesperado ao escrever na tabela ${table}`, err);
      return;
    }
  }
}
