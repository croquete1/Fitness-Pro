// src/lib/audit.ts
import prisma from '@/lib/prisma';
import { AuditKind } from '@prisma/client';

export type AuditTargetType =
  | 'USER'
  | 'TRAINER_CLIENT'
  | 'TRAINING_PLAN'
  | 'AUTH'
  | 'SYSTEM';

type Args = {
  actorId?: string | null;
  kind: AuditKind;
  message: string;            // texto curto do que aconteceu
  targetType: AuditTargetType; // <- NUNCA null
  targetId?: string | null;    // id do alvo, quando existir
  target?: string | null;      // texto alvo (email/nome/etc.)
  diff?: unknown;              // payload opcional (guardado em JSON)
};

/**
 * Helper único para auditoria. Garante targetType SEMPRE definido.
 * Mapeamentos no Prisma:
 *  - message -> action
 *  - diff    -> meta
 */
export async function auditLog(args: Args) {
  return prisma.auditLog.create({
    data: {
      actorId:   args.actorId ?? null,
      kind:      args.kind,
      message:   args.message,
      targetType: args.targetType,
      targetId:  args.targetId ?? null,
      target:    args.target ?? null,
      diff:      (args.diff ?? null) as any,
    },
  });
}

// Alias por retrocompatibilidade — corrige os imports antigos automaticamente.
export const logAudit = auditLog;