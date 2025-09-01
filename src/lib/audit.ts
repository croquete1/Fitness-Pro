// src/lib/audit.ts
import prisma from '@/lib/prisma';
import { AuditKind } from '@prisma/client';

/**
 * Mantém um conjunto pequeno e estável de alvos de auditoria.
 * Usa UPPERCASE para coincidir com os usos nos handlers/rotas.
 */
export type AuditTargetType = 'USER' | 'TRAINING_PLAN' | 'TRAINER_CLIENT' | 'PACKAGE' | 'OTHER';

type LogAuditInput = {
  actorId?: string | null;
  kind: AuditKind;
  message: string;
  targetType: AuditTargetType;        // <- OBRIGATÓRIO (evita P2011)
  targetId?: string | null;
  diff?: unknown;                     // { before, after } ou outro payload
};

/**
 * Grava um registo de auditoria. Nunca rebenta a request:
 * se a escrita falhar, faz console.error e continua.
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        kind: input.kind,
        message: input.message,
        targetType: input.targetType, // <- SEMPRE definido
        targetId: input.targetId ?? null,
        diff: input.diff as any ?? null,
      },
    });
  } catch (err) {
    console.error('[audit] failed', err);
  }
}