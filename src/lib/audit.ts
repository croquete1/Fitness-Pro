// src/lib/audit.ts
import prisma from '@/lib/prisma';
import { AuditKind } from '@prisma/client';

/** Tipos de alvo suportados nos logs (MAIÚSCULAS) */
export type AuditTargetType =
  | 'USER'
  | 'TRAINING_PLAN'
  | 'TRAINER_CLIENT'
  | 'ANTHROPOMETRY';

/** Payload aceite pelo utilitário de auditoria */
export type LogAuditInput = {
  actorId?: string | null;        // quem executou a ação
  kind: AuditKind;                // tipo (enum Prisma)
  message: string;                // descrição humana
  targetType?: AuditTargetType | null; // categoria do alvo (opcional)
  targetId?: string | null;       // id do alvo (opcional)
  target?: string | null;         // rótulo do alvo (ex: email/nome) — opcional
  diff?: unknown;                 // metadados/diff (JSON)
};

/** Escreve um registo de auditoria */
export async function logAudit(input: LogAuditInput) {
  const { actorId, kind, message, targetType, targetId, target, diff } = input;

  await prisma.auditLog.create({
    data: {
      actorId: actorId ?? null,
      kind,
      message,
      targetType: targetType ?? null,
      targetId: targetId ?? null,
      target: target ?? null,
      // Json aceita undefined (não grava) ou null (grava null)
      diff: diff === undefined ? undefined : (diff as any),
    },
  });
}

/** Alias para retrocompatibilidade com imports antigos */
export { logAudit as auditLog };