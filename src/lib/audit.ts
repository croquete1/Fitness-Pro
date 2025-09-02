// src/lib/audit.ts
import { createServerClient } from '@/lib/supabaseServer';

export type AuditKind =
  | 'ACCOUNT_STATUS_CHANGE'
  | 'ACCOUNT_ROLE_CHANGE'
  | 'ACCOUNT_APPROVAL'
  | 'EXERCISE_PUBLISH'
  | 'EXERCISE_UNPUBLISH'
  | 'PLAN_UPDATE'
  | 'TRAINING_PLAN_CLONE'; // ✅ adicionado

export type AuditTargetType =
  | 'USER'
  | 'EXERCISE'
  | 'TRAINING_PLAN'
  | 'PACKAGE'
  | 'TRAINER_CLIENT'; // já tínhamos adicionado

type AuditEntry = {
  actorId: string;
  kind: AuditKind;
  message: string;
  targetType: AuditTargetType;
  targetId: string;
  diff?: unknown;
};

export async function logAudit(entry: AuditEntry) {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from('audit_log').insert({
      actor_id: entry.actorId,
      kind: entry.kind,
      message: entry.message,
      target_type: entry.targetType,
      target_id: entry.targetId,
      diff: entry.diff ?? null,
      created_at: new Date().toISOString(),
    });
    if (error) console.error('[audit] insert error', error);
  } catch (e) {
    console.error('[audit] unexpected error', e);
  }
}