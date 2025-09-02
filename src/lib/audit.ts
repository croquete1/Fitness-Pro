// src/lib/audit.ts
import { createServerClient } from '@/lib/supabaseServer';

export type AuditKind =
  | 'ACCOUNT_ROLE_CHANGE'
  | 'ACCOUNT_STATUS_CHANGE'
  | 'DATA_UPDATE'
  | 'TRAINING_PLAN_CREATE'
  | 'TRAINING_PLAN_CLONE'
  | 'EXERCISE_PUBLISH_TOGGLE';

export type AuditTargetType =
  | 'USER'
  | 'TRAINER_CLIENT'
  | 'TRAINING_PLAN'
  | 'EXERCISE'
  | 'PACKAGE'
  | 'OTHER';

export type LogAuditInput = {
  actorId: string;
  kind: AuditKind;
  message?: string;
  targetType?: AuditTargetType;
  targetId?: string | null;
  target?: string | null;
  diff?: any;
  meta?: Record<string, any>;
};

export async function logAudit(input: LogAuditInput) {
  try {
    const supabase = createServerClient();
    // Ajusta os nomes das colunas à tua tabela real de auditoria
    await supabase.from('audit_logs').insert({
      actor_id: input.actorId,
      kind: input.kind,
      message: input.message ?? null,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      target: input.target ?? null,
      diff: input.diff ?? null,
      meta: input.meta ?? null,
    });
  } catch (e) {
    // Nunca falhar build por causa de auditoria
    console.error('logAudit failed:', e);
  }
}