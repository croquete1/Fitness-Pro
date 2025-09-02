// src/lib/audit.ts
import { createServerClient } from '@/lib/supabaseServer';

/** Valores aceites para o campo "kind" do audit log */
export const AUDIT_KINDS = {
  ACCOUNT_ROLE_CHANGE: 'ACCOUNT_ROLE_CHANGE',
  ACCOUNT_STATUS_CHANGE: 'ACCOUNT_STATUS_CHANGE',
  ACCOUNT_APPROVAL: 'ACCOUNT_APPROVAL',
  PLAN_CREATE: 'PLAN_CREATE',
  PLAN_UPDATE: 'PLAN_UPDATE',
  TRAINING_PLAN_CLONE: 'TRAINING_PLAN_CLONE',
  EXERCISE_PUBLISH: 'EXERCISE_PUBLISH',
} as const;
export type AuditKind = typeof AUDIT_KINDS[keyof typeof AUDIT_KINDS];

/** Tipos de alvo que registamos no audit */
export const AUDIT_TARGET_TYPES = {
  USER: 'USER',
  TRAINING_PLAN: 'TRAINING_PLAN',
  TRAINER_CLIENT_LINK: 'TRAINER_CLIENT_LINK', // ligação PT <-> cliente
  EXERCISE: 'EXERCISE',
} as const;
export type AuditTargetType =
  typeof AUDIT_TARGET_TYPES[keyof typeof AUDIT_TARGET_TYPES];

export type AuditEntry = {
  kind: AuditKind;
  message: string;
  actorId: string | null;
  targetType: AuditTargetType;
  targetId: string | null;
  targetLabel?: string | null;
  diff?: Record<string, any> | null;
};

/** Envia o registo para a tabela audit_logs (ignora erros para não quebrar a request) */
export async function logAudit(entry: AuditEntry) {
  try {
    const sb = createServerClient();
    await sb.from('audit_logs').insert({
      kind: entry.kind,
      message: entry.message,
      actor_id: entry.actorId,
      target_type: entry.targetType,
      target_id: entry.targetId,
      target_label: entry.targetLabel ?? null,
      diff: entry.diff ?? null,
    });
  } catch (err) {
    console.warn('[audit] logAudit falhou (ignorado):', (err as Error)?.message ?? err);
  }
}