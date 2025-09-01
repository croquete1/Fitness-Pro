// src/lib/audit.ts
import prisma from '@/lib/prisma';
import { AuditKind } from '@prisma/client';

/** Alvos possíveis na auditoria — sempre UPPERCASE */
export type AuditTargetType =
  | 'USER'
  | 'TRAINING_PLAN'
  | 'TRAINER_CLIENT'
  | 'PACKAGE'
  | 'OTHER';

type LogAuditInput = {
  actorId?: string | null;
  kind: AuditKind;
  message: string;
  targetType: AuditTargetType;   // <- obrigatório (evita P2011)
  targetId?: string | null;
  diff?: unknown;
};

/** Função única para registar auditoria (tolerante a erro). */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        kind: input.kind,
        message: input.message,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        diff: (input.diff ?? null) as any,
      },
    });
  } catch (err) {
    // Não bloquear requests por falha de log
    console.error('[audit] failed', err);
  }
}

/** Alias para compatibilidade com imports antigos: `import { auditLog } from '@/lib/audit'` */
export const auditLog = logAudit;