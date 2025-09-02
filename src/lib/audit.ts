// src/lib/audit.ts
import { createServerClient } from '@/lib/supabaseServer';

/**
 * Enums “case-safe” para evitar dependência do Prisma.
 * Mantém os nomes que já usas no projeto.
 */
export const AUDIT_KINDS = {
  ACCOUNT_STATUS_CHANGE: 'ACCOUNT_STATUS_CHANGE',
  ACCOUNT_ROLE_CHANGE: 'ACCOUNT_ROLE_CHANGE',
  ACCOUNT_APPROVAL: 'ACCOUNT_APPROVAL',

  EXERCISE_PUBLISH: 'EXERCISE_PUBLISH',
  EXERCISE_UNPUBLISH: 'EXERCISE_UNPUBLISH',

  TRAINING_PLAN_CREATE: 'TRAINING_PLAN_CREATE', // ✅ ADICIONADO
  TRAINING_PLAN_CLONE: 'TRAINING_PLAN_CLONE',
  TRAINING_PLAN_UPDATE: 'TRAINING_PLAN_UPDATE', // opcional, caso uses noutros pontos
} as const;

export type AuditKind = typeof AUDIT_KINDS[keyof typeof AUDIT_KINDS];

export const AUDIT_TARGET_TYPES = {
  USER: 'USER',
  EXERCISE: 'EXERCISE',
  TRAINING_PLAN: 'TRAINING_PLAN',
  TRAINER_CLIENT: 'TRAINER_CLIENT',
} as const;

export type AuditTargetType =
  typeof AUDIT_TARGET_TYPES[keyof typeof AUDIT_TARGET_TYPES];

export type AuditEntry = {
  actorId: string | null;
  kind: AuditKind;
  message?: string;
  targetType: AuditTargetType;
  targetId: string | null;
  diff?: Record<string, any> | null;
};

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = createServerClient();

    // Tenta inserir na tabela canónica "audit_logs".
    // Se a tua tabela tiver outro nome, ajusta aqui uma única vez.
    const { error } = await supabase.from('audit_logs').insert({
      actor_id: entry.actorId,
      kind: entry.kind,
      message: entry.message ?? null,
      target_type: entry.targetType,
      target_id: entry.targetId,
      diff: entry.diff ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Fallback simples para não “rebentar” a app caso tabela não exista.
      console.warn('[audit] insert falhou, fallback para console:', error.message);
      console.info('[audit] entry:', entry);
    }
  } catch (err) {
    console.warn('[audit] erro inesperado:', err);
  }
}