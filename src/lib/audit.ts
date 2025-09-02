// src/lib/audit.ts
import { createServerClient } from '@/lib/supabaseServer';

/** Tipos de evento suportados no audit log */
export type AuditKind =
  | 'ACCOUNT_STATUS_CHANGE'
  | 'ACCOUNT_ROLE_CHANGE'
  | 'ACCOUNT_APPROVAL'
  // planos de treino
  | 'PLAN_CREATE'
  | 'PLAN_UPDATE'
  | 'PLAN_CLONE'
  | 'PLAN_PUBLISH'
  // catálogo de exercícios
  | 'EXERCISE_PUBLISH'
  | 'EXERCISE_UNPUBLISH';

/** Alvos possíveis do audit */
export type AuditTargetType =
  | 'USER'
  | 'TRAINING_PLAN'
  | 'EXERCISE'
  | 'PACKAGE'
  | 'WALLET';

/** Payload padrão para registos de auditoria */
export type AuditLogEntry = {
  actorId: string;
  kind: AuditKind;
  message: string;
  targetType: AuditTargetType;
  targetId?: string | null;
  diff?: unknown;
  context?: unknown;
};

/** Regista o evento no Supabase (tabela: audit_logs) */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  const supabase = createServerClient();
  try {
    await supabase.from('audit_logs').insert({
      actor_id: entry.actorId,
      kind: entry.kind,
      message: entry.message,
      target_type: entry.targetType,
      target_id: entry.targetId ?? null,
      diff: entry.diff ?? null,
      context: entry.context ?? null,
    });
  } catch {
    // Audit nunca deve rebentar a request principal.
  }
}