// src/lib/audit.ts
import { createServerClient } from '@/lib/supabaseServer';

export const AUDIT_KINDS = {
  // genéricos
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

  // específicos usados nas routes de admin
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
export type AuditTargetType =
  typeof AUDIT_TARGET_TYPES[keyof typeof AUDIT_TARGET_TYPES];

type InsertLike = {
  kind?: AuditKind | string;

  // aceitar snake_case e camelCase
  target_type?: AuditTargetType | string;
  targetType?: AuditTargetType | string;

  target_id?: string | number | null;
  targetId?: string | number | null;

  actor_id?: string | null;
  actorId?: string | null;

  // aliases comuns nas rotas
  note?: string | null;
  message?: string | null;

  details?: unknown;
  metadata?: unknown;
  extra?: unknown;
  data?: unknown;
};

/**
 * logAudit – inserção tolerante (no-op se a tabela não existir).
 * Pode ser chamado como:
 *   await logAudit({ kind, target_type, target_id, actorId, message, details })
 * ou  await logAudit(sb, { ... })  // passando um supabase server client
 */
export async function logAudit(
  clientOrPayload: any,
  maybePayload?: InsertLike
): Promise<void> {
  const sb = maybePayload ? clientOrPayload : createServerClient();
  const payload = (maybePayload ?? clientOrPayload) as InsertLike;

  // Normalização de campos/valores
  const kind = String(payload.kind ?? AUDIT_KINDS.OTHER).toUpperCase();

  const target_type = String(
    (payload as any).target_type ?? payload.targetType ?? AUDIT_TARGET_TYPES.SYSTEM
  ).toUpperCase();

  const rawTargetId =
    (payload as any).target_id ?? payload.targetId ?? null;
  const target_id =
    rawTargetId === undefined || rawTargetId === null || rawTargetId === ''
      ? null
      : String(rawTargetId);

  const actor_id = (payload as any).actor_id ?? payload.actorId ?? null;

  // aceitar "message" como alias de note
  const note = (payload.message ?? payload.note ?? null) as string | null;

  // aceitar vários aliases para detalhes
  const details =
    payload.details ?? payload.extra ?? payload.metadata ?? payload.data ?? null;

  const row = {
    kind,
    target_type,
    target_id,
    actor_id,
    note,
    details,
    created_at: new Date().toISOString(),
  };

  // Inserção tolerante: tenta comuns e não rebenta a request se falhar
  const candidateTables = ['audit_log', 'audit_logs', 'audits'];
  for (const table of candidateTables) {
    try {
      const { error } = await sb.from(table as any).insert(row);
      if (!error) return; // sucesso
      const msg = String(error.message || '').toLowerCase();
      if (msg.includes('relation') && msg.includes('does not exist')) continue;
      return; // outro erro → sair silenciosamente
    } catch {
      continue;
    }
  }
  // sem tabela → no-op
}
